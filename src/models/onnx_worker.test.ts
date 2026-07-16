import { beforeEach, describe, expect, it, vi } from "vitest";

const ortMock = vi.hoisted(() => ({
  createSession: vi.fn(),
}));

vi.mock("onnxruntime-web/webgpu", () => ({
  env: {
    wasm: {},
    webgpu: { device: Promise.resolve(undefined) },
  },
  InferenceSession: { create: ortMock.createSession },
  Tensor: class Tensor {
    constructor(
      public type: string,
      public data: unknown,
      public dims: number[],
    ) {}
  },
}));

type FakeWorkerScope = {
  location: { origin: string };
  postMessage: ReturnType<typeof vi.fn>;
  onmessage: ((event: MessageEvent) => void) | null;
};

function predictionRequest(requestId = 7) {
  return {
    action: "predict",
    requestId,
    modelPath: "/models/recurrent_net.onnx",
    data: new BigInt64Array(256),
  };
}

describe("onnx worker", () => {
  let workerScope: FakeWorkerScope;

  beforeEach(async () => {
    vi.resetModules();
    ortMock.createSession.mockReset();
    workerScope = {
      location: { origin: "https://chordseqai.test" },
      postMessage: vi.fn(),
      onmessage: null,
    };
    vi.stubGlobal("self", workerScope);
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(new Uint8Array([1, 2, 3, 4]), {
          status: 200,
          headers: { "content-length": "4" },
        }),
      ),
    );

    await import("./onnx_worker");
  });

  it("retries an explicit WebGPU failure with WASM and preserves the request ID", async () => {
    const webGpuRun = vi.fn().mockRejectedValue(new Error("GPU device lost"));
    const wasmOutput = { output: { dims: [1, 1, 4] } };
    const wasmRun = vi.fn().mockResolvedValue(wasmOutput);
    ortMock.createSession
      .mockResolvedValueOnce({ run: webGpuRun })
      .mockResolvedValueOnce({ run: wasmRun });

    workerScope.onmessage?.({ data: predictionRequest() } as MessageEvent);

    await vi.waitFor(() => {
      expect(workerScope.postMessage).toHaveBeenCalledWith({
        requestId: 7,
        output: wasmOutput.output,
      });
    });
    expect(ortMock.createSession).toHaveBeenNthCalledWith(
      1,
      expect.any(ArrayBuffer),
      { executionProviders: ["webgpu"] },
    );
    expect(ortMock.createSession).toHaveBeenNthCalledWith(
      2,
      expect.any(ArrayBuffer),
      { executionProviders: ["wasm"] },
    );
  });

  it("reports a correlated error when the explicit WASM fallback also fails", async () => {
    ortMock.createSession
      .mockResolvedValueOnce({
        run: vi.fn().mockRejectedValue(new Error("GPU device lost")),
      })
      .mockResolvedValueOnce({
        run: vi.fn().mockRejectedValue(new Error("WASM execution failed")),
      });

    workerScope.onmessage?.({ data: predictionRequest(11) } as MessageEvent);

    await vi.waitFor(() => {
      expect(workerScope.postMessage).toHaveBeenCalledWith({
        requestId: 11,
        status: "error",
        message: expect.stringContaining("WASM execution failed"),
      });
    });
  });
});
