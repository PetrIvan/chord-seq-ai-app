import { Mp3Encoder } from "@breezystack/lamejs";

// Pure audio encoders: AudioBuffer (PCM float samples) -> WAV/MP3 bytes. These
// carry the real, testable logic (clamping, interleaving, MP3 framing) and have
// no dependency on Tone or the audio engine, so they live apart from
// audio_render.tsx (which owns the Tone offline render that produces the buffer).

const MP3_KBPS = 192;

// Clamp a float sample to [-1, 1] and scale it to a signed 16-bit integer.
export function floatToInt16(input: Float32Array): Int16Array {
  const output = new Int16Array(input.length);
  for (let i = 0; i < input.length; i++) {
    const s = Math.max(-1, Math.min(1, input[i]));
    output[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  return output;
}

// Encode an AudioBuffer as a 16-bit PCM WAV file. Lossless and dependency-free,
// at the cost of file size - the best format for importing into a DAW.
export function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const numSamples = buffer.length;
  const bytesPerSample = 2;
  const blockAlign = numChannels * bytesPerSample;
  const dataSize = numSamples * blockAlign;

  const arrayBuffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(arrayBuffer);

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeString(0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true); // PCM chunk size
  view.setUint16(20, 1, true); // audio format: PCM
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true); // byte rate
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true); // bits per sample
  writeString(36, "data");
  view.setUint32(40, dataSize, true);

  // Convert each channel to 16-bit once, then interleave into the data chunk.
  const channels: Int16Array[] = [];
  for (let ch = 0; ch < numChannels; ch++) {
    channels.push(floatToInt16(buffer.getChannelData(ch)));
  }

  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      view.setInt16(offset, channels[ch][i], true);
      offset += 2;
    }
  }

  return new Blob([view], { type: "audio/wav" });
}

// Encode an AudioBuffer as MP3 via lamejs (pure-JS, runs in the browser since
// the app is a static export with no server). Smaller and easier to share than
// WAV, which is what the feature request asked for.
export function audioBufferToMp3(buffer: AudioBuffer): Blob {
  const numChannels = Math.min(buffer.numberOfChannels, 2);
  const encoder = new Mp3Encoder(numChannels, buffer.sampleRate, MP3_KBPS);

  const left = floatToInt16(buffer.getChannelData(0));
  const right =
    numChannels > 1 ? floatToInt16(buffer.getChannelData(1)) : undefined;

  const blockSize = 1152; // lamejs encodes in 1152-sample frames
  const chunks: Uint8Array[] = [];

  for (let i = 0; i < left.length; i += blockSize) {
    const leftChunk = left.subarray(i, i + blockSize);
    const mp3buf = right
      ? encoder.encodeBuffer(leftChunk, right.subarray(i, i + blockSize))
      : encoder.encodeBuffer(leftChunk);
    if (mp3buf.length > 0) chunks.push(new Uint8Array(mp3buf));
  }

  const flushed = encoder.flush();
  if (flushed.length > 0) chunks.push(new Uint8Array(flushed));

  return new Blob(chunks as BlobPart[], { type: "audio/mpeg" });
}
