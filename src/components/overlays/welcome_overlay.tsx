"use client";
import React, { useEffect, useState, useRef } from "react";
import { useStore } from "@/state/use_store";
import { shallow } from "zustand/shallow";

import { stopPlayback } from "@/playback/player";

import ClickableIframe from "../ui/clickable_iframe";
import Overlay from "../ui/overlay";

export default function WelcomeOverlay() {
  const [
    welcomeFirstTime,
    setWelcomeFirstTime,
    isWelcomeOverlayOpen,
    setIsWelcomeOverlayOpen,
    setIsNewFeaturesOverlayOpen,
    setIsStepByStepTutorialOpen,
    setTutorialStep,
    watchedVideoTutorial,
    setWatchedVideoTutorial,
    setEnabledShortcuts,
    setZoom,
    setTimelinePosition,
    setPlayheadPosition,
  ] = useStore(
    (state) => [
      state.welcomeFirstTime,
      state.setWelcomeFirstTime,
      state.isWelcomeOverlayOpen,
      state.setIsWelcomeOverlayOpen,
      state.setIsNewFeaturesOverlayOpen,
      state.setIsStepByStepTutorialOpen,
      state.setTutorialStep,
      state.watchedVideoTutorial,
      state.setWatchedVideoTutorial,
      state.setEnabledShortcuts,
      state.setZoom,
      state.setTimelinePosition,
      state.setPlayheadPosition,
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

  const showTutorial = () => {
    setTutorialStep(0);

    // Reset the state
    setEnabledShortcuts(false);
    setZoom(1);
    setTimelinePosition(0);
    setPlayheadPosition(0);
    setShowNext(true);
    stopPlayback();

    setIsStepByStepTutorialOpen(true);
    setIsWelcomeOverlayOpen(false);
  };

  const timeoutIDRef = useRef<number | null>(null);

  return (
    <Overlay
      isOverlayOpen={isWelcomeOverlayOpen}
      setIsOverlayOpen={setIsWelcomeOverlayOpen}
      callOnClose={() => {
        // Clear the watched video timeout
        if (timeoutIDRef.current) {
          window.clearTimeout(timeoutIDRef.current);
        }
        // If the user skips the video tutorial the first time (hence !showNext), show the step-by-step tutorial
        if (!showNext && !watchedVideoTutorial) {
          showTutorial();
        }
        setShowNext(true);
      }}
      otherShortcuts={otherShortcuts}
    >
      <p className="w-full text-center px-[1dvh] text-[5dvh] font-semibold">
        Welcome to ChordSeqAI!
      </p>
      <p className="text-[2.5dvh] max-w-[85%] text-justify">
        Get started quickly by watching our tutorial playlist below, which
        covers the main features of the app and how to use them. If you want to
        dive deeper, check out the{" "}
        <a
          className="text-blue-400 hover:underline"
          href="https://github.com/PetrIvan/chord-seq-ai-app/wiki"
          target="_blank"
          rel="noopener noreferrer"
        >
          documentation
        </a>
        , or take a{" "}
        <button
          className="text-blue-400 hover:underline"
          onClick={() => showTutorial()}
        >
          guided tour
        </button>{" "}
        of the app.
      </p>
      <ClickableIframe
        className="max-w-[85%] h-[min(50dvh,_30dvw)] aspect-video"
        src="https://www.youtube.com/embed/videoseries?si=t-XM9ujWyvSJyIbj&amp;list=PLT4SeTqv-OaknHUttzBYHr2gmKemcEXkp"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        onInferredClick={() => {
          // Count as watched 1 minute after clicking in the iframe
          window.setTimeout(() => {
            setWatchedVideoTutorial(true);
          }, 60 * 1000);
        }}
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
