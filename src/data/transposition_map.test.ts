import { describe, it, expect } from "vitest";

import { transpositionMap } from "./transposition_map";
import { tokenToChord } from "./token_to_chord";
import { chordToNotes } from "./chord_to_notes";

// The transposition map is the backbone of the Transpose feature: each row maps a
// chord token to the token it becomes when shifted up by 0..11 semitones. A
// corrupted row would silently turn one chord into an unrelated one, so these
// invariants guard the data itself.
describe("transpositionMap", () => {
  it("has a row per token, each covering all 12 semitone shifts", () => {
    expect(transpositionMap.length).toBeGreaterThan(0);
    for (const row of transpositionMap) {
      expect(row).toHaveLength(12);
    }
  });

  it("uses a zero-shift identity column (token maps to itself)", () => {
    transpositionMap.forEach((row, token) => {
      expect(row[0]).toBe(token);
    });
  });

  it("only ever maps to tokens that exist in the map", () => {
    for (const row of transpositionMap) {
      for (const target of row) {
        expect(Number.isInteger(target)).toBe(true);
        expect(target).toBeGreaterThanOrEqual(0);
        expect(target).toBeLessThan(transpositionMap.length);
      }
    }
  });

  it("round-trips: shifting up by d then by (12 - d) returns the original token", () => {
    transpositionMap.forEach((row, token) => {
      for (let d = 1; d < 12; d++) {
        const shifted = row[d];
        const back = transpositionMap[shifted][12 - d];
        expect(back).toBe(token);
      }
    });
  });
});

// tokenToChord maps a model token id to one or more chord-name variants; every
// one of those names must resolve to real notes via chordToNotes, otherwise
// playback/export of that chord would crash.
describe("tokenToChord <-> chordToNotes", () => {
  it("gives every token at least one chord-name variant", () => {
    const tokens = Object.keys(tokenToChord);
    expect(tokens.length).toBeGreaterThan(0);
    for (const token of tokens) {
      expect(Array.isArray(tokenToChord[Number(token)])).toBe(true);
      expect(tokenToChord[Number(token)].length).toBeGreaterThan(0);
    }
  });

  it("references only chord names that exist in chordToNotes", () => {
    for (const variants of Object.values(tokenToChord)) {
      for (const name of variants) {
        expect(chordToNotes[name], `missing notes for "${name}"`).toBeDefined();
      }
    }
  });
});

describe("chordToNotes", () => {
  it("maps every chord to a non-empty set of valid MIDI notes", () => {
    const names = Object.keys(chordToNotes);
    expect(names.length).toBeGreaterThan(0);
    for (const name of names) {
      const notes = chordToNotes[name];
      expect(notes.length).toBeGreaterThan(0);
      for (const note of notes) {
        expect(Number.isInteger(note)).toBe(true);
        expect(note).toBeGreaterThanOrEqual(0);
        expect(note).toBeLessThanOrEqual(127);
      }
    }
  });
});
