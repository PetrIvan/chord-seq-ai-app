import { playNotes } from "@/playback/player";

// Convert from the key index to the note number (as in MIDI)
function keyToNoteNumber(key: number, type: "white" | "black"): number {
  const keys = type == "white" ? [0, 2, 4, 5, 7, 9, 11] : [1, 3, 6, 8, 10];
  const octave = Math.floor(key / keys.length);
  const note = keys[key % keys.length];
  return octave * 12 + note;
}

interface Props {
  notes: number[];
  octaveOffset: number;
  numKeys: number;
  changeNotes?: (notes: number[]) => void;
}

export default function Piano({
  notes,
  octaveOffset,
  numKeys,
  changeNotes,
}: Props) {
  // Keys and octaves based on the number of keys
  const whiteRange = Array.from({ length: numKeys }, (value, key) => key);
  const blackRange = Array.from(
    { length: Math.floor((numKeys * 5) / 7) },
    (value, key) => key,
  );
  const octaveRange = Array.from(
    { length: Math.ceil(numKeys / 7) },
    (value, key) => key,
  );

  // The black keys alterate between 2 and 3 keys separated by a space for one key
  const blackSpaces = [false, true, false, false, true];

  function replaceNoteOnPiano(note: number) {
    // If changeNotes is undefined, the piano is not interactive
    if (changeNotes === undefined) return;

    if (notes.includes(note)) {
      playNotes(notes.filter((n) => n !== note));
      changeNotes(notes.filter((n) => n !== note));
    } else {
      playNotes([...notes, note]);
      changeNotes([...notes, note]);
    }
  }

  return (
    <div className="relative">
      {/*White keys*/}
      <div className="flex h-[8dvh] flex-row justify-center">
        {whiteRange.map((i) => (
          <button
            key={i}
            className={`h-full w-[1dvw] border-x-[0.1dvw] border-zinc-950 ${
              notes.includes(keyToNoteNumber(i, "white") + octaveOffset * 12)
                ? "bg-violet-700 active:bg-violet-600 disabled:bg-violet-700"
                : "bg-zinc-100 active:bg-white disabled:bg-zinc-100"
            }`}
            disabled={changeNotes === undefined}
            onClick={() =>
              replaceNoteOnPiano(
                keyToNoteNumber(i, "white") + octaveOffset * 12,
              )
            }
          />
        ))}
      </div>
      {/*Black keys*/}
      <div className="absolute left-[0.7dvw] top-0 flex h-[5dvh] flex-row justify-center">
        {blackRange.map((i) => (
          <button
            key={i}
            className={`h-full w-[0.8dvw] ${
              blackSpaces[i % 5] ? "mr-[1.2dvw]" : "mr-[0.2dvw]"
            } ${
              notes.includes(keyToNoteNumber(i, "black") + octaveOffset * 12)
                ? "bg-violet-800 active:bg-violet-700 disabled:bg-violet-800"
                : "bg-zinc-950 active:bg-zinc-800 disabled:bg-zinc-950"
            }`}
            disabled={changeNotes === undefined}
            onClick={() =>
              replaceNoteOnPiano(
                keyToNoteNumber(i, "black") + octaveOffset * 12,
              )
            }
          />
        ))}
      </div>
      {/* Note names (only for C) */}
      <div className="top-[100%] flex flex-row justify-start px-[0.6dvw] text-zinc-500">
        {octaveRange.map((i) => (
          <div
            className={`relative ${i < octaveRange.length - 1 && "mr-[7dvw]"}`}
            key={i}
          >
            <p className="absolute -translate-x-1/2 transform">
              C{i + octaveOffset}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
