// The canonical shape of a chord in a sequence, shared across the state, the
// playback/export pipeline, and the tests. `token` is the model's chord id (-1
// for a rest), `variant` selects the voicing, `duration` is in beats, and
// `index` is the chord's position in the sequence.
export interface Chord {
  index: number;
  token: number;
  duration: number;
  variant: number;
}
