import React, { useState } from "react";
import { useStore } from "@/state/use_store";

interface Props {
  dropdownRef: React.RefObject<HTMLDivElement>;
  loop: boolean;
  setLoop: (newLoop: boolean) => void;
  bpm: number;
  setBpm: (newBpm: number) => void;
}

export default function SettingsDropdown({
  dropdownRef,
  loop,
  setLoop,
  bpm,
  setBpm,
}: Props) {
  const [localBpm, setLocalBpm] = useState(bpm);

  const handleBMPChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(event.target.value, 10);

    console.log(event.target.value);
    if ((newValue > 0 && newValue < 999) || event.target.value === "") {
      setLocalBpm(newValue);

      if (event.target.value !== "") {
        setBpm(Math.max(10, Math.min(newValue, 400)));
      }
    }
  };

  return (
    <div
      className="shadow-zinc-95 absolute top-full z-[15] mt-[0.5dvw] flex flex-col items-center justify-center space-y-[1dvw] rounded-[0.5dvw] bg-zinc-950 p-[1dvw] shadow-lg"
      ref={dropdownRef}
    >
      <div className="flex w-full flex-row items-center justify-between">
        <label className="mr-[1dvw] select-none text-[2.5dvh]">Loop:</label>
        <input
          type="checkbox"
          className="h-[2.4dvh] w-[2.4dvh] rounded-[0.5dvh] border-[0.2dvh] bg-zinc-800 focus:outline-none"
          checked={loop}
          onChange={() => setLoop(!loop)}
        />
      </div>
      <div className="flex w-full flex-row items-center justify-between">
        <label className="mr-[1dvw] select-none text-[2.5dvh]">BPM:</label>
        <input
          type="number"
          className="h-[6dvh] w-[12dvh] rounded-[1dvh] border-[0.2dvh] bg-zinc-800 p-[2dvh] text-[2.5dvh]"
          title="Change BPM (Up/Down arrow keys)"
          value={localBpm}
          onInput={handleBMPChange}
        />
      </div>
    </div>
  );
}
