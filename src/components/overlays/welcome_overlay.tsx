"use client";
import { useState, useRef } from "react";
import { useStore } from "@/state/use_store";
import { shallow } from "zustand/shallow";
import { useInit } from "@/state/use_init";

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
    shallow,
  );

  const [showNext, setShowNext] = useState(true);

  // If it's the first time, open the welcome overlay
  useInit(() => {
    if (welcomeFirstTime) {
      setShowNext(false);
      setIsWelcomeOverlayOpen(true);
      setWelcomeFirstTime(false);
    }
  });

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
      <p className="w-full px-[1dvh] text-center text-[5dvh] font-semibold">
        Welcome to ChordSeqAI!
      </p>
      <p className="max-w-[85%] text-justify text-[2.5dvh]">
        Get started quickly by watching our tutorial playlist below, which
        covers the main features of the app and how to use them. If you want to
        dive deeper, check out the{" "}
        <a
          className="text-blue-400 hover:underline"
          href="/wiki"
          target="_blank"
          rel="noopener noreferrer"
        >
          wiki
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
        className="aspect-video h-[min(50dvh,_30dvw)] max-w-[85%]"
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
          className="absolute bottom-[50%] right-[1dvh] h-[5dvh] w-[5dvh] filter active:brightness-90"
          title="Show recent changes (Right arrow key)"
          onClick={() => {
            setIsNewFeaturesOverlayOpen(true);
            setIsWelcomeOverlayOpen(false);
          }}
        >
          <svg
            className="inline-block h-full w-full"
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
