"use client";
import React from "react";
import { useStore } from "@/state/use_store";
import { shallow } from "zustand/shallow";

import Chord from "./timeline/chord";

export default function Chords() {
  const [chords, timelinePosition] = useStore(
    (state) => [state.chords, state.timelinePosition],
    shallow
  );

  const chordList = chords.map((chord) => {
    const [id, token, duration] = chord;

    return <Chord key={id} token={token} duration={duration} id={id} />;
  });

  return (
    <div
      className="h-full flex flex-row max-w-full mt-[1dvw] items-center"
      style={{ transform: `translateX(${timelinePosition}px)` }}
    >
      {chordList}
    </div>
  );
}
