import { describe, it, expect, vi } from "vitest";

// player.tsx wires up Tone.js at module load (Tone.loaded().then(...)). We only
// want the pure chordsToNoteEvents helper here, so stub Tone with a loaded()
// promise that never resolves - that keeps the audio-graph setup callback from
// running while leaving the rest of the module intact.
vi.mock("tone", () => ({
  loaded: () => new Promise(() => {}),
  getDestination: () => ({ volume: { value: 0 } }),
}));

import { chordsToNoteEvents } from "./player";
import { chord } from "@/test/chords";
import { chordToNotes } from "@/data/chord_to_notes";
import { tokenToChord } from "@/data/token_to_chord";

// A real, multi-note chord token to exercise note expansion. Token 0's first
// variant resolves to notes via chordToNotes (guaranteed by the data tests).
const TOKEN = 0;
const noteCount = chordToNotes[tokenToChord[TOKEN][0]].length;

describe("chordsToNoteEvents", () => {
  it("returns nothing for an empty sequence", () => {
    expect(chordsToNoteEvents([], 120)).toEqual({ events: [], totalTime: 0 });
  });

  it("emits one event per note in a chord, all sharing the chord's time slot", () => {
    const { events, totalTime } = chordsToNoteEvents([chord(TOKEN, 2)], 120);

    // duration seconds = beats / (bpm / 60) = 2 / 2 = 1
    expect(totalTime).toBeCloseTo(1);
    expect(events).toHaveLength(noteCount);
    for (const event of events) {
      expect(event.time).toBe(0);
      expect(event.duration).toBeCloseTo(1);
      expect(event.note).toBeGreaterThan(0); // frequency in Hz
      expect(Number.isFinite(event.note)).toBe(true);
    }
  });

  it("treats rest tokens (-1) as silent time: no events, but time advances", () => {
    const { events, totalTime } = chordsToNoteEvents([chord(-1, 2)], 120);
    expect(events).toEqual([]);
    expect(totalTime).toBeCloseTo(1);
  });

  it("scales durations by BPM", () => {
    const slow = chordsToNoteEvents([chord(TOKEN, 4)], 60); // factor 1
    const fast = chordsToNoteEvents([chord(TOKEN, 4)], 120); // factor 2
    expect(slow.totalTime).toBeCloseTo(4);
    expect(fast.totalTime).toBeCloseTo(2);
  });

  it("lays consecutive chords end to end with cumulative start times", () => {
    const { events, totalTime } = chordsToNoteEvents(
      [chord(TOKEN, 2, 0), chord(-1, 2, 1), chord(TOKEN, 2, 2)],
      120,
    );

    // Each non-rest chord is 1s; rest in the middle is 1s -> total 3s.
    expect(totalTime).toBeCloseTo(3);

    const startTimes = [...new Set(events.map((e) => e.time))].sort(
      (a, b) => a - b,
    );
    // First chord at t=0, third chord at t=2 (after chord + rest).
    expect(startTimes).toEqual([0, 2]);
    expect(events).toHaveLength(noteCount * 2);
  });
});
