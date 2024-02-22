"use client";
import React, { useState, useEffect, useRef } from "react";
import { useStore } from "@/state/use_store";

import { predict } from "@/models/models";
import { tokenToChord } from "@/data/token_to_chord";
import { chordToNotes } from "@/data/chord_to_notes";

import { shallow } from "zustand/shallow";
import { isEqual } from "lodash";
import { playChord } from "@/playback/player";

import SearchBar from "./search_bar";
import Decay from "./decay";
import Chord from "./chord";

interface Props {
  chords: {
    index: number;
    token: number;
    duration: number;
    variant: number;
  }[];
  replaceChord: (token: number, variant: number) => void;
  selectedChord: number;
  modelPath: string;
  selectedGenres: number[];
  selectedDecades: number[];
  decayFactor: number;
  searchQuery: string;
  searchNotes: number[];
  enabledShortcuts: boolean;
  suggestionsIncludeVariants: boolean;
  setVariantsOpen: (open: boolean) => void;
  setSelectedToken: (token: number) => void;
  setSelectedVariant: (variant: number) => void;
  setIsVariantsOpenFromSuggestions: (
    isVariantsOpenFromSuggestions: boolean
  ) => void;
  defaultVariants: number[];
  isDownloadingModel: boolean;
  percentageDownloaded: number;
  isLoadingSession: boolean;
}

// This logic is quite complex, but given that the rerendering
// of suggestions is very expensive, it is not a problem
function arePropsEqual(prevProps: Props, newProps: Props) {
  // Short-circuit when no chord is selected or if we select a chord (when no chord was selected)
  if (prevProps.selectedChord === -1 || newProps.selectedChord === -1) {
    return prevProps.selectedChord === newProps.selectedChord;
  }

  // Short-circuit when we change from unknown to known chord (or vice versa)
  const prevUnknown = prevProps.chords[prevProps.selectedChord].token === -1;
  const newUnknown = newProps.chords[newProps.selectedChord].token === -1;
  if ((prevUnknown && !newUnknown) || (!prevUnknown && newUnknown)) {
    return false;
  }

  // Compare generic props
  if (
    prevProps.modelPath !== newProps.modelPath ||
    prevProps.decayFactor !== newProps.decayFactor ||
    prevProps.searchQuery !== newProps.searchQuery ||
    prevProps.enabledShortcuts !== newProps.enabledShortcuts ||
    prevProps.suggestionsIncludeVariants !==
      newProps.suggestionsIncludeVariants ||
    prevProps.isDownloadingModel !== newProps.isDownloadingModel ||
    prevProps.percentageDownloaded !== newProps.percentageDownloaded ||
    prevProps.isLoadingSession !== newProps.isLoadingSession
  ) {
    return false;
  }

  // Compare the data the model actually uses (only up to selectedChord; empty chords (those denoted
  // by "?" i.e. token === -1) are not considered; consequent chords are collapsed; duration is not used)
  function collapseChords(
    chords: {
      index: number;
      token: number;
      duration: number;
      variant: number;
    }[]
  ) {
    const collapsedChords: number[] = [];
    for (let i = 0; i < chords.length; i++) {
      // Skip empty chords or repeated chords
      if (
        chords[i].token === collapsedChords[collapsedChords.length - 1] ||
        chords[i].token === -1
      )
        continue;

      collapsedChords.push(chords[i].token);
    }
    return collapsedChords;
  }

  const prevChords = collapseChords(
    prevProps.chords.slice(0, prevProps.selectedChord)
  );
  const newChords = collapseChords(
    newProps.chords.slice(0, newProps.selectedChord)
  );

  // Compare final the states
  return (
    isEqual(prevChords, newChords) &&
    isEqual(prevProps.selectedGenres, newProps.selectedGenres) &&
    isEqual(prevProps.selectedDecades, newProps.selectedDecades) &&
    isEqual(prevProps.searchNotes, newProps.searchNotes) &&
    isEqual(prevProps.defaultVariants, newProps.defaultVariants)
  );
}

