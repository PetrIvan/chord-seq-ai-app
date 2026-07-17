import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const workers: FakeWorker[] = [];
const storeMock = vi.hoisted(() => ({
  setIsDownloadingModel: vi.fn(),
  setPercentageDownloaded: vi.fn(),
  setModelSize: vi.fn(),
  setIsLoadingSession: vi.fn(),
}));

class FakeWorker {
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: ErrorEvent) => void) | null = null;
  postMessage = vi.fn();
  terminate = vi.fn();

  constructor() {
    workers.push(this);
  }
}

vi.mock("onnxruntime-web/webgpu", () => ({}));
vi.mock("@/data/token_to_chord", () => ({
  tokenToChord: {
    0: ["C4"],
    1: ["D4"],
  },
}));
vi.mock("@/data/transposition_map", () => ({
  transpositionMap: {
    0: [0],
    1: [1],
  },
}));
vi.mock("@/state/use_store", () => ({
  useStore: {
    getState: () => storeMock,
  },
}));

describe("predict", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubGlobal("Worker", FakeWorker);
    workers.length = 0;
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("rejects the matching prediction when the worker reports an async error", async () => {
    const { predict } = await import("./models");
    const prediction = predict([], "/models/recurrent_net.onnx");
    const request = workers[0].postMessage.mock.calls[0][0];

    expect(request).toMatchObject({
      action: "predict",
      requestId: 1,
      modelPath: "/models/recurrent_net.onnx",
    });

    workers[0].onmessage?.({
      data: {
        requestId: request.requestId,
        status: "error",
        message: "WebGPU device was lost.",
      },
    } as MessageEvent);

    await expect(prediction).rejects.toThrow("WebGPU device was lost.");
    expect(workers[0].terminate).toHaveBeenCalledOnce();
  });

  it("recreates a crashed worker lazily instead of entering a restart loop", async () => {
    const { predict } = await import("./models");

    workers[0].onerror?.({
      message: "Missing worker bootstrap config",
    } as ErrorEvent);

    expect(workers).toHaveLength(1);
    expect(workers[0].terminate).toHaveBeenCalledOnce();

    const retry = predict([], "/models/recurrent_net.onnx");

    expect(workers).toHaveLength(2);
    expect(workers[1].postMessage).toHaveBeenCalledOnce();

    workers[1].onerror?.({
      message: "Missing worker bootstrap config",
    } as ErrorEvent);

    await expect(retry).rejects.toThrow("Missing worker bootstrap config");
    expect(workers).toHaveLength(2);
  });

  it("cancels active work out-of-band when a newer prediction starts", async () => {
    const { predict } = await import("./models");
    const first = predict([], "/models/recurrent_net.onnx");
    const second = predict(
      [{ index: 0, token: 0, duration: 1, variant: 0 }],
      "/models/transformer_small.onnx",
    );
    const firstRequest = workers[0].postMessage.mock.calls[0][0];
    const secondRequest = workers[1].postMessage.mock.calls[0][0];

    expect(workers[0].terminate).toHaveBeenCalledOnce();
    expect(firstRequest.requestId).not.toBe(secondRequest.requestId);
    await expect(first).rejects.toThrow("Prediction superseded.");

    workers[1].onmessage?.({
      data: {
        requestId: secondRequest.requestId,
        output: {
          dims: [1, 2, 4],
          cpuData: new Float32Array([0, 0, 0, 0, 0, 1, 0, 0]),
        },
      },
    } as MessageEvent);

    const secondResult = await second;
    expect(secondResult[0]).toMatchObject({ token: 1 });
  });

  it("invalidates active progress before returning a cached prediction", async () => {
    const { predict } = await import("./models");
    const cachedInput = predict([], "/models/recurrent_net.onnx");
    const cachedRequest = workers[0].postMessage.mock.calls[0][0];

    workers[0].onmessage?.({
      data: {
        requestId: cachedRequest.requestId,
        output: {
          dims: [1, 1, 4],
          cpuData: new Float32Array([1, 0, 0, 0]),
        },
      },
    } as MessageEvent);
    const cachedResult = await cachedInput;

    const obsolete = predict(
      [{ index: 0, token: 0, duration: 1, variant: 0 }],
      "/models/transformer_small.onnx",
    );
    const obsoleteRequest = workers[0].postMessage.mock.calls[1][0];
    const fromCache = await predict([], "/models/recurrent_net.onnx");

    await expect(obsolete).rejects.toThrow("Prediction superseded.");
    expect(fromCache).toEqual(cachedResult);

    storeMock.setIsLoadingSession.mockClear();
    workers[0].onmessage?.({
      data: {
        requestId: obsoleteRequest.requestId,
        status: "setIsLoadingSession",
        value: true,
      },
    } as MessageEvent);

    expect(storeMock.setIsLoadingSession).not.toHaveBeenCalled();
  });
});
