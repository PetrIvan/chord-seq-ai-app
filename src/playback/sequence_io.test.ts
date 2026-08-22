import { describe, expect, it } from "vitest";

import { tokenToChord } from "@/data/token_to_chord";
import {
  MAX_CHORD_DURATION_BEATS,
  MAX_SEQUENCE_CHORDS,
  parseChordSequence,
  serializeChordSequence,
} from "./sequence_io";

const validSequence = () => ({
  chords: [{ index: 0, token: 0, duration: 4, variant: 0 }],
  signature: [4, 4],
});

describe("parseChordSequence", () => {
  it("accepts a valid exported chord sequence", () => {
    expect(parseChordSequence(JSON.stringify(validSequence()))).toEqual(
      validSequence(),
    );
  });

  it.each([
    ["fractional token", { token: 0.5 }],
    ["non-finite duration", { duration: null }],
    ["zero duration", { duration: 0 }],
    ["out-of-range token", { token: Object.keys(tokenToChord).length }],
    ["out-of-range variant", { variant: tokenToChord[0].length }],
  ])("rejects a chord with a %s", (_label, change) => {
    const sequence = validSequence();
    Object.assign(sequence.chords[0], change);

    expect(() => parseChordSequence(JSON.stringify(sequence))).toThrow(
      "Invalid chord sequence.",
    );
  });

  it("rejects unsupported time-signature denominators", () => {
    const sequence = validSequence();
    sequence.signature = [4, 3];

    expect(() => parseChordSequence(JSON.stringify(sequence))).toThrow(
      "Invalid chord sequence.",
    );
  });

  it("rejects sequences large enough to exhaust the editor", () => {
    const sequence = validSequence();
    sequence.chords = Array.from(
      { length: MAX_SEQUENCE_CHORDS + 1 },
      (_, index) => ({ index, token: 0, duration: 0.5, variant: 0 }),
    );

    expect(() => parseChordSequence(JSON.stringify(sequence))).toThrow(
      "Invalid chord sequence.",
    );
  });

  it("accepts long sequences when every chord remains within safe bounds", () => {
    const sequence = {
      chords: [
        { index: 0, token: 0, duration: 3000, variant: 0 },
        { index: 1, token: 0, duration: 3000, variant: 0 },
      ],
      signature: [4, 4],
    };

    expect(parseChordSequence(JSON.stringify(sequence))).toEqual(sequence);
  });

  it("round-trips serialized sequences through the import validator", () => {
    const sequence = validSequence();
    const source = serializeChordSequence(
      sequence.chords,
      sequence.signature as [number, number],
    );

    expect(parseChordSequence(source)).toEqual(sequence);
  });

  it("accepts the maximum chord duration and rejects values above it", () => {
    const sequence = validSequence();
    sequence.chords[0].duration = MAX_CHORD_DURATION_BEATS;
    expect(parseChordSequence(JSON.stringify(sequence))).toEqual(sequence);

    sequence.chords[0].duration = MAX_CHORD_DURATION_BEATS + 0.5;
    expect(() => parseChordSequence(JSON.stringify(sequence))).toThrow(
      "Invalid chord sequence.",
    );
  });
});
