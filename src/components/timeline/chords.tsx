"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useStore } from "@/state/use_store";
import { shallow } from "zustand/shallow";
import { cloneDeep, isEqual } from "lodash";
import { Reorder, MotionConfig } from "framer-motion";

import ChordReorderItem from "./chord_reorder_item";
import Chord from "./chord";

type Chords = {
  index: number;
  token: number;
  duration: number;
  variant: number;
  key?: number;
}[];

export default function Chords() {
  const [
    timelinePosition,
    chords,
    setChords,
    isStepByStepTutorialOpen,
    resizingChord,
    isPinchZooming,
    isReordering,
    setIsReordering,
    isMobile,
  ] = useStore(
    (state) => [
      state.timelinePosition,
      state.chords,
      state.setChords,
      state.isStepByStepTutorialOpen,
      state.resizingChord,
      state.isPinchZooming,
      state.isReordering,
      state.setIsReordering,
      state.isMobile,
    ],
    shallow,
  );

  // Assign random unique keys to each chord
  const assignKeys = useCallback((chords: Chords) => {
    return chords.map((chord) => ({
      ...chord,
      key: chord.key ?? Math.random(),
    }));
  }, []);

  const [chordsWithKey, setChordsWithKey] = useState<Chords>(
    assignKeys(chords),
  );

  const chordsWithKeyRef = useRef(chordsWithKey);

  useEffect(() => {
    chordsWithKeyRef.current = chordsWithKey;
  }, [chordsWithKey]);

  const isReorderingRef = useRef(isReordering);

  useEffect(() => {
    isReorderingRef.current = isReordering;
  }, [isReordering]);

  useEffect(() => {
    if (isReorderingRef.current) return; // Skip updating while dragging

    if (chords.length !== chordsWithKeyRef.current.length) {
      // If a chord was added/removed, assign new keys
      setChordsWithKey(assignKeys(chords));
      return;
    }

    // Detect updates to chord properties (but not the index)
    let updatedChords = cloneDeep(chordsWithKeyRef.current);
    let changed = false;

    for (let i = 0; i < chords.length; i++) {
      const chordChanged =
        chords[i].token !== chordsWithKeyRef.current[i].token ||
        chords[i].duration !== chordsWithKeyRef.current[i].duration ||
        chords[i].variant !== chordsWithKeyRef.current[i].variant;

      if (chordChanged) {
        updatedChords[i] = {
          ...chords[i],
          key: chordsWithKeyRef.current[i].key,
        };
        changed = true;
      }
    }

    if (changed) {
      setChordsWithKey(updatedChords);
    }
  }, [chords, assignKeys]);

  function reindexChords(chords: Chords) {
    const newChords = cloneDeep(chords);

    for (let i = 0; i < newChords.length; i++) {
      newChords[i].index = i;
    }

    return newChords;
  }

  function handleReorderEnd() {
    if (!isReordering) return;

    // Reorder the chords array based on the new order
    let newChords = cloneDeep(chordsWithKey);
    newChords.splice(0, newChords.length, ...newChords);

    // Reset the reordering state after a short delay to avoid accidental selection
    setTimeout(() => {
      setIsReordering(false);
    }, 10);

    // Reindex the chords
    const reindexedChords = reindexChords(newChords);
    if (!isEqual(reindexedChords, newChords)) {
      setChords(reindexedChords);
    }
    setChordsWithKey(reindexChords(chordsWithKey));
  }

  return (
    <MotionConfig
      // Disable animations if not reordering (to avoid chords lagging behind while scrolling)
      transition={isReordering ? { duration: 0.2 } : { duration: 0.0 }}
    >
      {isStepByStepTutorialOpen ? (
        <div className="mt-[1dvw] flex h-full max-w-full flex-row items-center">
          {chordsWithKey.map((chord) => (
            <Chord
              key={chord.key}
              index={chord.index}
              token={chord.token}
              duration={chord.duration}
              variant={chord.variant}
            />
          ))}
        </div>
      ) : (
        <Reorder.Group
          className="mt-[1dvw] flex h-full max-w-full flex-row items-center"
          axis="x"
          values={chordsWithKey}
          onReorder={setChordsWithKey}
          style={{
            transform: `translateX(${timelinePosition}dvw)`,
          }}
        >
          {chordsWithKey.map((chord) => (
            <ChordReorderItem
              key={chord.key}
              chord={chord}
              preventStart={resizingChord || isPinchZooming || isReordering}
              handleReorderEnd={handleReorderEnd}
              setIsReordering={setIsReordering}
              resizingChord={resizingChord}
              isMobile={isMobile}
            />
          ))}
        </Reorder.Group>
      )}
    </MotionConfig>
  );
}
