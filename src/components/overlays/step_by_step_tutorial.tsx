"use client";
import { useStore } from "@/state/use_store";
import { useRef, useEffect, useState, useCallback } from "react";

interface Props {
  step: number; // Indexed from 0
  text: string;
  position: "below" | "above" | "left" | "right" | "below-left";
  elementRef: React.RefObject<HTMLElement>;
  canContinue?: boolean;
  autoContinue?: boolean;
}

// Showed when a user skips the video tutorial
// Appended to each of the key steps in the tutorial to guide the user through the interface
export default function StepByStepTutorial({
  step,
  text,
  position,
  elementRef,
  canContinue = true,
  autoContinue = false,
}: Props) {
  const [
    chords,
    isStepByStepTutorialOpen,
    setIsStepByStepTutorialOpen,
    tutorialStep,
    setTutorialStep,
    setEnabledShortcuts,
    variantsOpen,
  ] = useStore((state) => [
    state.chords,
    state.isStepByStepTutorialOpen,
    state.setIsStepByStepTutorialOpen,
    state.tutorialStep,
    state.setTutorialStep,
    state.setEnabledShortcuts,
    state.variantsOpen,
  ]);

  const [initialized, setInitialized] = useState(false);
  const numSteps = 9;

  // Listen to window resize events to recalculate positions
  const [forceRerender, setForceRerender] = useState(false);
  const [oneDvhInPx, setOneDvhInPx] = useState(window.innerHeight / 100);

  useEffect(() => {
    function handleResize() {
      setForceRerender(true);
      setOneDvhInPx(window.innerHeight / 100);
    }

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (forceRerender) {
      setForceRerender(false);
    }
  }, [forceRerender]);

  // Calculate and set the position of the dialog box
  const [windowBox, setWindowBox] = useState({
    top: 0,
    left: 0,
    width: 0,
    height: 0,
  });
  const [moveDialog, setMoveDialog] = useState({
    x: 0,
    y: 0,
  });
  const dialog = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!elementRef.current) return;

    // Get the bounding box of the highlighted element
    let windowRect = elementRef.current.getBoundingClientRect();

    setWindowBox({
      top: windowRect.top,
      left: windowRect.left,
      width: windowRect.width,
      height: windowRect.height,
    });

    // Calculate the position of the dialog
    if (!isStepByStepTutorialOpen || step !== tutorialStep) return;
    if (!dialog.current) return;

    function dvhToPx(dvh: number) {
      return dvh * oneDvhInPx;
    }

    let dialogRect = dialog.current.getBoundingClientRect();

    switch (position) {
      case "below":
        setMoveDialog({
          x: windowRect.left + windowRect.width / 2 - dialogRect.width / 2,
          y: windowRect.top + windowRect.height + dvhToPx(4),
        });
        break;
      case "above":
        setMoveDialog({
          x: windowRect.left + windowRect.width / 2 - dialogRect.width / 2,
          y: windowRect.top - dialogRect.height - dvhToPx(4),
        });
        break;
      case "left":
        setMoveDialog({
          x: windowRect.left - dialogRect.width - dvhToPx(4),
          y: windowRect.top + windowRect.height / 2 - dialogRect.height / 2,
        });
        break;
      case "right":
        setMoveDialog({
          x: windowRect.left + windowRect.width + dvhToPx(4),
          y: windowRect.top + windowRect.height / 2 - dialogRect.height / 2,
        });
        break;
      case "below-left":
        setMoveDialog({
          x: windowRect.left - dialogRect.width + windowRect.width,
          y: windowRect.top + windowRect.height + dvhToPx(4),
        });
        break;
    }

    setInitialized(true);
  }, [
    elementRef,
    isStepByStepTutorialOpen,
    tutorialStep,
    forceRerender,
    oneDvhInPx,
    position,
    step,
  ]);

  // Reset styles and clean up when exiting a step
  const onStepExit = useCallback(() => {
    if (elementRef.current) {
      elementRef.current.style.zIndex = "";
    }
    setInitialized(false);
  }, [elementRef]);

  // Automatically proceed to the next step if conditions allow
  const [continued, setContinued] = useState(
    // Prevent auto-continuing when there are chords (steps 0 and 4 only)
    [0, 4].includes(step) && chords.length !== 0
  );

  const prevStepRef = useRef(tutorialStep);
  const prevOpenRef = useRef(isStepByStepTutorialOpen);

  useEffect(() => {
    // Prevent abrupt auto-continuing on step change or tutorial open/close
    if (
      tutorialStep !== prevStepRef.current ||
      isStepByStepTutorialOpen !== prevOpenRef.current
    ) {
      prevStepRef.current = tutorialStep;
      prevOpenRef.current = isStepByStepTutorialOpen;

      if (canContinue) {
        setContinued(true);
        return;
      }
    }

    // Auto-continue
    if (isStepByStepTutorialOpen && step === tutorialStep && canContinue) {
      if (autoContinue && !continued) {
        setTutorialStep(tutorialStep + 1);
        onStepExit();
        setContinued(true);
      }
    }
  }, [
    isStepByStepTutorialOpen,
    step,
    tutorialStep,
    canContinue,
    autoContinue,
    continued,
    onStepExit,
    setTutorialStep,
  ]);

  // Highlight the tutorial target area by setting z-index
  useEffect(() => {
    if (elementRef.current) {
      if (step === tutorialStep && isStepByStepTutorialOpen) {
        elementRef.current.style.zIndex = "100";
      }
    }
  }, [elementRef, step, tutorialStep, isStepByStepTutorialOpen]);

  // Handle closing the tutorial
  useEffect(() => {
    if (!isStepByStepTutorialOpen) onStepExit();
  }, [isStepByStepTutorialOpen, onStepExit, setEnabledShortcuts]);

  // Handle closing the variants overlay during the tutorial
  useEffect(() => {
    if (!variantsOpen && isStepByStepTutorialOpen) {
      setEnabledShortcuts(false);
    }
  }, [variantsOpen, isStepByStepTutorialOpen, setEnabledShortcuts]);

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!isStepByStepTutorialOpen) return;
      if (step !== tutorialStep) return;
      if (variantsOpen) return;

      if (e.key === "Escape") {
        setEnabledShortcuts(true);
        setIsStepByStepTutorialOpen(false);
      }
      if (e.key === "r") {
        if (tutorialStep === 0) return;

        onStepExit();
        setTutorialStep(0);
      }
      if (e.key === "ArrowLeft") {
        if (tutorialStep > 0) {
          onStepExit();
          setTutorialStep(tutorialStep - 1);
        }
      }
      if (e.key === "ArrowRight") {
        if (!canContinue) return;

        if (tutorialStep < numSteps - 1) {
          onStepExit();
          setTutorialStep(tutorialStep + 1);
        } else {
          setEnabledShortcuts(true);
          setIsStepByStepTutorialOpen(false);
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    step,
    tutorialStep,
    isStepByStepTutorialOpen,
    variantsOpen,
    canContinue,
    onStepExit,
    setTutorialStep,
    setIsStepByStepTutorialOpen,
    setEnabledShortcuts,
  ]);

  return (
    isStepByStepTutorialOpen &&
    step === tutorialStep && (
      <>
        {
          // Background, hidden when the variants overlay is open to prevent double background
          !variantsOpen && (
            <div className="fixed z-30 top-0 left-0 h-full w-full bg-zinc-950 opacity-50" />
          )
        }

        <div
          className={`transition-opacity duration-700 ease-in-out ${
            initialized ? "opacity-100" : "opacity-0"
          } fixed z-30 top-0 left-0 bg-zinc-900 w-[40dvw] rounded-[0.5dvw] p-[2dvh] flex flex-col items-center justify-between`}
          style={{
            transform: `translate(${moveDialog.x}px, ${moveDialog.y}px)`,
          }}
          ref={dialog}
        >
          {/* Arrow icon */}
          {position == "below" && (
            <div className="absolute w-0 h-0 border-b-zinc-900 bottom-[100%] left-[50%] transform -translate-x-1/2 translate-y-[1px] border-l-[2dvh] border-l-transparent border-b-[3dvh] border-r-[2dvh] border-r-transparent" />
          )}
          {position == "above" && (
            <div className="absolute w-0 h-0 border-t-zinc-900 top-[100%] left-[50%] transform -translate-x-1/2 -translate-y-[1px] border-l-[2dvh] border-l-transparent border-t-[3dvh] border-r-[2dvh] border-r-transparent" />
          )}
          {position == "left" && (
            <div className="absolute w-0 h-0 border-l-zinc-900 top-[50%] left-[100%] transform -translate-y-1/2 -translate-x-[1px] border-t-[2dvh] border-t-transparent border-l-[3dvh] border-b-[2dvh] border-b-transparent" />
          )}
          {position == "right" && (
            <div className="absolute w-0 h-0 border-r-zinc-900 top-[50%] right-[100%] transform -translate-y-1/2 translate-x-[1px] border-t-[2dvh] border-t-transparent border-r-[3dvh] border-b-[2dvh] border-b-transparent" />
          )}
          {position == "below-left" && (
            <div
              className="absolute w-0 h-0 border-b-zinc-900 bottom-[100%] border-l-[2dvh] transform translate-x-1/2 translate-y-[1px] border-l-transparent border-b-[3dvh] border-r-[2dvh] border-r-transparent"
              style={{ right: `calc(${windowBox.width / 2}px)` }}
            />
          )}

          <div className="w-full flex flex-row items-center justify-between">
            <img
              className="h-[5dvh] w-[5dvh] cursor-pointer filter active:brightness-90"
              src="/restart.svg"
              title="Restart tutorial (R)"
              onClick={() => {
                if (tutorialStep === 0) return;

                onStepExit();
                setTutorialStep(0);
              }}
            />
            <p className="text-[2.5dvh] font-semibold">
              Step {tutorialStep + 1}/{numSteps}
            </p>
            <img
              className="h-[5dvh] w-[5dvh] cursor-pointer filter active:brightness-90"
              src="/close.svg"
              title="Close (Esc)"
              onClick={() => {
                setEnabledShortcuts(true);
                setIsStepByStepTutorialOpen(false);
              }}
            />
          </div>

          <p className="text-center text-[2.5dvh] py-[max(2dvh,2dvw)]">
            {text}
          </p>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(30dvh,1fr))] gap-[2dvh] w-full min-w-0 whitespace-nowrap">
            <button
              className="flex flex-row justify-center items-center p-[2dvh] rounded-[1dvh] filter active:brightness-90 disabled:brightness-75 hover:brightness-110 max-h-[10dvh] bg-zinc-800"
              onClick={() => {
                onStepExit();
                setTutorialStep(tutorialStep - 1);
              }}
              disabled={tutorialStep === 0}
              title={"Previous (Left arrow key)"}
            >
              Previous
            </button>
            <button
              className="flex flex-row justify-center items-center p-[2dvh] rounded-[1dvh] filter active:brightness-90 disabled:brightness-75 hover:brightness-110 max-h-[10dvh] bg-zinc-800"
              onClick={() => {
                if (tutorialStep < numSteps - 1) {
                  onStepExit();
                  setTutorialStep(tutorialStep + 1);
                } else {
                  setEnabledShortcuts(true);
                  setIsStepByStepTutorialOpen(false);
                }
              }}
              title={`${
                canContinue
                  ? "Continue (Right arrow key)"
                  : "Finish the instructions to continue"
              }`}
              disabled={!canContinue}
            >
              <p className="truncate">
                {tutorialStep < numSteps - 1
                  ? canContinue
                    ? "Next"
                    : "Complete to continue"
                  : "Finish"}
              </p>
            </button>
          </div>
        </div>
      </>
    )
  );
}
