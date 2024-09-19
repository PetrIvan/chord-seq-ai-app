"use client";
import React, { useState, useEffect, useRef } from "react";
import { useStore } from "@/state/use_store";

import { predict } from "@/models/models";
import { tokenToChord } from "@/data/token_to_chord";
import { chordToNotes } from "@/data/chord_to_notes";

import { shallow } from "zustand/shallow";
import { clone, isEqual } from "lodash";
import { playChord } from "@/playback/player";

import SearchBar from "./search_bar";
import Decay from "./decay";
import Chord from "./chord";
import ChordGrid from "./chord_grid";
import StepByStepTutorial from "../overlays/step_by_step_tutorial";

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
  matchType: number;
  matchAnyVariant: boolean;
  enabledShortcuts: boolean;
  suggestionsIncludeVariants: boolean;
  setVariantsOpen: (open: boolean) => void;
  setSelectedToken: (token: number) => void;
  setSelectedVariant: (variant: number) => void;
  setIsVariantsOpenFromSuggestions: (
    isVariantsOpenFromSuggestions: boolean,
  ) => void;
  defaultVariants: number[];
  isDownloadingModel: boolean;
  percentageDownloaded: number;
  modelSize: number;
  isLoadingSession: boolean;
  customScrollbarEnabled: boolean;
  forceRerender: boolean;
}

