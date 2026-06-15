import { describe, it, expect } from "vitest";

import {
  floatToInt16,
  audioBufferToWav,
  audioBufferToMp3,
} from "./audio_encoders";

// Minimal stand-in for the browser AudioBuffer: the encoders only read
// numberOfChannels / sampleRate / length and call getChannelData(ch).
function makeBuffer(channels: Float32Array[], sampleRate = 44100): AudioBuffer {
  return {
    numberOfChannels: channels.length,
    sampleRate,
    length: channels[0]?.length ?? 0,
    getChannelData: (ch: number) => channels[ch],
  } as unknown as AudioBuffer;
}

const readString = (view: DataView, offset: number, length: number) =>
  new TextDecoder().decode(new Uint8Array(view.buffer, offset, length));

describe("floatToInt16", () => {
  it("clamps out-of-range samples and scales into the 16-bit range", () => {
    const out = floatToInt16(new Float32Array([0, 1, -1, 2, -2, 0.5, -0.5]));
    expect(Array.from(out)).toEqual([
      0,
      32767, // +1 full scale
      -32768, // -1 full scale
      32767, // +2 clamped to +1
      -32768, // -2 clamped to -1
      16383, // 0.5 * 0x7fff, truncated toward zero
      -16384, // -0.5 * 0x8000
    ]);
  });
});

describe("audioBufferToWav", () => {
  it("writes a valid 16-bit PCM WAV header and interleaves the channels", async () => {
    const left = new Float32Array([0, 0.5, -0.5, 1]);
    const right = new Float32Array([1, -1, 0, 0.25]);
    const blob = audioBufferToWav(makeBuffer([left, right], 44100));

    expect(blob.type).toBe("audio/wav");

    const view = new DataView(await blob.arrayBuffer());
    const dataSize = left.length * 2 /* channels */ * 2; /* bytes */

    expect(readString(view, 0, 4)).toBe("RIFF");
    expect(view.getUint32(4, true)).toBe(36 + dataSize);
    expect(readString(view, 8, 4)).toBe("WAVE");
    expect(readString(view, 12, 4)).toBe("fmt ");
    expect(view.getUint16(20, true)).toBe(1); // PCM
    expect(view.getUint16(22, true)).toBe(2); // channels
    expect(view.getUint32(24, true)).toBe(44100); // sample rate
    expect(view.getUint16(34, true)).toBe(16); // bits per sample
    expect(readString(view, 36, 4)).toBe("data");
    expect(view.getUint32(40, true)).toBe(dataSize);

    // First interleaved frame: left[0]=0, right[0]=+1 full scale.
    expect(view.getInt16(44, true)).toBe(0);
    expect(view.getInt16(46, true)).toBe(32767);
    // Second frame: left[1]=0.5, right[1]=-1.
    expect(view.getInt16(48, true)).toBe(16383);
    expect(view.getInt16(50, true)).toBe(-32768);
  });
});

describe("audioBufferToMp3", () => {
  it("produces a non-empty MP3 stream with a frame sync header", async () => {
    // A couple of frames worth of a quiet sine so lamejs emits at least one frame.
    const n = 4096;
    const sampleRate = 44100;
    const tone = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      tone[i] = Math.sin((2 * Math.PI * 440 * i) / sampleRate) * 0.5;
    }
    const blob = audioBufferToMp3(makeBuffer([tone, tone], sampleRate));

    expect(blob.type).toBe("audio/mpeg");
    expect(blob.size).toBeGreaterThan(0);

    const bytes = new Uint8Array(await blob.arrayBuffer());
    // MP3 frames begin with an 11-bit sync word: 0xFF followed by 0b111xxxxx.
    expect(bytes[0]).toBe(0xff);
    expect(bytes[1] & 0xe0).toBe(0xe0);
  });
});
