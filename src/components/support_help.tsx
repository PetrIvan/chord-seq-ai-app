"use client";
import { useStore } from "@/state/use_store";
import { shallow } from "zustand/shallow";
import { useEffect, useRef } from "react";

import StepByStepTutorial from "./overlays/step_by_step_tutorial";

export default function SupportHelp() {
  const [
    setIsSupportUsOverlayOpen,
    timesExported,
    setIsWelcomeOverlayOpen,
    setIsStepByStepTutorialOpen,
    setIsSupportUsAfterExport,
    setIsSupportUsLandingPage,
    dontShowSupportUsOverlay,
  ] = useStore(
    (state) => [
      state.setIsSupportUsOverlayOpen,
      state.timesExported,
      state.setIsWelcomeOverlayOpen,
      state.setIsStepByStepTutorialOpen,
      state.setIsSupportUsAfterExport,
      state.setIsSupportUsAfterExport,
      state.dontShowSupportUsOverlay,
    ],
    shallow,
  );

  // Show the support us overlay after exporting 1, 10, or 25 times
  const prevTimesExported = useRef(timesExported);
  useEffect(() => {
    if (timesExported != prevTimesExported.current) {
      prevTimesExported.current = timesExported;

      if (dontShowSupportUsOverlay) return;

      if (timesExported === 1 || timesExported === 10 || timesExported === 25) {
        try {
          (globalThis as any).umami.track("exported-" + timesExported);
        } catch {
          console.error("Failed to track event");
        }

        setIsSupportUsLandingPage(false);
        setIsSupportUsAfterExport(true);
        setIsSupportUsOverlayOpen(true);
      }
    }
  }, [
    timesExported,
    setIsSupportUsOverlayOpen,
    setIsSupportUsLandingPage,
    dontShowSupportUsOverlay,
    setIsSupportUsAfterExport,
  ]);

  const helpButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <section className="flex h-[9dvh] min-w-0 flex-row items-stretch justify-evenly rounded-[0.5dvw] bg-zinc-900 p-[2dvh] text-[2.5dvh]">
      {/* Support us button */}
      <button
        className="flex h-full w-full select-none flex-col items-center justify-center filter active:brightness-90"
        title="Support us"
        onClick={() => {
          setIsSupportUsAfterExport(false);
          setIsSupportUsLandingPage(false);
          setIsSupportUsOverlayOpen(true);

          try {
            (globalThis as any).umami.track("support-us-heart");
          } catch {
            console.error("Failed to track event");
          }
        }}
      >
        <img src="/heart.svg" alt="❤️" className="h-full w-full" />
      </button>
      {/* Get help button */}
      <button
        className="flex h-full w-full select-none flex-col items-center justify-center filter active:brightness-90"
        title="Get help"
        onClick={() => {
          setIsStepByStepTutorialOpen(false);
          setIsWelcomeOverlayOpen(true);
        }}
        ref={helpButtonRef}
      >
        <img src="/get-help.svg" alt="?" className="h-full w-full" />
      </button>
      <StepByStepTutorial
        step={8}
        text="That's it for now! If you get stuck, this is where you can find help."
        position="below-left"
        elementRef={helpButtonRef}
      />
    </section>
  );
}
