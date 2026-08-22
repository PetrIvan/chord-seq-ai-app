import { Midi } from "@tonejs/midi";
import MidiWriter from "midi-writer-js";

import { chordToNotes } from "@/data/chord_to_notes";
import { tokenToChord } from "@/data/token_to_chord";
import { MAX_IMPORT_FILE_BYTES } from "@/playback/sequence_io";

const MAX_MIDI_NOTES = 100_000;
const MAX_MIDI_TIMELINE_SLICES = 4096;
const MAX_MIDI_NOTE_SLICES = 500_000;
export const MIN_MIDI_QUANTIZATION = 1;
export const MAX_MIDI_QUANTIZATION = 8;

export function clampMidiQuantization(value: number): number {
  if (!Number.isFinite(value)) return 4;
  return Math.min(
    MAX_MIDI_QUANTIZATION,
    Math.max(MIN_MIDI_QUANTIZATION, Math.round(value)),
  );
}

// Create a MIDI file from a list of chords
export function getMidiBlob(
  chords: {
    index: number;
    token: number;
    duration: number;
    variant: number;
  }[],
  bpm: number,
  signature: [number, number],
): Blob {
  const track = new MidiWriter.Track();

  // Set the tempo and time signature
  track.setTempo(bpm);
  track.setTimeSignature(signature[0], signature[1], 24, 8);

  // Create a track
  let restDuration = 0;
  for (const chord of chords) {
    const duration = Math.round(chord.duration * 128); // 128 ticks per quarter note

    if (chord.token === -1) {
      restDuration += duration;
      continue;
    }

    let notes = chordToNotes[tokenToChord[chord.token][chord.variant]];
    track.addEvent(
      new MidiWriter.NoteEvent({
        pitch: notes,
        duration: `T${duration}`,
        wait: `T${restDuration}`,
      }),
    );

    restDuration = 0;
  }

  // Generate a writeable MIDI file
  const write = new MidiWriter.Writer(track);

  // Convert to Blob
  const b64string = write.base64();
  const byteCharacters = atob(b64string);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);

  return new Blob([byteArray], { type: "audio/midi" });
}

export async function extractMidiFile(midiFile: Blob): Promise<Midi> {
  if (midiFile.size > MAX_IMPORT_FILE_BYTES) {
    throw new Error("The MIDI file is too large.");
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = e.target?.result;
        if (!(result instanceof ArrayBuffer)) {
          throw new Error("The MIDI file could not be read.");
        }
        resolve(new Midi(result));
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () =>
      reject(reader.error ?? new Error("The MIDI file could not be read."));
    reader.readAsArrayBuffer(midiFile);
  });
}

// Similar as described in data tokenization Jupyter notebook
function getPitchClassRep(notes: number[]): string {
  // Only keep the notes in a single octave
  let normalizedChord = notes.map((note) => note % 12).sort((a, b) => a - b);
  // Remove duplicates
  normalizedChord = normalizedChord.filter(
    (note, i) => normalizedChord.indexOf(note) === i,
  );
  return normalizedChord.join(",");
}

// To enable import/export with variants, does not always work (e.g. with duplicate notes)
function getVariantRep(notes: number[]): string {
  // Push the notes to the lowest octave
  let min = Math.min(...notes);
  let offset = min - (min % 12);
  let normalizedChord = notes
    .map((note) => note - offset)
    .sort((a, b) => a - b);
  // Remove duplicates
  normalizedChord = normalizedChord.filter(
    (note, i) => normalizedChord.indexOf(note) === i,
  );
  return normalizedChord.join(",");
}

