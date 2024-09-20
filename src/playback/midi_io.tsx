import { Midi } from "@tonejs/midi";
import MidiWriter from "midi-writer-js";

import { chordToNotes } from "@/data/chord_to_notes";
import { tokenToChord } from "@/data/token_to_chord";

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
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const midi = new Midi(e.target?.result as ArrayBuffer);
      resolve(midi);
    };
    reader.onerror = (e) => reject(e);
    reader.readAsArrayBuffer(midiFile);
  });
}

function noteNameToMidi(noteName: string): number {
  const note = noteName.slice(0, -1);
  const octave = parseInt(noteName.slice(-1)) + 1;
  return octave * 12 + "C C# D D# E F F# G G# A A# B".split(" ").indexOf(note);
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
  notes: { name: string; duration: number; time: number }[],
  quantization: number, // In beats
  quantizationMode: string,
): { index: number; token: number; duration: number; variant: number }[] {
  // Quantize the chords
  let lastNote = notes.sort(
    (a, b) => a.time + a.duration - b.time - b.duration,
  )[notes.length - 1];
  let lastTime = Math.ceil(lastNote.time + lastNote.duration);

  let quantizedNotes: { notes: number[] }[] = new Array<{ notes: number[] }>(
    Math.ceil(lastTime / quantization),
  );
  for (let i = 0; i < quantizedNotes.length; i++) {
    quantizedNotes[i] = { notes: [] };
  }
  for (const note of notes) {
    let start = note.time / quantization;
    start =
      quantizationMode === "closest" ? Math.round(start) : Math.floor(start);
    const end = Math.ceil((note.time + note.duration) / quantization);
    const pitch = noteNameToMidi(note.name);

    for (let i = start; i < end; i++) {
      if (!quantizedNotes[i].notes.includes(pitch)) {
        quantizedNotes[i].notes.push(pitch);
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
