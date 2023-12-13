import { tokenToChord } from "@/data/token_to_chord";

const numTokens = Object.keys(tokenToChord).length - 1;
tokenToChord[-1] = ["?"];

export function detokenize(tokens: number[]): string[];
export function detokenize(token: number): string;

export function detokenize(tokens: number | number[]): string | string[] {
  if (Array.isArray(tokens)) {
    // Handle the case where tokens is an array of numbers
    return tokens.map((token) => detokenize(token));
  } else {
    // Handle the case where tokens is a single number
    if (tokens > numTokens) return "error";

    let chords = tokenToChord[tokens];

    // Some extensions should be prioritized over others (e.g. C/B makes less sense than Cmaj7)
    const specialExtensions = ["maj7", "dim7"];

    let includedSpecialExtensions: string[] = [];
    for (const chord of chords) {
      includedSpecialExtensions = includedSpecialExtensions.concat(
        specialExtensions.filter((extension) => chord.includes(extension))
      );
    }

    // If there are any special extensions, remove all chords that don't have them
    if (includedSpecialExtensions.length > 0) {
      chords = chords.filter((chord) =>
        includedSpecialExtensions.some((extension) => chord.includes(extension))
      );
    }

    let prefferedChord = chords[0];
    for (const chord of chords) {
      if (chord.length < prefferedChord.length) {
        prefferedChord = chord;
      }
    }

    return prefferedChord;
  }
}
