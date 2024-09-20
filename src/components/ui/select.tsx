"use client";
import { useState, useRef, useEffect } from "react";

interface Props {
  selectName: string;
  state: string;
  setState: (state: string) => void;
  allStates: string[];
  width: string;
  enabledShortcuts?: boolean;
  onDark?: boolean;
}

export default function Select({
  selectName,
  state,
  setState,
  allStates,
  width,
  enabledShortcuts,
  onDark,
}: Props) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Hide on click outside
  const dropdown = useRef<HTMLDivElement>(null);

  const handleClickOutside = (e: MouseEvent) => {
    if (dropdown.current && !dropdown.current.contains(e.target as Node)) {
      setIsDropdownOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      className={
        `mr-[2dvh] cursor-pointer whitespace-nowrap rounded-[1dvh] bg-zinc-800 p-[0.5dvw] ` +
        `${onDark ? "hover:bg-zinc-900" : ""}`
      }
      style={{ width }}
      title={`Select ${selectName}${
        enabledShortcuts ? " (Up/Down arrow keys)" : ""
      }`}
      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
      ref={dropdown}
    >
      <div className="flex flex-row items-center justify-between pl-[1dvh]">
        {state}
        <svg
          className="mr-[1dvh] inline-block h-[1.6dvh] w-[1.6dvh]"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 10 6"
        >
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="m1 1 4 4 4-4"
          />
        </svg>
      </div>

      <div className="relative h-full w-full filter-none">
        {isDropdownOpen && (
          <ul className="absolute top-full z-[15] mt-[0.5dvw] w-full rounded-[0.5dvw] bg-zinc-800 text-[2.5dvh]">
            {allStates.map((state, i) => (
              <li key={i}>
                <button
                  className={`w-full rounded-[0.5dvw] bg-zinc-800 p-[0.5dvw] ${
                    onDark
                      ? "hover:bg-zinc-900"
                      : "filter hover:brightness-110 active:brightness-90"
                  }`}
                  onClick={() => {
                    setState(state);
                    setIsDropdownOpen(false);
                  }}
                >
                  {state}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
