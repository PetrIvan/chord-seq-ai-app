export const BYTES_PER_MEBIBYTE = 1024 * 1024;

export type ModelOption = {
  name: string;
  path: string;
  sizeBytes: number;
};

export const modelOptions: ModelOption[] = [
  {
    name: "Recurrent Network",
    path: "/models/recurrent_net.onnx",
    sizeBytes: 1_517_510,
  },
  {
    name: "Transformer S",
    path: "/models/transformer_small.onnx",
    sizeBytes: 4_696_506,
  },
  {
    name: "Transformer M",
    path: "/models/transformer_medium.onnx",
    sizeBytes: 9_879_193,
  },
  {
    name: "Transformer L",
    path: "/models/transformer_large.onnx",
    sizeBytes: 18_597_468,
  },
  {
    name: "Conditional Transformer S",
    path: "/models/conditional_small.onnx",
    sizeBytes: 4_805_492,
  },
  {
    name: "Conditional Transformer M",
    path: "/models/conditional_medium.onnx",
    sizeBytes: 10_075_979,
  },
  {
    name: "Conditional Transformer L",
    path: "/models/conditional_large.onnx",
    sizeBytes: 18_921_824,
  },
];

export function getModelSizeBytes(modelPath: string): number | undefined {
  return modelOptions.find((model) => model.path === modelPath)?.sizeBytes;
}

export function bytesToMebibytes(bytes: number): number {
  return bytes / BYTES_PER_MEBIBYTE;
}
