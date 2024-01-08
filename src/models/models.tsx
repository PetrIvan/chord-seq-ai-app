import * as ort from "onnxruntime-web";
import { tokenToChord } from "@/data/token_to_chord";
import { useStore } from "@/state/use_store";

// Add a special token for the start and end of the sequence
const numTokens = Object.keys(tokenToChord).length + 2;

// Cache the predictions to avoid running the model too many times
let predictionCache = new Map<string, { token: number; prob: number }[]>();
const maxCacheSize = 32;

// A global variable to store the model (avoids loading it every time we want to make a prediction)
let currentSession: ort.InferenceSession | null = null;
let prevModelPath = "";

// Process the chords into a tensor that can be fed into the model
function process_chords(
  chords: {
    index: number;
    token: number;
    duration: number;
    variant: number;
  }[]
) {
  const data = new BigInt64Array(256).fill(BigInt(0));

  data[0] = BigInt(numTokens - 2); // Start token
  let i = 1;
  for (let j = 0; j < chords.length; j++) {
    if (chords[j].token === -1 || BigInt(chords[j].token) === data[i - 1])
      continue;
    if (i >= 255) {
      throw new Error("sequence is too long");
    }
    data[i] = BigInt(chords[j].token);
    i++;
  }
  // End token is not included

  return [i, new ort.Tensor("int64", data, [1, 256])];
}

// After inference, the output is a 3D tensor, but we only need the column corresponding to the last chord
function getColumnSlice(tensor: any, columnIndex: number): Float32Array {
  const [D1, D2, D3] = tensor.dims;

  if (columnIndex < 0 || columnIndex >= D2) {
    throw new Error("column index out of bounds");
  }

  const slice = new Float32Array(D3);

  for (let k = 0; k < D3; k++) {
    const index = columnIndex * D3 + k;
    slice[k] = tensor.data[index];
  }

  return slice;
}

function softmax(arr: Float32Array) {
  const exps = arr.map((x) => Math.exp(x));
  const sumExps = exps.reduce((sum, x) => sum + x);
  return exps.map((x) => x / sumExps);
}

export async function predict(
  chords: {
    index: number;
    token: number;
    duration: number;
    variant: number;
  }[],
  modelPath: string,
  style?: number[]
) {
  // Process data
  if (chords.length === 0) {
    chords = [{ index: 0, token: -1, duration: 1, variant: 0 }];
  }
  const [numChords, data] = process_chords(chords);

  // Check cache
  let strData = "";
  for (let i = 0; i < (numChords as number); i++) {
    strData += (data as ort.Tensor).data[i].toString() + " ";
  }
  strData += modelPath; // The predictions depend on the model used
  if (style) {
    strData += style.join(" ");
  }
  if (predictionCache.has(strData)) {
    return predictionCache.get(strData);
  }

  // Load the model (if necessary)
  if (modelPath !== prevModelPath) {
    await loadModel(modelPath);
    prevModelPath = modelPath;
  }

  if (!currentSession) {
    throw new Error("model not loaded");
  }

  // Inference based on the model
  let outputs = null;
  if (style) {
    outputs = await currentSession.run({
      "input.1": data as ort.Tensor,
      "onnx::Gemm_1": new ort.Tensor(
        "float32",
        new Float32Array(style),
        [1, 28]
      ),
    });
  } else {
    outputs = await currentSession.run({
      "input.1": data as ort.Tensor,
    });
  }
  const outputTensor = Object.values(outputs)[0];

  /* Process the output */
  const column = getColumnSlice(outputTensor, (numChords as number) - 1); // Only a single column is needed

  // Zero out the start and end tokens, as well as the previous chord
  column[numTokens - 1] = -Infinity;
  column[numTokens - 2] = -Infinity;
  column[chords[chords.length - 1].token] = -Infinity;

  // Get the softmax probabilities
  const probs = softmax(column);

  // Convert it to the wanted format, skip the start and end tokens
  const chordProbs = [];
  for (let i = 0; i < probs.length - 2; i++) {
    if (i == chords[chords.length - 1].token) continue;

    chordProbs.push({ token: i, prob: probs[i] });
  }
  chordProbs.sort((a, b) => b.prob - a.prob);

  // Cache the result
  predictionCache.set(strData, chordProbs);

  // Clear the first element of the cache if it's too big
  if (predictionCache.size > maxCacheSize) {
    predictionCache.delete(predictionCache.keys().next().value);
  }

  return chordProbs;
}

async function loadModel(modelPath: string) {
  useStore.getState().setPercentageDownloaded(0);
  useStore.getState().setIsDownloadingModel(true);

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

  const reader = response?.body?.getReader();
  let chunks = [];

  if (!reader) {
    throw new Error("Failed to get response body reader.");
  }
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    loaded += value.byteLength;
    useStore.getState().setPercentageDownloaded(loaded / total);
    chunks.push(value);
  }

  const blob = new Blob(chunks);
  const buffer = await blob.arrayBuffer();
  useStore.getState().setIsDownloadingModel(false);

  useStore.getState().setIsLoadingSession(true);
  currentSession = await ort.InferenceSession.create(buffer);
  useStore.getState().setIsLoadingSession(false);
}
