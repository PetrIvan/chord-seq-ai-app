"use client";
import React, { useEffect, useState } from "react";
import { useStore } from "@/state/use_store";
import { shallow } from "zustand/shallow";

export default function NewFeaturesOverlay() {
  const [
    welcomeFirstTime,
    version,
    setVersion,
    isNewFeaturesOverlayOpen,
    setIsNewFeaturesOverlayOpen,
    setIsWelcomeOverlayOpen,
    setEnabledShortcuts,
  ] = useStore(
    (state) => [
      state.welcomeFirstTime,
      state.version,
      state.setVersion,
      state.isNewFeaturesOverlayOpen,
      state.setIsNewFeaturesOverlayOpen,
      state.setIsWelcomeOverlayOpen,
      state.setEnabledShortcuts,
    ],
    shallow
  );

  const [showPrev, setShowPrev] = useState(true);

  // Disable shortcuts when the overlay is open
  useEffect(() => {
    if (isNewFeaturesOverlayOpen) {
      setEnabledShortcuts(false);
    }
  }, [isNewFeaturesOverlayOpen]);

  // If it's the first time, open the welcome overlay
  useEffect(() => {
    if (version < 1) {
      setVersion(1);
      if (!welcomeFirstTime) {
        setShowPrev(false);
        setIsNewFeaturesOverlayOpen(true);
      }
    }
  }, []);

  return (
    isNewFeaturesOverlayOpen && (
      <ShowableNewFeaturesOverlay
        setIsNewFeaturesOverlayOpen={setIsNewFeaturesOverlayOpen}
        setIsWelcomeOverlayOpen={setIsWelcomeOverlayOpen}
        showPrev={showPrev}
        setShowPrev={setShowPrev}
        setEnabledShortcuts={setEnabledShortcuts}
      />
    )
  );
}

interface Props {
  setIsNewFeaturesOverlayOpen: (open: boolean) => void;
  setIsWelcomeOverlayOpen: (open: boolean) => void;
  setEnabledShortcuts: (enabled: boolean) => void;
  showPrev: boolean;
  setShowPrev: (show: boolean) => void;
}

function ShowableNewFeaturesOverlay({
  setIsNewFeaturesOverlayOpen,
  setIsWelcomeOverlayOpen,
  setEnabledShortcuts,
  showPrev,
  setShowPrev,
}: Props) {
  // Close on escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsNewFeaturesOverlayOpen(false);
        setShowPrev(true);
      }
      if (e.key === "ArrowLeft" && showPrev) {
        setIsWelcomeOverlayOpen(true);
        setIsNewFeaturesOverlayOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="absolute z-30 bg-zinc-950 bg-opacity-50 h-[100dvh] w-[100dvw] flex flex-col items-center justify-center">
      <div className="relative bg-zinc-900 h-[80dvh] w-[70dvw] rounded-[0.5dvw] flex flex-col items-center justify-evenly p-[1dvw] overflow-x-auto">
        <div className="grow-[1] w-full flex flex-col items-center justify-center space-y-[2dvh] my-[3dvh] px-[6dvh]">
          <img
            className="absolute top-[1dvh] right-[1dvh] w-[5dvh] h-[5dvh] cursor-pointer filter active:brightness-90"
            src="/close.svg"
            title="Close (Esc)"
            onClick={() => {
              setIsNewFeaturesOverlayOpen(false);
              setEnabledShortcuts(true);
              setShowPrev(true);
            }}
          />
          <p className="w-full text-center px-[1dvh] text-[5dvh] font-semibold overflow-clip">
            What's new
          </p>
          <ul className="text-[3dvh] max-w-[75%] text-justify space-y-[1dvh] list-disc list-outside">
            <li>
              Delete all{" "}
              <img src="/trash-all.svg" className="inline w-[4dvh] h-[4dvh]" />{" "}
              and chord variants{" "}
              <img src="/variants.svg" className="inline w-[4dvh] h-[4dvh]" />{" "}
              now have their own buttons.
            </li>
            <li>Added new shortcuts to make your workflow faster.</li>
            <li>Improved the layout to be responsive on more screen sizes.</li>
          </ul>
          <p className="text-[3dvh] max-w-[75%] text-justify">
            For more information, check the{" "}
            <a
              className="text-blue-400 hover:underline"
              href="https://github.com/PetrIvan/chord-seq-ai-app/wiki/Features"
              target="_blank"
              rel="noopener noreferrer"
            >
              documentation
            </a>
            .
          </p>

          <div className="w-[75%] h-[2px] flex flex-row items-center justify-center">
            <hr className="h-[2px] w-1/2 my-8 bg-gradient-to-r from-transparent to-zinc-800 border-0" />
            <hr className="h-[2px] w-1/2 my-8 bg-gradient-to-l from-transparent to-zinc-800 border-0" />
          </div>

          <p className="text-[2.5dvh] max-w-[60%] text-center">
            Would you like to see more features or vote for the next ones? You
            can do so on{" "}
            <a
              className="text-blue-400 hover:underline"
              href="https://github.com/PetrIvan/chord-seq-ai-app/discussions/categories/feature-requests?discussions_q=category%3A%22Feature+requests%22+sort%3Atop"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub Discussions
            </a>
            .
          </p>
        </div>
        {showPrev && (
          <button
            className="absolute bottom-[50%] left-[1dvh] w-[5dvh] h-[5dvh] filter active:brightness-90"
            title="Show welcome overlay (Left arrow key)"
            onClick={() => {
              setIsWelcomeOverlayOpen(true);
              setIsNewFeaturesOverlayOpen(false);
            }}
          >
            <svg
              className="w-full h-full inline-block"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 10 10"
            >
              <path
                transform="rotate(90 5 5)"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1"
                d="m1 1 4 4 4-4"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