// This logic is quite complex, but given that the rerendering
// of suggestions is very expensive, it is not a problem
function arePropsEqual(prevProps: Props, newProps: Props) {
  // Short-circuit when the forceRerender flag is set
  if (prevProps.forceRerender !== newProps.forceRerender) {
    return false;
  }

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
    prevProps.matchType !== newProps.matchType ||
    prevProps.matchAnyVariant !== newProps.matchAnyVariant ||
    prevProps.enabledShortcuts !== newProps.enabledShortcuts ||
    prevProps.suggestionsIncludeVariants !==
      newProps.suggestionsIncludeVariants ||
    prevProps.isDownloadingModel !== newProps.isDownloadingModel ||
    prevProps.percentageDownloaded !== newProps.percentageDownloaded ||
    prevProps.modelSize !== newProps.modelSize ||
    prevProps.isLoadingSession !== newProps.isLoadingSession ||
    prevProps.customScrollbarEnabled !== newProps.customScrollbarEnabled
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
    }[],
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
    prevProps.chords.slice(0, prevProps.selectedChord),
  );
  const newChords = collapseChords(
    newProps.chords.slice(0, newProps.selectedChord),
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
    matchType,
    matchAnyVariant,
    enabledShortcuts,
    suggestionsIncludeVariants,
    setVariantsOpen,
    setSelectedToken,
    setSelectedVariant,
    setIsVariantsOpenFromSuggestions,
    defaultVariants,
    isDownloadingModel,
    percentageDownloaded,
    modelSize,
    isLoadingSession,
    customScrollbarEnabled,
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
      state.matchType,
      state.matchAnyVariant,
      state.enabledShortcuts,
      state.includeVariants,
      state.setVariantsOpen,
      state.setSelectedToken,
      state.setSelectedVariant,
      state.setIsVariantsOpenFromSuggestions,
      state.defaultVariants,
      state.isDownloadingModel,
      state.percentageDownloaded,
      state.modelSize,
      state.isLoadingSession,
      state.customScrollbarEnabled,
    ],
    shallow,
  );

  // Rerender on window resize (necessary to resize the suggestions grid)
  const [forceRerender, setForceRerender] = useState(false);

  useEffect(() => {
    function handleResize() {
      // Force a rerender
      setForceRerender(true);
    }

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const timeoutIDRef = useRef<number | null>(null);
  useEffect(() => {
    if (forceRerender) {
      // Clear the previous timeout
      if (timeoutIDRef.current) {
        window.clearTimeout(timeoutIDRef.current);
      }
      // Reset the flag after a delay
      timeoutIDRef.current = window.setTimeout(() => {
        setForceRerender(false);
      }, 100);
    }
  }, [forceRerender]);

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
      matchType={matchType}
      matchAnyVariant={matchAnyVariant}
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
      customScrollbarEnabled={customScrollbarEnabled}
      forceRerender={forceRerender}
      modelSize={modelSize}
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
  matchType,
  matchAnyVariant,
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
  customScrollbarEnabled,
  forceRerender,
  modelSize,
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
  const prevChordProbsLoading = useRef(chordProbsLoading);
  useEffect(() => {
    // Only predict if the prediction is requested
    if (prevChordProbsLoading.current === chordProbsLoading) return;
    prevChordProbsLoading.current = chordProbsLoading;
    if (!chordProbsLoading) return;

    // Get the style if the model is conditional
    const style = normalizeStyle(selectedGenres).concat(
      normalizeStyle(selectedDecades),
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
              "Model not loaded, probably due to timeout. Please reload the page, your progress is saved.",
            );
            break;
          case "sequence is too long":
            alert("Maximum number of chords reached. Please start a new song.");
            break;
          default:
            if ("no available backend found" in error) {
              alert(
                "No backend found. Please reload the page, your progress is saved. If the problem persists, try using a different browser.",
              );
            }

            alert(
              `An error has occurred, try reloading the page. Your progress is saved.\n${error.message}`,
            );
            break;
        }
        setChordProbsLoading(false);
        setErrorOccured(true);
      });
  }, [
    chordProbsLoading,
    chords,
    modelPath,
    selectedChord,
    selectedDecades,
    selectedGenres,
  ]);

  /* Keyboard shortcuts */
  const enabledShortcutsRef = useRef(enabledShortcuts);

  useEffect(() => {
    enabledShortcutsRef.current = enabledShortcuts;
  }, [enabledShortcuts]);

  const defaultVariantsRef = useRef(defaultVariants);

  useEffect(() => {
    defaultVariantsRef.current = defaultVariants;
  }, [defaultVariants]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (
        "Digit" === event.code.substring(0, 5) &&
        enabledShortcutsRef.current
      ) {
        event.preventDefault();
        let number = parseInt(event.code.substring(5, 6));
        if (number === 0) number = 10;

        if (
          number - 1 < chordProbsRef.current.length &&
          !chordProbsLoadingRef.current
        ) {
          let token = chordProbsRef.current[number - 1].token;
          let variant = defaultVariantsRef.current[token];
          replaceChord(token, variant);
          playChord(tokenToChord[token][variant]);
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [replaceChord]);

  /* Rendering */
  // Render the suggestions
  function variantMatches(token: number, variantIndex: number) {
    // If the search query is empty, all chords match
    if (searchQuery === "") return true;

    const normalizedSearchQuery = searchQuery.toLowerCase();
    const name = tokenToChord[token][variantIndex].toLowerCase();

    // Exact match
    if (normalizedSearchQuery.includes(`"${name}"`)) {
      return true;
    }

    // Check whether contains all keywords (space-separated)
    const keywords = normalizedSearchQuery.split(/\s+/);
    return keywords.every((keyword) => name.includes(keyword));
  }

  function notesMatch(
    notes: number[],
    searchNotes: number[],
    matchType: number,
  ) {
    // Remove duplicate notes
    notes = notes.filter((note, index) => notes.indexOf(note) === index);
    searchNotes = searchNotes.filter(
      (note, index) => searchNotes.indexOf(note) === index,
    );

    if (matchType === 0) {
      // At least match (i.e. searchNotes is a subset of notes)
      return searchNotes.every((note) => notes.includes(note));
    } else if (matchType === 1) {
      // At most match (i.e. notes is a subset of searchNotes)
      return notes.every((note) => searchNotes.includes(note));
    } else {
      // Exact match
      if (searchNotes.length !== notes.length) return false;
      return searchNotes.every((note) => notes.includes(note));
    }
  }

  function getChordsList() {
    let chordsList = [];
    for (let i = 0; i < chordProbs.length; i++) {
      let { token, prob } = chordProbs[i];

      // Filter out chords that don't match the search query
      let variant = 0;
      if (suggestionsIncludeVariants) {
        // Check if any variant matches
        let anyMatch = false;
        for (let j = 0; j < tokenToChord[token].length; j++) {
          if (variantMatches(token, j)) {
            anyMatch = true;
            variant = j;
            break;
          }
        }

        // Skip if no match
        if (!anyMatch) continue;
      } else {
        // Skip if the default variant doesn't match
        variant = defaultVariants[token];
        if (!variantMatches(token, variant)) continue;
      }

      // Filter out chords that don't contain the search notes
      if (searchNotes.length > 0) {
        let normSearchNotes = clone(searchNotes);
        if (matchAnyVariant) {
          let notes = chordToNotes[tokenToChord[token][variant]];

          // Normalize both notes and searchNotes to be in the same octave
          notes = notes.map((note) => note % 12);
          normSearchNotes = normSearchNotes.map((note) => note % 12);

          // Check if the notes match (variants are irrelevant due to the normalization)
          if (!notesMatch(notes, normSearchNotes, matchType)) continue;
        } else {
          // Check all variants
          let allVariantNotes: number[][] = [];
          for (let j = 0; j < tokenToChord[token].length; j++) {
            let variantNotes = chordToNotes[tokenToChord[token][j]];

            // Normalize notes to start from the lowest octave
            const lowestOctave = Math.round(Math.min(...variantNotes) / 12);
            variantNotes = variantNotes.map((note) => note - lowestOctave * 12);

            allVariantNotes.push(variantNotes);
          }

          // Normalize searchNotes to start from the lowest octave
          const lowestOctave = Math.round(Math.min(...normSearchNotes) / 12);
          normSearchNotes = normSearchNotes.map(
            (note) => note - lowestOctave * 12,
          );

          // Check if any variant matches
          let anyMatch = false;
          for (let j = 0; j < allVariantNotes.length; j++) {
            let notes = allVariantNotes[j];

            if (notesMatch(notes, normSearchNotes, matchType)) {
              variant = j;
              anyMatch = true;
              break;
            }
          }

          if (!anyMatch) continue;
        }
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
        />,
      );
    }
    return chordsList;
  }

  // Units
  const [oneDvhInPx, setOneDvhInPx] = useState(window.innerHeight / 100);
  useEffect(() => {
    const handleResize = () => {
      setOneDvhInPx(window.innerHeight / 100);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  function pxToDvh(px: number) {
    return px / oneDvhInPx;
  }

  // Render the content
  let content: JSX.Element;
  const contentContainerRef = useRef<HTMLDivElement>(null);
  if (selectedChord === -1) {
    content = (
      <p className="truncate text-[2dvw] text-zinc-500">
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
    else if (isDownloadingModel) {
      text = `Loading model...`;
      if (modelSize > 0) {
        let mbDownloaded = (percentageDownloaded * modelSize).toFixed(1);
        text += ` ${mbDownloaded}/${modelSize.toFixed(1)} MB`;
      }
    } else if (isLoadingSession) text = "Loading session...";
    else if (chordProbsLoading) text = "Predicting suggestions...";

    content = (
      <div className="flex h-full flex-col items-center justify-center">
        <p className="animate-pulse truncate text-[2dvw] text-zinc-500">
          {text}
        </p>
      </div>
    );
  } else {
    const chordList = getChordsList();

    if (chordList.length === 0) {
      content = (
        <div className="flex h-full flex-col items-center justify-center">
          <p className="max-w-[50%] text-center text-[2dvw] text-zinc-500">
            Haven&apos;t found what you&apos;re looking for? Try enabling
            variants or changing the search query.
          </p>
        </div>
      );
    } else {
      if (forceRerender) {
        // Show a loading animation while resizing
        content = (
          <div className="flex h-full flex-col items-center justify-center">
            <p className="animate-pulse truncate text-[2dvw] text-zinc-500">
              Loading...
            </p>
          </div>
        );
      } else {
        // Manual auto-sizing to obtain column count (otherwise inaccessable by cells)
        let sliderWidth = 17; // px
        let prefferedColumnWidth = 25; // dvh
        const containerWidth = pxToDvh(
          (contentContainerRef.current?.clientWidth || 0) - sliderWidth,
        );
        const columnWidth = Math.max(
          prefferedColumnWidth,
          containerWidth / Math.floor(containerWidth / prefferedColumnWidth),
        );
        const columnCount = Math.floor(containerWidth / columnWidth);

        content = ChordGrid(chordList, columnCount);
      }
    }
  }

  // Add custom scrollbar to the suggestions virtualized grid manually, as the library does not support it
  useEffect(() => {
    let suggestions = document.getElementsByClassName(
      "ReactVirtualized__Grid",
    )[0];
    let scrollbarText =
      " scrollbar-thin scrollbar-track-zinc-800 scrollbar-track-rounded-full scrollbar-thumb-zinc-700 hover:scrollbar-thumb-zinc-600 active:scrollbar-thumb-zinc-500 scrollbar-thumb-rounded-full";
    if (
      suggestions &&
      customScrollbarEnabled &&
      !suggestions.className.includes("scrollbar-thin")
    ) {
      suggestions.className += scrollbarText;
    }
  }, [customScrollbarEnabled, content]);

  return (
    <div className="flex h-full min-h-0 w-full flex-col rounded-[0.5dvw]">
      {selectedChord !== -1 && (
        <div className="flex flex-row justify-between rounded-t-[0.5dvw] bg-zinc-900 p-[0.5dvw] px-[1dvw]">
          <SearchBar />
          <Decay />
        </div>
      )}
      <div className="flex max-h-screen min-h-0 w-full flex-1 flex-col items-center justify-center rounded-b-[0.5dvw] bg-zinc-900 pl-[0.5dvw]">
        <div
          className={`h-full w-full ${
            selectedChord === -1
              ? "flex min-h-0 flex-col items-center justify-center"
              : ""
          }`}
          ref={contentContainerRef}
        >
          {content}
        </div>
        <StepByStepTutorial
          step={2}
          text="Wait for the AI model to load, it may take a while"
          position="above"
          elementRef={contentContainerRef}
          // Allow only when chords are predicted
          canContinue={
            !isDownloadingModel &&
            !isLoadingSession &&
            !chordProbsLoading &&
            selectedChord !== -1
          }
          autoContinue={true}
        />
        <StepByStepTutorial
          step={3}
          text="Click on any chord to use it in your song"
          position="above"
          elementRef={contentContainerRef}
          canContinue={chords[0]?.token !== -1}
        />
        <StepByStepTutorial
          step={6}
          text="Choose the second chord; the color indicates the predicted probability"
          position="above"
          elementRef={contentContainerRef}
          canContinue={chords[1]?.token !== -1}
        />
      </div>
    </div>
  );
}, arePropsEqual);
