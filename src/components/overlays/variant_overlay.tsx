"use client";
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
    shallow,
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
      <div className="mb-[5dvh] flex flex-col items-center justify-center space-y-[2dvh]">
        <p className="text-[5dvh] font-semibold">
          {tokenToChord[Math.max(token, 0)][variant]}
        </p>
        <Piano
          notes={chordToNotes[tokenToChord[Math.max(token, 0)][variant]]}
          octaveOffset={3}
          numKeys={29}
        />
      </div>
      <div className="flex h-fit min-h-0 w-full flex-col items-center justify-center space-y-[2dvh]">
        <p className="text-[2.5dvh]">All variants:</p>
        <div className="max-h-screen min-h-0 w-full bg-zinc-900">
          <div
            className={
              `grid h-full w-full gap-[2dvh] overflow-y-auto p-[1dvh] ` +
              `${
                customScrollbarEnabled
                  ? "scrollbar-thin scrollbar-track-zinc-800 scrollbar-thumb-zinc-700 scrollbar-track-rounded-full scrollbar-thumb-rounded-full hover:scrollbar-thumb-zinc-600 active:scrollbar-thumb-zinc-500"
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
                className="flex h-[10dvh] min-h-[8dvh] w-full flex-row items-center justify-center space-x-[0.4dvh] overflow-hidden rounded-[1dvh] bg-violet-700 p-[2dvh] outline-none filter hover:brightness-110 hover:filter active:brightness-90"
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
        <div className="flex w-full flex-row justify-evenly">
          <button
            className="flex max-h-[10dvh] flex-row items-center justify-center space-x-[0.4dvh] rounded-[1dvh] bg-zinc-800 p-[2dvh] filter hover:brightness-110 hover:filter active:brightness-90"
            onClick={() => {
              setEnabledShortcuts(true);
              variantsFromSuggestions ? setAsDefault() : applyToAll();
            }}
          >
            {variantsFromSuggestions ? "Set as default" : "Apply to all"}
          </button>
          <button
            className="flex max-h-[10dvh] flex-row items-center justify-center space-x-[0.4dvh] rounded-[1dvh] bg-zinc-800 p-[2dvh] filter hover:brightness-110 hover:filter active:brightness-90"
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
