import { useState, useRef, useEffect } from "react";

import { useStore } from "@/state/use_store";
import { shallow } from "zustand/shallow";

import Piano from "../piano";
import Select from "../ui/select";

export default function SearchBar() {
  const [
    setEnabledShortcuts,
    searchQuery,
    setSearchQuery,
    includeVariants,
    setIncludeVariants,
    searchNotes,
    setSearchNotes,
    matchType,
    setMatchType,
    matchAnyVariant,
    setMatchAnyVariant,
  ] = useStore(
    (state) => [
      state.setEnabledShortcuts,
      state.searchQuery,
      state.setSearchQuery,
      state.includeVariants,
      state.setIncludeVariants,
      state.searchNotes,
      state.setSearchNotes,
      state.matchType,
      state.setMatchType,
      state.matchAnyVariant,
      state.setMatchAnyVariant,
    ],
    shallow,
  );

  /* Piano dropdown (search by notes) */
  const [isPianoOpen, setIsPianoOpen] = useState(false);
  const isPianoOpenRef = useRef(isPianoOpen);

  const openPianoButtonRef = useRef<HTMLButtonElement>(null);
  const pianoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    isPianoOpenRef.current = isPianoOpen;
  }, [isPianoOpen]);

  useEffect(() => {
    // Hide the dropdown on click outside
    const handleClickOutside = (e: MouseEvent) => {
      if (
        isPianoOpenRef.current &&
        !openPianoButtonRef.current?.contains(e.target as Node) &&
        !pianoRef.current?.contains(e.target as Node)
      ) {
        setIsPianoOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Match dropdown
  const matchTypes = ["At least", "At most", "Exact"];

  return (
    <div className="flex h-[8dvh] flex-row items-center justify-start space-x-[1dvw]">
      <div className="flex h-[8dvh] flex-row items-center justify-start rounded-[2dvh] bg-zinc-800 p-[0.5dvw]">
        {/* Search by name */}
        <div className="flex h-full flex-row items-center justify-end">
          <img className="h-[70%] w-[70%]" src="/search.svg" alt="Search" />
        </div>
        {/* Not actually visible, for accessibility */}
        <label htmlFor="search" className="visually-hidden">
          Search:
        </label>
        <input
          id="search"
          className="h-full flex-1 rounded-[2dvh] border-[0.2dvh] border-transparent bg-zinc-800 p-[2dvh] text-[2.5dvh] text-white placeholder-zinc-500 placeholder-opacity-50 focus:border-transparent focus:ring-0"
          type="text"
          placeholder="Search a chord..."
          autoComplete="off"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          // Prevent shortcuts from being triggered when typing
          onFocus={() => setEnabledShortcuts(false)}
          onBlur={() => setEnabledShortcuts(true)}
        />
      </div>
      {/* Search by notes */}
      <div className="relative flex h-full flex-row items-center justify-center">
        <button
          className="flex h-full flex-row items-center justify-center active:brightness-90 active:filter"
          title="Search by notes"
          ref={openPianoButtonRef}
          onClick={() => setIsPianoOpen(!isPianoOpen)}
        >
          <svg
            className="h-[90%] w-[80%]"
            viewBox="0 0 80 80"
            fill={searchNotes.length > 0 ? "#6d28d9" : "none"}
            xmlns="http://www.w3.org/2000/svg"
          >
            <g clipPath="url(#clip0_247_5)">
              <path
                d="M10 23.3333C10 21.5652 10.7024 19.8695 11.9526 18.6193C13.2029 17.3691 14.8986 16.6667 16.6667 16.6667H63.3333C65.1014 16.6667 66.7971 17.3691 68.0474 18.6193C69.2976 19.8695 70 21.5652 70 23.3333V56.6667C70 58.4348 69.2976 60.1305 68.0474 61.3807C66.7971 62.631 65.1014 63.3333 63.3333 63.3333H16.6667C14.8986 63.3333 13.2029 62.631 11.9526 61.3807C10.7024 60.1305 10 58.4348 10 56.6667V23.3333Z"
                stroke="white"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M30 63.3333V43.3333"
                stroke="white"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M26.6667 16.6667V43.3333H33.3334V16.6667"
                stroke="white"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M50 63.3333V43.3333"
                stroke="white"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M46.6667 16.6667V43.3333H53.3334V16.6667"
                stroke="white"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
            <defs>
              <clipPath id="clip0_247_5">
                <rect width="80" height="80" fill="white" />
              </clipPath>
            </defs>
          </svg>
        </button>
        {isPianoOpen && (
          <div
            className="absolute top-[100%] z-10 flex flex-col items-center justify-center rounded-[1dvh] bg-zinc-950 p-[2dvh] pb-[4dvh]"
            ref={pianoRef}
          >
            <div className="flex flex-row items-center justify-center pb-[2dvh] text-[2.5dvh]">
              <span className="mr-[2dvh] select-none">Match:</span>
              <Select
                selectName="match"
                state={matchTypes[matchType]}
                setState={(state: string) =>
                  setMatchType(matchTypes.indexOf(state))
                }
                allStates={matchTypes}
                width="16dvh"
                onDark={true}
              />
              <span className="mr-[2dvh] select-none">Any variant:</span>
              <input
                type="checkbox"
                className="h-[2.4dvh] w-[2.4dvh] rounded-[0.5dvh] border-[0.2dvh] bg-zinc-800 focus:outline-none"
                checked={matchAnyVariant}
                onChange={() => setMatchAnyVariant(!matchAnyVariant)}
              />
            </div>
            <Piano
              notes={searchNotes}
              octaveOffset={3}
              numKeys={29}
              changeNotes={setSearchNotes}
            />
          </div>
        )}
      </div>
      {/* Clear search */}
      {(searchNotes.length > 0 || searchQuery) && (
        <button
          className="flex h-full flex-row items-center justify-center active:brightness-90 active:filter"
          title="Clear search"
          onClick={() => {
            setSearchQuery("");
            setSearchNotes([]);
            setMatchType(0);
            setMatchAnyVariant(true);
          }}
        >
          <img
            className="h-[80%] w-[80%]"
            src="/close.svg"
            alt="Clear search"
          />
        </button>
      )}
      {/* Include variants */}
      {searchQuery && (
        <>
          <label className="select-none" htmlFor="include-variants">
            Include variants:
          </label>
          <input
            type="checkbox"
            id="include-variants"
            className="h-[2.4dvh] w-[2.4dvh] rounded-[0.5dvh] border-[0.2dvh] bg-zinc-800 focus:outline-none"
            checked={includeVariants}
            onChange={() => setIncludeVariants(!includeVariants)}
          />
        </>
      )}
    </div>
  );
}