// Export a memoized version of the component
export default function Suggestions() {
  const [
    chords,
    replaceChord,
    selectedChord,
    modelPath,
    selectedGenres,
    selectedDecades,
    decayFactor,
    searchQuery,
    searchNotes,
    enabledShortcuts,
    suggestionsIncludeVariants,
    setVariantsOpen,
    setSelectedToken,
    setSelectedVariant,
    setIsVariantsOpenFromSuggestions,
    defaultVariants,
    isDownloadingModel,
    percentageDownloaded,
    isLoadingSession,
  ] = useStore(
    (state) => [
      state.chords,
      state.replaceChord,
      state.selectedChord,
      state.modelPath,
      state.selectedGenres,
      state.selectedDecades,
      state.decayFactor,
      state.searchQuery,
      state.searchNotes,
      state.enabledShortcuts,
      state.includeVariants,
      state.setVariantsOpen,
      state.setSelectedToken,
      state.setSelectedVariant,
      state.setIsVariantsOpenFromSuggestions,
      state.defaultVariants,
      state.isDownloadingModel,
      state.percentageDownloaded,
      state.isLoadingSession,
    ],
    shallow
  );

  return (
    <MemoizedSuggestions
      chords={chords}
      replaceChord={replaceChord}
      selectedChord={selectedChord}
      modelPath={modelPath}
      selectedGenres={selectedGenres}
      selectedDecades={selectedDecades}
      decayFactor={decayFactor}
      searchQuery={searchQuery}
      searchNotes={searchNotes}
      enabledShortcuts={enabledShortcuts}
      suggestionsIncludeVariants={suggestionsIncludeVariants}
      setVariantsOpen={setVariantsOpen}
      setSelectedToken={setSelectedToken}
      setSelectedVariant={setSelectedVariant}
      setIsVariantsOpenFromSuggestions={setIsVariantsOpenFromSuggestions}
      defaultVariants={defaultVariants}
      isDownloadingModel={isDownloadingModel}
      percentageDownloaded={percentageDownloaded}
      isLoadingSession={isLoadingSession}
    />
  );
}

