import * as ort from "onnxruntime-web/webgpu";

// A global variable to store the model (avoids loading it every time we want to make a prediction)
let currentSession: ort.InferenceSession | null = null;

self.onmessage = async (event) => {
  const { modelPath, data, style, action } = event.data;

  if (action === "loadModel") {
    self.postMessage({ status: "setDownloadingModel", value: true });
    self.postMessage({ status: "setPercentageDownloaded", value: 0 });

    const response = await fetch(modelPath);
    if (!response.ok) {
      throw new Error(`Failed to fetch model: ${response.statusText}.`);
    }

    const contentLength = response.headers.get("content-length");
    if (!contentLength) {
      throw new Error("Failed to get content length from response headers.");
    }

    const total = parseInt(contentLength, 10);
    let loaded = 0;
    // Set size in MB
    self.postMessage({ status: "setModelSize", value: total / 1024 / 1024 });

    // Track download progress
    const reader = response?.body?.getReader();
    let chunks = [];

    if (!reader) {
      throw new Error("Failed to get response body reader.");
    }
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      loaded += value.byteLength;
      self.postMessage({
        status: "setPercentageDownloaded",
        value: loaded / total,
      });
      chunks.push(value);
    }

    const blob = new Blob(chunks);
    const buffer = await blob.arrayBuffer();
    self.postMessage({ status: "setDownloadingModel", value: false });

    self.postMessage({ status: "setIsLoadingSession", value: true });
    currentSession = await ort.InferenceSession.create(buffer, {
      executionProviders: ["webgpu", "wasm"],
    });
    self.postMessage({ status: "setIsLoadingSession", value: false });

    self.postMessage({ status: "modelLoaded" });
  } else if (action === "predict" && currentSession) {
    // Inference based on the model
    let outputs = null;
    if (style) {
      outputs = await currentSession.run({
        "input.1": new ort.Tensor("int64", data, [1, 256]),
        "onnx::Gemm_1": new ort.Tensor(
          "float32",
          new Float32Array(style),
          [1, 28]
        ),
      });
    } else {
      outputs = await currentSession.run({
        "input.1": new ort.Tensor("int64", data, [1, 256]),
      });
    }
    const outputTensor = Object.values(outputs)[0];

    self.postMessage({ output: outputTensor });
  }
};
