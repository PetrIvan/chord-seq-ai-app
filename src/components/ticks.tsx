"use client";
import React, { useEffect, useState } from "react";
import { useStore } from "@/state/use_store";
import { shallow } from "zustand/shallow";

interface Props {
  top: boolean;
  availableSpace: number;
  timelineStart: number;
}

export default function Ticks({ top, availableSpace, timelineStart }: Props) {
  const [signature, zoom, timelinePosition] = useStore(
    (state) => [state.signature, state.zoom, state.timelinePosition],
    shallow
  );

  const [tickIds, setTickIds] = useState<number[]>([]);

  // Only add ticks that are necessary (could be optimized further)
  useEffect(() => {
    let [signatureNumerator] = signature;
    let tickSpace = (zoom * 100) / signatureNumerator;
    let numTicks =
      Math.ceil(
        (availableSpace - timelinePosition + timelineStart) / tickSpace
      ) + 1;

    const ids: number[] = [];
    for (let i = 0; i < numTicks; i++) {
      ids.push(i);
    }
    setTickIds(ids);
  }, [availableSpace, signature, zoom, timelinePosition]);

  // Render a tick
  const tick = (id: number) => {
    let [signatureNumerator] = signature;
    let tickSpace = (zoom * 100) / signatureNumerator;
    const tickStyle = { marginRight: id < tickIds.length - 1 ? tickSpace : 0 };
    const isMajorTick = id % signatureNumerator === 0;
    return (
      <div
        key={id}
        className={`relative ${isMajorTick ? "h-[1dvw]" : "h-[0.5dvw]"}`}
        style={tickStyle}
      >
        {/* To make the tick width not influence the distribution while being visible */}
        <div className="absolute h-full w-full border-r-[0.15dvw] border-white" />
      </div>
    );
  };

  return (
    <div
      className={`flex flex-row max-w-full justify-start ${
        top ? "items-start" : "items-end mt-[1dvw]"
      }`}
      style={{ transform: `translateX(${timelinePosition}px)` }}
    >
      {tickIds.map((id) => tick(id))}
    </div>
  );
}
