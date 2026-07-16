import * as ort from "onnxruntime-web/webgpu";

// Serve the WebAssembly binaries as static assets from /wasm/ (populated by
// scripts/copy-ort-wasm.mjs). Without this, ORT resolves them relative to the
// worker chunk URL, where they don't exist under static export.
ort.env.wasm.wasmPaths = "/wasm/";
// GitHub Pages can't send COOP/COEP headers, so SharedArrayBuffer (and threaded
// wasm) isn't available. Pin to a single thread; WebGPU is the primary EP and
// single-threaded wasm is the fallback.
ort.env.wasm.numThreads = 1;

type PredictionRequest = {
  action: "predict";
  requestId: number;
  modelPath: string;
  data: BigInt64Array;
  style?: number[];
};

let currentSession: ort.InferenceSession | null = null;
let currentModelPath = "";
let currentModelBuffer: ArrayBuffer | null = null;
let usingWasm = false;

function postStatus(requestId: number, status: string, value: unknown) {
  self.postMessage({ requestId, status, value });
}

async function loadModel(requestId: number, modelPath: string) {
  if (currentModelPath === modelPath && currentModelBuffer) return;

  postStatus(requestId, "setDownloadingModel", true);
  postStatus(requestId, "setPercentageDownloaded", 0);
  postStatus(requestId, "setModelSize", 0);

  try {
    const url = new URL(modelPath, self.location.origin);
    const modelName = /^\/models\/([^/]+)\.onnx$/.exec(url.pathname)?.[1] || "";
    if (!modelName) throw new Error("Invalid model path.");

    const response = await fetch(
      `${self.location.origin}/models/${modelName}.onnx`,
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch model: ${response.statusText}.`);
    }

    const contentLength = response.headers.get("content-length");
    const total = contentLength ? parseInt(contentLength, 10) : 0;
    let loaded = 0;
    if (total > 0) {
      postStatus(requestId, "setModelSize", total / 1024 / 1024);
    }

    // Cached responses may omit Content-Length or expose no body reader. They
    // are still valid and should not be treated as model failures.
    const reader = response.body?.getReader();
    let buffer: ArrayBuffer;
    if (reader) {
      const chunks: ArrayBuffer[] = [];
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        loaded += value.byteLength;
        postStatus(
          requestId,
          "setPercentageDownloaded",
          total > 0 ? loaded / total : 0,
        );
        const chunk = new Uint8Array(value.byteLength);
        chunk.set(value);
        chunks.push(chunk.buffer);
      }
      buffer = await new Blob(chunks).arrayBuffer();
    } else {
      buffer = await response.arrayBuffer();
    }

    currentModelPath = modelPath;
    currentModelBuffer = buffer;
    currentSession = null;
    usingWasm = false;
  } finally {
    postStatus(requestId, "setDownloadingModel", false);
  }
}

async function createSession(requestId: number, forceWasm: boolean) {
  if (!currentModelBuffer) throw new Error("Model not loaded.");

  postStatus(requestId, "setIsLoadingSession", true);
  try {
    currentSession = await ort.InferenceSession.create(currentModelBuffer, {
      // Select one provider at a time so a successful session identifies the
      // active backend unambiguously. Fallback is handled explicitly below.
      executionProviders: forceWasm ? ["wasm"] : ["webgpu"],
    });
    usingWasm = forceWasm;
  } finally {
    postStatus(requestId, "setIsLoadingSession", false);
  }
}

function createFeeds(
  data: BigInt64Array,
  style?: number[],
): Record<string, ort.Tensor> {
  const feeds: Record<string, ort.Tensor> = {
    "input.1": new ort.Tensor("int64", data, [1, 256]),
  };
  if (style) {
    feeds["onnx::Gemm_1"] = new ort.Tensor(
      "float32",
      new Float32Array(style),
      [1, 28],
    );
  }
  return feeds;
}

async function runCurrentSession(data: BigInt64Array, style?: number[]) {
  if (!currentSession) throw new Error("Model not loaded.");

  const device = usingWasm ? undefined : await ort.env.webgpu.device;
  const run = currentSession.run(createFeeds(data, style));
  if (!device) return run;

  const deviceLost = device.lost.then((info) => {
    const details = info.message || info.reason || "unknown reason";
    throw new Error(`WebGPU device lost: ${details}`);
  });
  return Promise.race([run, deviceLost]);
}

async function handlePrediction(request: PredictionRequest) {
  await loadModel(request.requestId, request.modelPath);

  if (!currentSession) {
    try {
      await createSession(request.requestId, false);
    } catch {
      // Session creation explicitly failed with the preferred providers.
      await createSession(request.requestId, true);
    }
  }

  let outputs: ort.InferenceSession.OnnxValueMapType;
  try {
    outputs = await runCurrentSession(request.data, request.style);
  } catch (webGpuError) {
    if (usingWasm) throw webGpuError;

    // Retry only after an explicit WebGPU inference failure or device-loss
    // signal. Slow inference alone is never classified as failure.
    await createSession(request.requestId, true);
    try {
      outputs = await runCurrentSession(request.data, request.style);
    } catch (wasmError) {
      const webGpuMessage =
        webGpuError instanceof Error
          ? webGpuError.message
          : String(webGpuError);
      const wasmMessage =
        wasmError instanceof Error ? wasmError.message : String(wasmError);
      throw new Error(
        `WebGPU inference failed (${webGpuMessage}); WebAssembly fallback failed (${wasmMessage}).`,
      );
    }
  }

  const output = Object.values(outputs)[0];
  self.postMessage({ requestId: request.requestId, output });
}

function reportError(requestId: number, error: unknown) {
  postStatus(requestId, "setDownloadingModel", false);
  postStatus(requestId, "setIsLoadingSession", false);
  self.postMessage({
    requestId,
    status: "error",
    message: error instanceof Error ? error.message : String(error),
  });
}

self.onmessage = async (event: MessageEvent<PredictionRequest>) => {
  const request = event.data;
  try {
    await handlePrediction(request);
  } catch (error) {
    reportError(request.requestId, error);
  }
};
