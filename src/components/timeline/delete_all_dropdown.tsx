import React from "react";
import { useStore } from "@/state/use_store";

interface Props {
  dropdownRef: React.RefObject<HTMLDivElement>;
  setIsOpen: (isOpen: boolean) => void;
}

export default function DeleteAllDropdown({ dropdownRef, setIsOpen }: Props) {
  const [clearChords] = useStore((state) => [state.clearChords]);

  return (
    <div
      className="absolute top-full z-[15] mt-[0.5dvw] flex flex-row items-center justify-between rounded-[0.5dvw] bg-zinc-950 p-[1dvw] shadow-lg shadow-zinc-950"
      ref={dropdownRef}
    >
      <p className="mr-[1dvw] w-full select-none text-[2.5dvh]">
        Delete all chords?
      </p>
      <button
        className="rounded-[0.5dvw] bg-zinc-800 p-[0.5dvw] hover:bg-zinc-900"
        title="Confirm deletion (Enter)"
        onClick={() => {
          clearChords();
          setIsOpen(false);
        }}
      >
        Confirm
      </button>
    </div>
  );
}
