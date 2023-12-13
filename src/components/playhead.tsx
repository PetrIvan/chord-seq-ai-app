"use client";
import React, { useState, useRef, useEffect } from "react";
import { useStore } from "@/state/use_store";
import { shallow } from "zustand/shallow";

interface Props {
  timelineStart: number;
}

export default function Playhead({ timelineStart }: Props) {
  const [zoom, signature, timelinePosition, playheadPosition] = useStore(
    (state) => [
      state.zoom,
      state.signature,
      state.timelinePosition,
      state.playheadPosition,
    ],
    shallow
  );

  let [numerator, denominator] = signature;
  const actualPosition =
    (playheadPosition * 100 * zoom * denominator) / 4 / numerator +
    timelineStart;

  return (
    <div
      className={`absolute top-0 bottom-0 z-10 flex flex-col h-full items-center justify-between cursor-ew-resize`}
      style={{
        left: actualPosition,
        transform: `translateX(-50%) translateX(${timelinePosition}px)`,
      }}
    >
      <svg viewBox="0 0 27 24" className="fill-sky-600 h-[1dvw] w-[1dvw]">
        <path d="M13.5 24L0.0 0L27.0 0L13.5 24Z" />
      </svg>
      <div className="border-r-[0.2dvw] border-sky-600 h-full" />
      <svg viewBox="0 0 27 24" className="fill-sky-600 h-[1dvw] w-[1dvw]">
        <path d="M13.5 0L27.0 24H0.0L13.5 0Z" />
      </svg>
    </div>
  );
}
