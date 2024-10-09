"use client";
import { useStore } from "@/state/use_store";
import { shallow } from "zustand/shallow";

interface Props {
  timelineStart: number;
}

export default function Playhead({ timelineStart }: Props) {
  const [
    zoom,
    signature,
    timelinePosition,
    playheadPosition,
    isStepByStepTutorialOpen,
  ] = useStore(
    (state) => [
      state.zoom,
      state.signature,
      state.timelinePosition,
      state.playheadPosition,
      state.isStepByStepTutorialOpen,
    ],
    shallow,
  );

  let [numerator, denominator] = signature;
  const actualPosition =
    (playheadPosition * 10 * zoom * denominator) / 4 / numerator +
    timelineStart;

  return (
    <div
      className={`absolute bottom-0 top-0 z-10 flex h-full cursor-ew-resize flex-col items-center justify-between`}
      style={{
        left: `${actualPosition}dvw`,
        transform: `translateX(-50%) translateX(${isStepByStepTutorialOpen ? 0 : timelinePosition}dvw)`,
      }}
    >
      <svg viewBox="0 0 27 24" className="h-[1dvw] w-[1dvw] fill-blue-400">
        <path d="M13.5 24L0.0 0L27.0 0L13.5 24Z" />
      </svg>
      <div className="h-full border-r-[0.2dvw] border-blue-400" />
      <svg viewBox="0 0 27 24" className="h-[1dvw] w-[1dvw] fill-blue-400">
        <path d="M13.5 0L27.0 24H0.0L13.5 0Z" />
      </svg>
    </div>
  );
}
