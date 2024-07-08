"use client";
import React from "react";
import { useStore } from "@/state/use_store";
import { shallow } from "zustand/shallow";

import Chord from "./chord";

export default function Chords() {
  const [chords, timelinePosition] = useStore(
    (state) => [state.chords, state.timelinePosition],
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
      style={{ transform: `translateX(${timelinePosition}dvw)` }}
    >
      {chordList}
    </div>
  );
}
