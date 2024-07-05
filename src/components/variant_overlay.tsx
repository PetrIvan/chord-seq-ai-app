"use client";
import React, { useEffect } from "react";
import { useStore } from "@/state/use_store";
import { shallow } from "zustand/shallow";

import { cloneDeep } from "lodash";

import { chordToNotes } from "@/data/chord_to_notes";
import { tokenToChord } from "@/data/token_to_chord";

import { playChord } from "@/playback/player";

import Piano from "./piano";

export default function VariantOverlay() {
  const [
    token,
    variant,
    variantsOpen,
    setVariant,
    setVariantsOpen,
    setEnabledShortcuts,
    selectedChordVariants,
    chords,
    setChords,
    variantsFromSuggestions,
    replaceDefaultVariant,
    replaceChord,
  ] = useStore(
    (state) => [
      state.selectedToken,
      state.selectedVariant,
      state.variantsOpen,
      state.setSelectedVariant,
      state.setVariantsOpen,
      state.setEnabledShortcuts,
      state.selectedChordVariants,
      state.chords,
      state.setChords,
      state.isVariantsOpenFromSuggestions,
      state.replaceDefaultVariant,
      state.replaceChord,
    ],
    shallow
  );

  // Disable shortcuts when the overlay is open
  useEffect(() => {
    setEnabledShortcuts(!variantsOpen);
  }, [variantsOpen]);

  return (
    variantsOpen && (
      <ShowableVariantOverlay
        token={token}
        selectedVariant={variant}
        setSelectedVariant={setVariant}
        setVariantsOpen={setVariantsOpen}
        selectedChordVariants={selectedChordVariants}
        chords={chords}
        setChords={setChords}
        variantsFromSuggestions={variantsFromSuggestions}
        replaceDefaultVariant={replaceDefaultVariant}
        replaceChord={replaceChord}
      />
    )
  );
}

interface Props {
  token: number;
  selectedVariant: number;
  setSelectedVariant: (variant: number) => void;
  setVariantsOpen: (variantsOpen: boolean) => void;
  selectedChordVariants: number;
  chords: { index: number; token: number; duration: number; variant: number }[];
  setChords: (
    chords: {
      index: number;
      token: number;
      duration: number;
      variant: number;
    }[]
  ) => void;
  variantsFromSuggestions: boolean;
  replaceDefaultVariant: (token: number, defaultVariant: number) => void;
  replaceChord: (token: number, variant: number) => void;
}

function ShowableVariantOverlay({
  token,
  selectedVariant: variant,
  setSelectedVariant: setVariant,
  setVariantsOpen,
  selectedChordVariants,
  chords,
  setChords,
  variantsFromSuggestions,
  replaceDefaultVariant,
  replaceChord,
}: Props) {
  // Close on escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setVariantsOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  /* Apply functions */
  function applyToAll() {
    let newChords = cloneDeep(chords);
    newChords.forEach((chord) => {
      if (chord.token === token) chord.variant = variant;
    });
    setChords(newChords);
    setVariantsOpen(false);
  }

  function applyOnce() {
    let newChords = cloneDeep(chords);
    newChords[selectedChordVariants].variant = variant;
    setChords(newChords);
    setVariantsOpen(false);
  }

  function setAsDefault() {
    replaceDefaultVariant(token, variant);
    setVariantsOpen(false);
  }

  function variantUseOnce() {
    replaceChord(token, variant);
    setVariantsOpen(false);
  }

  return (
    <div className="absolute z-30 bg-zinc-950 bg-opacity-50 h-[100dvh] w-[100dvw] flex flex-col items-center justify-center">
      <div className="relative bg-zinc-900 h-[70dvh] w-[60dvw] rounded-[1dvh] flex flex-col items-center justify-evenly p-[2dvh]">
        <div className="grow-[1] flex flex-col items-center justify-center space-y-[2dvh] mb-[5dvh]">
          <img
            className="absolute top-[1dvh] right-[1dvh] w-[5dvh] h-[5dvh] cursor-pointer"
            src="/close.svg"
            title="Close (Esc)"
            onClick={() => setVariantsOpen(false)}
          ></img>
          <p className="text-[5dvh] font-semibold">
            {tokenToChord[token][variant]}
          </p>
          <Piano
            notes={chordToNotes[tokenToChord[token][variant]]}
            octaveOffset={3}
            numKeys={29}
          />
        </div>
        <div className="grow-[1] flex flex-col items-center justify-center h-full w-full space-y-[2dvh] min-h-0">
          <p className="text-[2.5dvh]">All variants:</p>
          <div className="flex-1 bg-zinc-900 w-full max-h-screen p-[2dvh] overflow-y-auto min-h-0">
            <div
              className="grid gap-[2dvh] overflow-y-auto w-full h-full"
              style={{
                gridTemplateColumns: "repeat(auto-fit, minmax(20dvh, 1fr))",
                minHeight: "0",
              }}
            >
              {tokenToChord[token].map((_, i) => (
                <button
                  className="flex flex-row justify-center items-center space-x-[0.4dvh] p-[2dvh] rounded-[1dvh] w-full overflow-hidden outline-none filter active:brightness-90 hover:filter hover:brightness-110 max-h-[10dvh] min-h-[8dvh] bg-violet-700"
                  onClick={() => {
                    playChord(tokenToChord[token][i]);
                    setVariant(i);
                  }}
                  key={i}
                  title={`Change the preview variant to ${tokenToChord[token][i]}`}
                >
                  {tokenToChord[token][i]}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-row w-full justify-evenly">
            <button
              className="flex flex-row justify-center items-center space-x-[0.4dvh] p-[2dvh] rounded-[1dvh] filter active:brightness-90 hover:filter hover:brightness-110 max-h-[10dvh] bg-zinc-800"
              onClick={() => {
                variantsFromSuggestions ? setAsDefault() : applyToAll();
              }}
            >
              {variantsFromSuggestions ? "Set as default" : "Apply to all"}
            </button>
            <button
              className="flex flex-row justify-center items-center space-x-[0.4dvh] p-[2dvh] rounded-[1dvh] filter active:brightness-90 hover:filter hover:brightness-110 max-h-[10dvh] bg-zinc-800"
              onClick={() => {
                variantsFromSuggestions ? variantUseOnce() : applyOnce();
              }}
            >
              {variantsFromSuggestions ? "Use once" : "Apply once"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
