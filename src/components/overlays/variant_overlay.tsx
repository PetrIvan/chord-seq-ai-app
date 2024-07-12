"use client";
import React, { useEffect } from "react";
import { useStore } from "@/state/use_store";
import { shallow } from "zustand/shallow";
import { cloneDeep } from "lodash";

import { chordToNotes } from "@/data/chord_to_notes";
import { tokenToChord } from "@/data/token_to_chord";

import { playChord } from "@/playback/player";

import Piano from "../piano";
import Overlay from "../ui/overlay";

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
    customScrollbarEnabled,
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
      state.customScrollbarEnabled,
    ],
    shallow
  );

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
    <Overlay
      isOverlayOpen={variantsOpen}
      setIsOverlayOpen={setVariantsOpen}
      enabledOverflow={false}
    >
      <div className="flex flex-col items-center justify-center space-y-[2dvh] mb-[5dvh]">
        <p className="text-[5dvh] font-semibold">
          {tokenToChord[Math.max(token, 0)][variant]}
        </p>
        <Piano
          notes={chordToNotes[tokenToChord[Math.max(token, 0)][variant]]}
          octaveOffset={3}
          numKeys={29}
        />
      </div>
      <div className="flex flex-col items-center justify-center h-fit w-full space-y-[2dvh] min-h-0">
        <p className="text-[2.5dvh]">All variants:</p>
        <div className="bg-zinc-900 w-full max-h-screen min-h-0">
          <div
            className={
              `grid gap-[2dvh] p-[1dvh] w-full h-full overflow-y-auto ` +
              `${
                customScrollbarEnabled
                  ? "scrollbar-thin scrollbar-track-zinc-800 scrollbar-track-rounded-full scrollbar-thumb-zinc-700 hover:scrollbar-thumb-zinc-600 active:scrollbar-thumb-zinc-500 scrollbar-thumb-rounded-full"
                  : ""
              }`
            }
            style={{
              gridTemplateColumns: "repeat(auto-fit, minmax(20dvh, 1fr))",
              minHeight: "0",
            }}
          >
            {tokenToChord[Math.max(token, 0)].map((_, i) => (
              <button
                className="h-[10dvh] min-h-[8dvh] flex flex-row justify-center items-center space-x-[0.4dvh] p-[2dvh] rounded-[1dvh] w-full overflow-hidden outline-none filter active:brightness-90 hover:filter hover:brightness-110 bg-violet-700"
                onClick={() => {
                  playChord(tokenToChord[Math.max(token, 0)][i]);
                  setVariant(i);
                }}
                key={i}
                title={`Change the preview variant to ${
                  tokenToChord[Math.max(token, 0)][i]
                }`}
              >
                {tokenToChord[Math.max(token, 0)][i]}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-row w-full justify-evenly">
          <button
            className="flex flex-row justify-center items-center space-x-[0.4dvh] p-[2dvh] rounded-[1dvh] filter active:brightness-90 hover:filter hover:brightness-110 max-h-[10dvh] bg-zinc-800"
            onClick={() => {
              setEnabledShortcuts(true);
              variantsFromSuggestions ? setAsDefault() : applyToAll();
            }}
          >
            {variantsFromSuggestions ? "Set as default" : "Apply to all"}
          </button>
          <button
            className="flex flex-row justify-center items-center space-x-[0.4dvh] p-[2dvh] rounded-[1dvh] filter active:brightness-90 hover:filter hover:brightness-110 max-h-[10dvh] bg-zinc-800"
            onClick={() => {
              setEnabledShortcuts(true);
              variantsFromSuggestions ? variantUseOnce() : applyOnce();
            }}
          >
            {variantsFromSuggestions ? "Use once" : "Apply once"}
          </button>
        </div>
      </div>
    </Overlay>
  );
}
