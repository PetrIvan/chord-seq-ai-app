import { tokenToChord } from "@/data/token_to_chord";

tokenToChord[-1] = ["?"];

// Convert a list of tokens and variants to a list of chords (as strings)
export function detokenize(tokens: number[], variants: number[]): string[] {
  let detokenized: string[] = [];
  for (let i = 0; i < tokens.length; i++) {
    detokenized[i] = tokenToChord[tokens[i]][variants[i]];
  }
  return detokenized;
}
