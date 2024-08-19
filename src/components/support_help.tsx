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
    shallow
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
    <section className="bg-zinc-900 min-w-0 h-[9dvh] p-[2dvh] rounded-[0.5dvw] flex flex-row items-stretch justify-evenly text-[2.5dvh]">
      {/* Support us button */}
      <button
        className="w-full h-full select-none filter active:brightness-90 flex flex-col justify-center items-center"
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
        className="w-full h-full select-none filter active:brightness-90 flex flex-col justify-center items-center"
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
