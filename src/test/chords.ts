// Shared builders for the chord-sequence tests, on top of the production Chord
// type so the fixtures track the real shape rather than a parallel copy.
import { Chord } from "@/state/chord";

// Build a single chord. `token` is -1 for a rest; `variant` defaults to 0.
export const chord = (token: number, duration: number, index = 0): Chord => ({
  index,
  token,
  duration,
  variant: 0,
});

// Build a contiguous, reindexed sequence of full-bar chords from their tokens.
export const makeChords = (tokens: number[]): Chord[] =>
  tokens.map((token, index) => chord(token, 4, index));
