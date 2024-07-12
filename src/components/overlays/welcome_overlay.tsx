"use client";
import React, { useEffect, useState } from "react";
import { useStore } from "@/state/use_store";
import { shallow } from "zustand/shallow";

import Overlay from "../ui/overlay";

export default function WelcomeOverlay() {
  const [
    welcomeFirstTime,
    setWelcomeFirstTime,
    isWelcomeOverlayOpen,
    setIsWelcomeOverlayOpen,
    setIsNewFeaturesOverlayOpen,
  ] = useStore(
    (state) => [
      state.welcomeFirstTime,
      state.setWelcomeFirstTime,
      state.isWelcomeOverlayOpen,
      state.setIsWelcomeOverlayOpen,
      state.setIsNewFeaturesOverlayOpen,
    ],
    shallow
  );

  const [showNext, setShowNext] = useState(true);

  // If it's the first time, open the welcome overlay
  useEffect(() => {
    if (welcomeFirstTime) {
      setShowNext(false);
      setIsWelcomeOverlayOpen(true);
      setWelcomeFirstTime(false);
    }
  }, []);

  const otherShortcuts = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      setIsNewFeaturesOverlayOpen(true);
      setIsWelcomeOverlayOpen(false);
    }
  };

  return (
    <Overlay
      isOverlayOpen={isWelcomeOverlayOpen}
      setIsOverlayOpen={setIsWelcomeOverlayOpen}
      callOnClose={() => setShowNext(true)}
      otherShortcuts={otherShortcuts}
    >
      <p className="w-full text-center px-[1dvh] text-[5dvh] font-semibold">
        Welcome to ChordSeqAI!
      </p>
      <p className="text-[2.5dvh] max-w-[85%] text-justify">
        Get started quickly by watching our short tutorial video below. It
        covers the main features of the app and how to use them. If you want to
        dive deeper, you can also check out the{" "}
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
        className="max-w-[85%] h-[min(50dvh,_30dvw)] aspect-video"
        src="https://www.youtube.com/embed/YbTd2QBZqOk?si=DoGTRXT7tJnu_ReV"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
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
    </Overlay>
  );
}
