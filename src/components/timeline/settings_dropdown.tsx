import React, { useState } from "react";
import { useStore } from "@/state/use_store";

interface Props {
  dropdownRef: React.RefObject<HTMLDivElement>;
}

export default function SettingsDropdown({ dropdownRef }: Props) {
  const [bpm, setBpm] = useStore((state) => [state.bpm, state.setBpm]);
  const [localBpm, setLocalBpm] = useState(bpm);

  const handleNumeratorChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newValue = parseInt(event.target.value, 10);

    if ((newValue > 0 && newValue < 999) || event.target.value === "") {
      setLocalBpm(newValue);

      if (event.target.value !== "") {
        setBpm(Math.max(10, Math.min(newValue, 400)));
      }
    }
  };

  return (
    <div
      className="absolute z-[15] top-full mt-[0.5dvw] bg-zinc-950 rounded-[0.5dvw] flex flex-row items-center justify-between p-[1dvw] shadow-lg shadow-zinc-950"
      ref={dropdownRef}
    >
      <label className="select-none text-[2.5dvh] mr-[1dvw]">BPM:</label>
      <input
        type="number"
        className="w-[5dvw] h-[3dvw] bg-zinc-800 rounded-[0.5dvw] text-[2.5dvh]"
        value={localBpm}
        onChange={handleNumeratorChange}
      />
    </div>
  );
}
