import { tokenToChord } from "@/data/token_to_chord";
import type { Chord } from "@/state/chord";

export const MAX_IMPORT_FILE_BYTES = 10 * 1024 * 1024;
export const MAX_SEQUENCE_CHORDS = 4096;
export const MAX_CHORD_DURATION_BEATS = 4096;

const signatureDenominators = new Set([1, 2, 4, 8, 16, 32]);

type ChordSequence = {
  chords: Chord[];
  signature: [number, number];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isValidSignature(value: unknown): value is [number, number] {
  return (
    Array.isArray(value) &&
    value.length === 2 &&
    Number.isInteger(value[0]) &&
    value[0] >= 1 &&
    value[0] <= 16 &&
    Number.isInteger(value[1]) &&
    signatureDenominators.has(value[1])
  );
}

function isValidChord(value: unknown, expectedIndex: number): value is Chord {
  if (!isRecord(value)) return false;

  const { index, token, duration, variant } = value;
  if (
    typeof index !== "number" ||
    !Number.isInteger(index) ||
    index !== expectedIndex ||
    typeof token !== "number" ||
    !Number.isInteger(token) ||
    token < -1 ||
    token >= Object.keys(tokenToChord).length ||
    typeof duration !== "number" ||
    !Number.isFinite(duration) ||
    duration <= 0 ||
    duration > MAX_CHORD_DURATION_BEATS ||
    typeof variant !== "number" ||
    !Number.isInteger(variant) ||
    variant < 0
  ) {
    return false;
  }

  if (token === -1) return variant === 0;
  return variant < tokenToChord[token].length;
}

function validateChordSequence(value: unknown): ChordSequence {
  if (!isRecord(value) || !Array.isArray(value.chords)) {
    throw new Error("Invalid chord sequence.");
  }

  if (
    value.chords.length > MAX_SEQUENCE_CHORDS ||
    !value.chords.every(isValidChord) ||
    !isValidSignature(value.signature)
  ) {
    throw new Error("Invalid chord sequence.");
  }

  return {
    chords: value.chords as Chord[],
    signature: value.signature,
  };
}

export function parseChordSequence(source: string): ChordSequence {
  return validateChordSequence(JSON.parse(source));
}

export function serializeChordSequence(
  chords: Chord[],
  signature: [number, number],
): string {
  return JSON.stringify(validateChordSequence({ chords, signature }));
}
