"use client";
import React, { useState, useEffect, useRef } from "react";
import { useStore } from "@/state/use_store";

import { predict } from "@/models/models";
import { detokenize } from "@/models/utils";

import { shallow } from "zustand/shallow";
import { isEqual } from "lodash";
import { playChord } from "@/playback/player";

import SearchBar from "./search_bar";
import Decay from "./decay";

interface Props {
  chords: [number, number, number][];
  replaceChord: (chord: number) => void;
  selectedChord: number;
  modelPath: string;
  selectedGenres: number[];
  selectedDecades: number[];
  decayFactor: number;
  searchQuery: string;
  enabledShortcuts: boolean;
}

// This logic is quite complex, but given that the rerendering
// of suggestions is very expensive, it is not a problem
function arePropsEqual(prevProps: Props, newProps: Props) {
  // Short-circuit when no chord is selected or if we select a chord (when no chord was selected)
  if (prevProps.selectedChord === -1 || newProps.selectedChord === -1) {
    return prevProps.selectedChord === newProps.selectedChord;
  }

  // Short-circuit when we change from unknown to known chord (or vice versa)
  const prevUnknown = prevProps.chords[prevProps.selectedChord][1] === -1;
  const newUnknown = newProps.chords[newProps.selectedChord][1] === -1;
  if ((prevUnknown && !newUnknown) || (!prevUnknown && newUnknown)) {
    return false;
  }

  // Compare the data the model actually uses (only up to selectedChord; empty chords (those denoted
  // by "?" i.e. token === -1) are not considered; consequent chords are collapsed; duration is not used)
  function collapseChords(chords: [number, number, number][]) {
    const collapsedChords: number[] = [];
    for (let i = 0; i < chords.length; i++) {
      // Skip empty chords or repeated chords
      if (
        chords[i][1] === collapsedChords[collapsedChords.length - 1] ||
        chords[i][1] === -1
      )
        continue;

      collapsedChords.push(chords[i][1]);
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
    prevProps.modelPath === newProps.modelPath &&
    isEqual(prevProps.selectedGenres, newProps.selectedGenres) &&
    isEqual(prevProps.selectedDecades, newProps.selectedDecades) &&
    prevProps.decayFactor === newProps.decayFactor &&
    prevProps.searchQuery === newProps.searchQuery &&
    prevProps.enabledShortcuts === newProps.enabledShortcuts
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
    enabledShortcuts,
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
      state.enabledShortcuts,
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
      enabledShortcuts={enabledShortcuts}
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
  enabledShortcuts,
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
              "Model not loaded. Please reload the page, your progress is saved."
            );
            break;
          case "sequence is too long":
            alert("Maximum number of chords reached. Please start a new song.");
            break;
          default:
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
        replaceChord(chordProbsRef.current[number - 1].token);
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
  // Interpolate between violet and black
  const color = (t: number) => {
    const violet = [139, 92, 246];
    const black = [0, 0, 0];
    const r = violet[0] * (1 - t) + black[0] * t;
    const g = violet[1] * (1 - t) + black[1] * t;
    const b = violet[2] * (1 - t) + black[2] * t;
    return `rgb(${r}, ${g}, ${b})`;
  };

  // Render the suggestions
  function getChordsList() {
    let chordsList = [];
    for (let i = 0; i < chordProbs.length; i++) {
      let { token, prob } = chordProbs[i];

      // Filter out chords that don't match the search query
      if (
        !detokenize(token).toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        continue;
      }

      chordsList.push(
        <button
          className="flex flex-row justify-center items-center space-x-[0.2dvw] p-[1dvw] rounded-[0.5dvw] w-full overflow-hidden outline-none filter active:brightness-90 hover:filter hover:brightness-110 max-h-[5dvw]"
          style={{
            // Interpolate between violet and black logarithmically
            backgroundColor: color(
              1 - (Math.log(prob) + decayFactor) / decayFactor
            ),
            minHeight: "5dvw",
          }}
          key={i}
          title={`Replace selected with ${detokenize(token)} (${(
            prob * 100
          ).toFixed(2)}%)`}
          onClick={() => {
            playChord(detokenize(token));
            replaceChord(token);
          }}
        >
          {detokenize(token)}
        </button>
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
  } else if (errorOccured) {
    content = (
      <div className="h-full flex flex-col items-center justify-center">
        <p className="text-zinc-500 truncate text-[2dvw]">
          An error has occurred
        </p>
      </div>
    );
  } else if (chordProbsLoading) {
    content = (
      <div className="h-full flex flex-col items-center justify-center">
        <p className="text-zinc-500 truncate text-[2dvw]">
          Predicting suggestions...
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
        {getChordsList()}
      </div>
    );
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
