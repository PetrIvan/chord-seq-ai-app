"use client";
import { useStore } from "@/state/use_store";
import { shallow } from "zustand/shallow";
import { useRef } from "react";

import StepByStepTutorial from "./overlays/step_by_step_tutorial";

export default function GetHelp() {
  const [
    setIsWelcomeOverlayOpen,
    setIsStepByStepTutorialOpen,
    setEnabledShortcuts,
  ] = useStore(
    (state) => [
      state.setIsWelcomeOverlayOpen,
      state.setIsStepByStepTutorialOpen,
      state.setEnabledShortcuts,
    ],
    shallow
  );

  const helpButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <section className="bg-zinc-900 min-w-0 h-[9dvh] p-[2dvh] rounded-[0.5dvw] w-full flex flex-row justify-evenly text-[2.5dvh]">
      <button
        className="grow select-none filter active:brightness-90 flex flex-col justify-center items-center"
        title="Open documentation"
        onClick={() => {
          setEnabledShortcuts(true);
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
