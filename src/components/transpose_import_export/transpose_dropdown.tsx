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
      className="absolute top-full z-[15] mt-[0.5dvw] flex flex-row items-center justify-between rounded-[0.5dvw] bg-zinc-950 p-[1dvw] text-[2.5dvh] shadow-lg shadow-zinc-950"
      ref={dropdownRef}
    >
      <label
        className="mr-[2dvh] select-none whitespace-nowrap"
        htmlFor="transpose-amount"
      >
        Transpose by:
      </label>
      <input
        id="transpose-amount"
        type="number"
        title="Semitones (Up/Down arrow keys)"
        className="mr-[1dvw] h-[6dvh] w-[10dvh] rounded-[1dvh] border-[0.2dvh] bg-zinc-800 p-[1dvh] text-[2.5dvh]"
        value={transposeBy}
        onChange={handleNumeratorChange}
      />
      <button
        className="rounded-[0.5dvw] bg-zinc-800 p-[0.5dvw] hover:bg-zinc-900"
        title="Confirm transposition (Enter)"
        onClick={() => transpose(parseInt(transposeBy, 10))}
      >
        Confirm
      </button>
    </div>
  );
}