// Convert a list of notes to a list of chords
export function getChordsFromNotes(
  notes: { midi: number; duration: number; time: number }[],
  quantization: number, // In beats
  quantizationMode: string,
): { index: number; token: number; duration: number; variant: number }[] {
  if (
    notes.length === 0 ||
    notes.length > MAX_MIDI_NOTES ||
    !Number.isInteger(quantization) ||
    quantization < MIN_MIDI_QUANTIZATION ||
    quantization > MAX_MIDI_QUANTIZATION ||
    !["closest", "floor", "all notes"].includes(quantizationMode) ||
    notes.some(
      (note) =>
        !Number.isInteger(note.midi) ||
        note.midi < 0 ||
        note.midi > 127 ||
        !Number.isFinite(note.duration) ||
        note.duration <= 0 ||
        !Number.isFinite(note.time) ||
        note.time < 0,
    )
  ) {
    throw new Error("The MIDI file contains invalid note data.");
  }

  // Quantize the chords
  let lastNote = notes.sort(
    (a, b) => a.time + a.duration - b.time - b.duration,
  )[notes.length - 1];
  let lastTime = Math.ceil(lastNote.time + lastNote.duration);

  const timelineSlices = Math.ceil(lastTime / quantization);
  if (
    !Number.isSafeInteger(timelineSlices) ||
    timelineSlices < 1 ||
    timelineSlices > MAX_MIDI_TIMELINE_SLICES
  ) {
    throw new Error("The MIDI file is too long to import safely.");
  }

  let quantizedNotes: { notes: number[] }[] = new Array<{ notes: number[] }>(
    timelineSlices,
  );
  for (let i = 0; i < quantizedNotes.length; i++) {
    quantizedNotes[i] = { notes: [] };
  }
  let noteSlices = 0;
  for (const note of notes) {
    let start = note.time / quantization;
    start =
      quantizationMode === "closest" ? Math.round(start) : Math.floor(start);
    const end = Math.ceil((note.time + note.duration) / quantization);
    if (start < 0 || start >= timelineSlices || end > timelineSlices) {
      throw new Error("The MIDI file contains invalid note timing.");
    }

    noteSlices += end - start;
    if (noteSlices > MAX_MIDI_NOTE_SLICES) {
      throw new Error("The MIDI file is too complex to import safely.");
    }

    for (let i = start; i < end; i++) {
      if (!quantizedNotes[i].notes.includes(note.midi)) {
        quantizedNotes[i].notes.push(note.midi);
      }
    }
  }

  // Merge the quantized notes
  let groupedNotes: { duration: number; notes: number[] }[] = [];
  for (let i = 0; i < quantizedNotes.length; i++) {
    const prevIndex = Math.max(groupedNotes.length - 1, 0);
    const prevNotes =
      groupedNotes[prevIndex] !== undefined
        ? groupedNotes[prevIndex].notes
        : [];

    // Check if the notes are the same
    if (
      prevNotes.length === quantizedNotes[i].notes.length &&
      prevNotes.every((note, index) => note === quantizedNotes[i].notes[index])
    ) {
      if (groupedNotes[prevIndex] !== undefined)
        groupedNotes[prevIndex].duration += quantization;
      continue;
    }

    groupedNotes.push({
      duration: quantization,
      notes: quantizedNotes[i].notes || [],
    });
  }

  // Process chordToNotes into a pitch class representation
  let pitchClassChords: { [chordName: string]: string } = {};
  let keys = Object.keys(chordToNotes);
  for (const chordName of keys) {
    pitchClassChords[chordName] = getPitchClassRep(chordToNotes[chordName]);
  }

  // Create a map from token to pitch class representation
  let tokenToPitchClass: string[] = [];
  keys = Object.keys(tokenToChord);
  for (let i = 0; i < keys.length - 1; i++) {
    let chordNames = tokenToChord[i];
    tokenToPitchClass.push(pitchClassChords[chordNames[0]]);
  }

  // Find the chord tokens
  let chords: {
    index: number;
    token: number;
    duration: number;
    variant: number;
  }[] = [];
  for (const group of groupedNotes) {
    // Unknown chords act as rests
    if (group.notes.length === 0) {
      chords.push({
        index: chords.length,
        token: -1,
        duration: group.duration,
        variant: 0,
      });
      continue;
    }

    // Find the matching chord token
    let pitchClassGroup = getPitchClassRep(group.notes);

    let foundToken = false;
    for (let i = 0; i < tokenToPitchClass.length; i++) {
      if (tokenToPitchClass[i] === pitchClassGroup) {
        // Find the variant
        let variant = 0; // Default variant if not found
        for (let j = 0; j < tokenToChord[i].length; j++) {
          if (
            getVariantRep(group.notes) ===
            getVariantRep(chordToNotes[tokenToChord[i][j]])
          ) {
            variant = j;
            break;
          }
        }

        chords.push({
          index: chords.length,
          token: i,
          duration: group.duration,
          variant: variant,
        });
        foundToken = true;
        break;
      }
    }

    // Fallback to an unknown token
    if (!foundToken) {
      chords.push({
        index: chords.length,
        token: -1,
        duration: group.duration,
        variant: 0,
      });
    }
  }

  // Merge consecutive chords with the same token
  let mergedChords: {
    index: number;
    token: number;
    duration: number;
    variant: number;
  }[] = [];

  let index = 0;
  for (let i = 0; i < chords.length; i++) {
    if (i === 0 || chords[i].token !== chords[i - 1].token) {
      mergedChords.push({
        ...chords[i],
        index: index,
      });
      index++;
    } else {
      mergedChords[mergedChords.length - 1].duration += chords[i].duration;
    }
  }

  return mergedChords;
}
