"use client";
import React, { useEffect, useState } from "react";
import { useStore } from "@/state/use_store";
import { shallow } from "zustand/shallow";

export default function WelcomeOverlay() {
  const [
    welcomeFirstTime,
    setWelcomeFirstTime,
    isWelcomeOverlayOpen,
    setIsWelcomeOverlayOpen,
    setIsNewFeaturesOverlayOpen,
    setEnabledShortcuts,
  ] = useStore(
    (state) => [
      state.welcomeFirstTime,
      state.setWelcomeFirstTime,
      state.isWelcomeOverlayOpen,
      state.setIsWelcomeOverlayOpen,
      state.setIsNewFeaturesOverlayOpen,
      state.setEnabledShortcuts,
    ],
    shallow
  );

  const [showNext, setShowNext] = useState(true);

  // Disable shortcuts when the overlay is open
  useEffect(() => {
    if (isWelcomeOverlayOpen) {
      setEnabledShortcuts(false);
    }
  }, [isWelcomeOverlayOpen]);

  // If it's the first time, open the welcome overlay
  useEffect(() => {
    if (welcomeFirstTime) {
      setShowNext(false);
      setIsWelcomeOverlayOpen(true);
      setWelcomeFirstTime(false);
    }
  }, []);

  return (
    isWelcomeOverlayOpen && (
      <ShowableWelcomeOverlay
        setIsWelcomeOverlayOpen={setIsWelcomeOverlayOpen}
        setIsNewFeaturesOverlayOpen={setIsNewFeaturesOverlayOpen}
        setEnabledShortcuts={setEnabledShortcuts}
        showNext={showNext}
        setShowNext={setShowNext}
      />
    )
  );
}

interface Props {
  setIsWelcomeOverlayOpen: (open: boolean) => void;
  setIsNewFeaturesOverlayOpen: (open: boolean) => void;
  setEnabledShortcuts: (enabled: boolean) => void;
  showNext: boolean;
  setShowNext: (showNext: boolean) => void;
}

function ShowableWelcomeOverlay({
  setIsWelcomeOverlayOpen,
  setIsNewFeaturesOverlayOpen,
  setEnabledShortcuts,
  showNext,
  setShowNext,
}: Props) {
  // Close on escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsWelcomeOverlayOpen(false);
        setEnabledShortcuts(true);
        setShowNext(true);
      }
      if (e.key === "ArrowRight") {
        setIsNewFeaturesOverlayOpen(true);
        setIsWelcomeOverlayOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="absolute z-30 bg-zinc-950 bg-opacity-50 h-[100dvh] w-[100dvw] flex flex-col items-center justify-center">
      <div className="relative bg-zinc-900 h-[80dvh] w-[70dvw] rounded-[0.5dvw] flex flex-col items-center justify-evenly p-[1dvw] overflow-y-auto">
        <div className="grow-[1] w-full flex flex-col items-center justify-center space-y-[2dvh] mb-[5dvh] px-[6dvh]">
          <img
            className="absolute top-[1dvh] right-[1dvh] w-[5dvh] h-[5dvh] cursor-pointer filter active:brightness-90"
            src="/close.svg"
            title="Close (Esc)"
            onClick={() => {
              setIsWelcomeOverlayOpen(false);
              setEnabledShortcuts(true);
              setShowNext(true);
            }}
          />
          <p className="w-full text-center px-[1dvh] text-[5dvh] font-semibold">
            Welcome to ChordSeqAI!
          </p>
          <p className="text-[2.5dvh] max-w-[85%] text-justify">
            Get started quickly by watching our short tutorial video below. It
            covers the main features of the app and how to use them. If you want
            to dive deeper, you can also check out the{" "}
            <a
              className="text-blue-400 hover:underline"
              href="https://github.com/PetrIvan/chord-seq-ai-app/wiki"
              target="_blank"
              rel="noopener noreferrer"
            >
              documentation
            </a>
            .
          </p>
          <iframe
            className="max-w-[85%] h-full aspect-video"
            src="https://www.youtube.com/embed/YbTd2QBZqOk?si=DoGTRXT7tJnu_ReV"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
        {showNext && (
          <button
            className="absolute bottom-[50%] right-[1dvh] w-[5dvh] h-[5dvh] filter active:brightness-90"
            title="Show recent changes (Right arrow key)"
            onClick={() => {
              setIsNewFeaturesOverlayOpen(true);
              setIsWelcomeOverlayOpen(false);
            }}
          >
            <svg
              className="w-full h-full inline-block"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 6 10"
            >
              <path
                transform="rotate(-90 5 5)"
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