const MemoizedSuggestions = React.memo(function MemoizedSuggestions({
  chords,
  replaceChord,
  selectedChord,
  modelPath,
  selectedGenres,
  selectedDecades,
  decayFactor,
  searchQuery,
  searchNotes,
  enabledShortcuts,
  suggestionsIncludeVariants,
  setVariantsOpen,
  setSelectedToken,
  setSelectedVariant,
  setIsVariantsOpenFromSuggestions,
  defaultVariants,
  isDownloadingModel,
  percentageDownloaded,
  isLoadingSession,
}: Props) {
  /* Prediction states */
  const [chordProbsLoading, setChordProbsLoading] = useState(false);
  const chordProbsLoadingRef = useRef(chordProbsLoading);

  const [errorOccured, setErrorOccured] = useState(false);

  const [chordProbs, setChordProbs] = useState<
    { token: number; prob: number }[]
  >([]);
  const chordProbsRef = useRef(chordProbs);

  useEffect(() => {
    chordProbsRef.current = chordProbs;
  }, [chordProbs]);

  useEffect(() => {
    chordProbsLoadingRef.current = chordProbsLoading;
  }, [chordProbsLoading]);

  // Make the sum of the style be 1
  function normalizeStyle(style: number[]) {
    const sum = style.reduce((a, b) => a + b, 0);
    if (sum === 0) return style;
    return style.map((value) => value / sum);
  }

  /* Predict the next chord */
  // Calls the prediction, split into a separate useEffect to allow the UI to update before the prediction
  useEffect(() => {
    if (selectedChord === -1) return;
    setChordProbsLoading(true);
    setErrorOccured(false);
  }, [chords, selectedChord, modelPath, selectedGenres, selectedDecades]);

  // Actually predict the next chord when the prediction is requested (by chordProbsLoading)
  useEffect(() => {
    if (!chordProbsLoading) return;

    // Get the style if the model is conditional
    const style = normalizeStyle(selectedGenres).concat(
      normalizeStyle(selectedDecades)
    );
    const inputStyle = modelPath.includes("conditional") ? style : undefined;

    // Predict the next chord
    predict(chords.slice(0, selectedChord), modelPath, inputStyle)
      .then((result) => {
        setChordProbs(result as { token: number; prob: number }[]);
        setChordProbsLoading(false);
      })
      .catch((error) => {
        switch (error.message) {
          case "model not loaded":
            alert(
              "Model not loaded, probably due to timeout. Please reload the page, your progress is saved."
            );
            break;
          case "sequence is too long":
            alert("Maximum number of chords reached. Please start a new song.");
            break;
          default:
            if ("no available backend found" in error.message) {
              alert(
                "No backend found. Please reload the page, your progress is saved. If the problem persists, try using a different browser."
              );
            }

            alert(
              `An error has occurred, try reloading the page. Your progress is saved.\n${error}`
            );
            break;
        }
        setChordProbsLoading(false);
        setErrorOccured(true);
      });
  }, [chordProbsLoading]);

  /* Keyboard shortcuts */
  const enabledShortcutsRef = useRef(enabledShortcuts);

  useEffect(() => {
    enabledShortcutsRef.current = enabledShortcuts;
  }, [enabledShortcuts]);

  function handleKeyDown(event: KeyboardEvent) {
    if ("Digit" === event.code.substring(0, 5) && enabledShortcutsRef.current) {
      event.preventDefault();
      let number = parseInt(event.code.substring(5, 6));
      if (number === 0) number = 10;

      if (
        number - 1 < chordProbsRef.current.length &&
        !chordProbsLoadingRef.current
      ) {
        replaceChord(chordProbsRef.current[number - 1].token, 0);
      }
    }
  }

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  /* Rendering */
  // Render the suggestions
  function getChordsList() {
    let chordsList = [];
    for (let i = 0; i < chordProbs.length; i++) {
      let { token, prob } = chordProbs[i];

      // Filter out chords that don't match the search query
      let variant = 0;
      if (suggestionsIncludeVariants) {
        let anyMatch = false;
        for (let j = 0; j < tokenToChord[token].length; j++) {
          if (
            tokenToChord[token][j]
              .toLowerCase()
              .includes(searchQuery.toLowerCase())
          ) {
            anyMatch = true;
            variant = j;
            break;
          }
        }
        if (!anyMatch) continue;
      } else {
        variant = defaultVariants[token];
        if (
          !tokenToChord[token][variant]
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
        )
          continue;
      }

      // Filter out chords that don't contain the search notes
      if (searchNotes.length > 0) {
        const notes = chordToNotes[tokenToChord[token][variant]].map(
          (note) => note % 12
        );
        if (!searchNotes.every((note) => notes.includes(note % 12))) continue;
      }

      chordsList.push(
        <Chord
          key={token}
          index={i}
          token={token}
          variant={variant}
          prob={prob}
          decayFactor={decayFactor}
          playChord={playChord}
          replaceChord={replaceChord}
          setSelectedToken={setSelectedToken}
          setSelectedVariant={setSelectedVariant}
          setVariantsOpen={setVariantsOpen}
          setIsVariantsOpenFromSuggestions={setIsVariantsOpenFromSuggestions}
        />
      );
    }
    return chordsList;
  }

  // Render the content
  let content = null;
  if (selectedChord === -1) {
    content = (
      <p className="text-zinc-500 truncate text-[2dvw]">
        Select a chord to see suggestions based on context
      </p>
    );
  } else if (
    errorOccured ||
    isLoadingSession ||
    isDownloadingModel ||
    chordProbsLoading
  ) {
    let text = "Loading...";
    if (errorOccured) text = "An error has occurred";
    else if (isLoadingSession) text = "Loading session...";
    else if (isDownloadingModel)
      text = "Loading model... " + Math.round(percentageDownloaded * 100) + "%";
    else if (chordProbsLoading) text = "Predicting suggestions...";

    content = (
      <div className="h-full flex flex-col items-center justify-center">
        <p className="text-zinc-500 truncate text-[2dvw]">{text}</p>
      </div>
    );
  } else {
    const chordList = getChordsList();

    if (chordList.length === 0) {
      content = (
        <div className="h-full flex flex-col items-center justify-center">
          <p className="text-zinc-500 text-center text-[2dvw] max-w-[50%]">
            Haven&apos;t found what you&apos;re looking for? Try enabling
            variants or changing the search query.
          </p>
        </div>
      );
    } else {
      content = (
        <div
          className="grid gap-[1dvw] overflow-y-auto"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(10dvw, 1fr))",
            minHeight: "0",
          }}
        >
          {chordList}
        </div>
      );
    }
  }

  return (
    <div className="flex flex-col rounded-[0.5dvw] w-full h-full min-h-0">
      {selectedChord !== -1 && (
        <div className="flex flex-row justify-between bg-zinc-900 p-[0.5dvw] px-[1dvw] rounded-t-[0.5dvw]">
          <SearchBar />
          <Decay />
        </div>
      )}
      <div
        className={`flex-1 bg-zinc-900 w-full max-h-screen p-[1dvw] ${
          selectedChord === -1
            ? "flex flex-col justify-center items-center rounded-[0.5dvw] min-h-0"
            : "overflow-y-auto min-h-0"
        }`}
      >
        {content}
      </div>
    </div>
  );
},
arePropsEqual);
