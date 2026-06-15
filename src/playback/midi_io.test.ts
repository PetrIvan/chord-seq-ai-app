import { describe, it, expect } from "vitest";
import { Midi } from "@tonejs/midi";

import { getMidiBlob, getChordsFromNotes } from "./midi_io";
import { chord } from "@/test/chords";
import { chordToNotes } from "@/data/chord_to_notes";
import { tokenToChord } from "@/data/token_to_chord";

const TOKEN = 0;
const tokenNotes = chordToNotes[tokenToChord[TOKEN][0]];

// Reduce a set of MIDI notes to its sorted, unique pitch classes (0-11).
const pitchClasses = (notes: number[]) =>
  [...new Set(notes.map((n) => ((n % 12) + 12) % 12))].sort((a, b) => a - b);

describe("getMidiBlob", () => {
  it("writes a parseable MIDI file carrying tempo, signature and chord notes", async () => {
    const chords = [chord(TOKEN, 2, 0), chord(-1, 2, 1), chord(TOKEN, 2, 2)];
    const blob = getMidiBlob(chords, 120, [3, 4]);

    expect(blob.type).toBe("audio/midi");

    const midi = new Midi(await blob.arrayBuffer());

    expect(Math.round(midi.header.tempos[0].bpm)).toBe(120);
    expect(midi.header.timeSignatures[0].timeSignature).toEqual([3, 4]);

    const notes = midi.tracks.flatMap((t) => t.notes);
    // Two sounding chords, the rest contributes no notes.
    expect(notes).toHaveLength(tokenNotes.length * 2);
    expect(pitchClasses(notes.map((n) => n.midi))).toEqual(
      pitchClasses(tokenNotes),
    );
  });

  it("emits an empty (header-only) track for a rest-only sequence", async () => {
    const blob = getMidiBlob([chord(-1, 4, 0)], 120, [4, 4]);
    const midi = new Midi(await blob.arrayBuffer());
    expect(midi.tracks.flatMap((t) => t.notes)).toHaveLength(0);
  });
});

describe("getChordsFromNotes", () => {
  it("recognizes a C major triad held across the bar as a single chord", () => {
    // C3/E3/G3 -> MIDI 48/52/55 -> pitch classes {0,4,7}.
    const notes = [
      { name: "C3", duration: 4, time: 0 },
      { name: "E3", duration: 4, time: 0 },
      { name: "G3", duration: 4, time: 0 },
    ];

    const result = getChordsFromNotes(notes, 1, "closest");

    expect(result).toHaveLength(1);
    const [c] = result;
    expect(c.token).not.toBe(-1);

    // The matched token must represent the same pitch classes we fed in.
    const matchedNotes = chordToNotes[tokenToChord[c.token][c.variant]];
    expect(pitchClasses(matchedNotes)).toEqual([0, 4, 7]);
  });

  it("inserts a rest for a gap between two chords", () => {
    // C major at beat 0, two empty beats, C major again at beat 3.
    const triad = (time: number) => [
      { name: "C3", duration: 1, time },
      { name: "E3", duration: 1, time },
      { name: "G3", duration: 1, time },
    ];
    const result = getChordsFromNotes([...triad(0), ...triad(3)], 1, "floor");

    // chord, rest (the 2-beat gap), chord.
    expect(result.map((c) => c.token === -1)).toEqual([false, true, false]);
    expect(result[1].duration).toBe(2); // the gap spans two quantization slots
    expect(result.map((c, i) => c.index)).toEqual([0, 1, 2]); // reindexed
  });
});
