import { useState } from "react";

interface Props {
  dropdownRef: React.RefObject<HTMLDivElement>;
  transpose: (delta: number) => void;
}

export default function TransposeDropdown({ dropdownRef, transpose }: Props) {
  // Input should accept even negative numbers (because of the minus sign, a string is used)
  const [transposeBy, setTransposeBy] = useState("0");

  function handleNumeratorChange(event: React.ChangeEvent<HTMLInputElement>) {
    const newValue = parseInt(event.target.value, 10);

    if (
      (newValue > -12 && newValue < 12) ||
      event.target.value === "" ||
      event.target.value === "-"
    ) {
      setTransposeBy(event.target.value);
    }
  }

  return (
    <div
      className="absolute z-[15] text-[2.5dvh] top-full mt-[0.5dvw] bg-zinc-950 rounded-[0.5dvw] flex flex-row items-center justify-between p-[1dvw] shadow-lg shadow-zinc-950"
      ref={dropdownRef}
    >
      <label
        className="select-none mr-[2dvh] whitespace-nowrap"
        htmlFor="transpose-amount"
      >
        Transpose by:
      </label>
      <input
        id="transpose-amount"
        type="number"
        title="Semitones (Up/Down Arrow keys)"
        className="text-[2.5dvh] border-[0.2dvh] p-[1dvh] w-[10dvh] h-[6dvh] bg-zinc-800 rounded-[1dvh] mr-[1dvw]"
        value={transposeBy}
        onChange={handleNumeratorChange}
      />
      <button
        className="bg-zinc-800 rounded-[0.5dvw] p-[0.5dvw] hover:bg-zinc-900"
        title="Confirm transposition (Enter)"
        onClick={() => transpose(parseInt(transposeBy, 10))}
      >
        Confirm
      </button>
    </div>
  );
}
