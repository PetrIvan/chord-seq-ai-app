"use client";
import React, { useState, useRef, useEffect } from "react";
import { useStore } from "@/state/use_store";

import SignatureDropdown from "./signature_dropdown";
import { shallow } from "zustand/shallow";

export default function Signature() {
  const [signature] = useStore((state) => [state.signature], shallow);
  const [numerator, denominator] = signature;

  /* Change signature dropdown */
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const isDropdownOpenRef = useRef(isDropdownOpen);

  const openDropdownButtonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    isDropdownOpenRef.current = isDropdownOpen;
  }, [isDropdownOpen]);

  useEffect(() => {
    // Hide the dropdown on click outside
    const handleClickOutside = (e: MouseEvent) => {
      if (
        isDropdownOpenRef.current &&
        !openDropdownButtonRef.current?.contains(e.target as Node) &&
        !dropdownRef.current?.contains(e.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative flex h-full">
      <button
        title="Change signature"
        className="bg-zinc-950 w-full flex flex-col justify-evenly items-center rounded-l-[0.5dvw] active:bg-zinc-800 p-[2dvh] text-[4dvh]"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        ref={openDropdownButtonRef}
      >
        <p className="text-center select-none">{numerator}</p>
        <p className="text-center select-none">{denominator}</p>
      </button>
      {isDropdownOpen && <SignatureDropdown dropdownRef={dropdownRef} />}
    </div>
  );
}
