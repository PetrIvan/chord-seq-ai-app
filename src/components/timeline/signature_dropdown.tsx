import React, { useState } from "react";
import { useStore } from "@/state/use_store";

interface Props {
  dropdownRef: React.RefObject<HTMLDivElement>;
}

export default function SignatureDropdown({
  dropdownRef: shownDropdownRef,
}: Props) {
  const [signature, setSignature] = useStore((state) => [
    state.signature,
    state.setSignature,
  ]);

  // Local references to the signature
  const [numerator, setNumerator] = useState(signature[0]);
  const [denominator, setDenominator] = useState(signature[1]);

  const handleNumeratorChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    // Limit the numerator to 2-16
    const newValue = parseInt(event.target.value, 10);

    if ((newValue > 1 && newValue <= 16) || event.target.value === "") {
      setNumerator(newValue);

      if (event.target.value !== "") {
        setSignature([newValue, denominator]);
      }
    }
  };

  const handleDenominatorChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    // Only powers of 2 are usually used as denominators in music
    let newValue = parseInt(event.target.value, 10);
    const powers = [1, 2, 4, 8, 16, 32];

    if (newValue > 0 || event.target.value === "") {
      if (event.target.value !== "") {
        // If the change is downward, find the previous power of 2, otherwise find the next power of 2
        if (newValue < denominator) {
          newValue = powers.reverse().find((power) => power <= newValue) || 1;
        } else {
          newValue = powers.find((power) => power >= newValue) || 32;
        }

        setSignature([numerator, newValue]);
      }

      setDenominator(newValue);
    }
  };

  return (
    <div
      className="absolute z-10 top-full mt-[0.5dvw] bg-zinc-950 rounded-[0.5dvw] flex flex-row items-center p-[1dvw] shadow-lg shadow-zinc-950"
      ref={shownDropdownRef}
    >
      <input
        type="number"
        className="w-[4dvw] h-[3dvw] bg-zinc-800 text-white rounded-[0.5dvw] text-[2.5dvh]"
        value={numerator}
        onChange={handleNumeratorChange}
      />
      <span className="text-white mx-[0.5dvw]">/</span>
      <input
        type="number"
        className="w-[4dvw] h-[3dvw] bg-zinc-800 text-white rounded-[0.5dvw] text-[2.5dvh]"
        value={denominator}
        onChange={handleDenominatorChange}
      />
    </div>
  );
}
