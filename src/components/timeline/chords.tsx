"use client";
import React from "react";
import { useStore } from "@/state/use_store";
import { shallow } from "zustand/shallow";

import Chord from "./chord";

export default function Chords() {
  const [chords, timelinePosition, isStepByStepTutorialOpen, tutorialStep] =
    useStore(
      (state) => [
        state.chords,
        state.timelinePosition,
        state.isStepByStepTutorialOpen,
        state.tutorialStep,
      ],
      shallow
    );

  const chordList = chords.map((chord) => {
    return (
      <Chord
        key={chord.index}
        index={chord.index}
        token={chord.token}
        duration={chord.duration}
        variant={chord.variant}
      />
    );
  });

  return (
    <div
      className="h-full flex flex-row max-w-full mt-[1dvw] items-center"
      // Apply the transform only when the tutorial is not in progress (to avoid a bug with fixed position,
      // see https://stackoverflow.com/questions/2637058/position-fixed-doesnt-work-when-using-webkit-transform)
      style={{
        transform:
          isStepByStepTutorialOpen && [1, 5].includes(tutorialStep)
            ? "none"
            : `translateX(${timelinePosition}dvw)`,
      }}
    >
      {chordList}
    </div>
  );
}
