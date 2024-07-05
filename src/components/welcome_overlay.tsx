"use client";
import React, { useEffect } from "react";
import { useStore } from "@/state/use_store";
import { shallow } from "zustand/shallow";

export default function WelcomeOverlay() {
  const [
    welcomeFirstTime,
    setWelcomeFirstTime,
    isWelcomeOverlayOpen,
    setIsWelcomeOverlayOpen,
    setEnabledShortcuts,
  ] = useStore(
    (state) => [
      state.welcomeFirstTime,
      state.setWelcomeFirstTime,
      state.isWelcomeOverlayOpen,
      state.setIsWelcomeOverlayOpen,
      state.setEnabledShortcuts,
    ],
    shallow
  );

  // Disable shortcuts when the overlay is open
  useEffect(() => {
    setEnabledShortcuts(!isWelcomeOverlayOpen);
  }, [isWelcomeOverlayOpen]);

  // If it's the first time, open the welcome overlay
  useEffect(() => {
    if (welcomeFirstTime) {
      setIsWelcomeOverlayOpen(true);
      setWelcomeFirstTime(false);
    }
  }, []);

  return (
    isWelcomeOverlayOpen && (
      <ShowableWelcomeOverlay
        setIsWelcomeOverlayOpen={setIsWelcomeOverlayOpen}
      />
    )
  );
}

interface Props {
  setIsWelcomeOverlayOpen: (open: boolean) => void;
}

function ShowableWelcomeOverlay({ setIsWelcomeOverlayOpen }: Props) {
  // Close on escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsWelcomeOverlayOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="absolute z-30 bg-zinc-950 bg-opacity-50 h-[100dvh] w-[100dvw] flex flex-col items-center justify-center">
      <div className="relative bg-zinc-900 h-[80dvh] w-[70dvw] rounded-[0.5dvw] flex flex-col items-center justify-evenly p-[1dvw]">
        <div className="grow-[1] w-full flex flex-col items-center justify-center space-y-[2dvh] mb-[5dvh]">
          <img
            className="absolute top-[1dvh] right-[1dvh] w-[5dvh] h-[5dvh] cursor-pointer"
            src="/close.svg"
            title="Close (Esc)"
            onClick={() => setIsWelcomeOverlayOpen(false)}
          />
          <p className="w-full text-center px-[1dvh] text-[5dvh] font-semibold overflow-clip">
            Welcome to ChordSeqAI!
          </p>
          <p className="text-[2.5dvh] max-w-[75%] text-justify">
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
            className="max-w-full h-full aspect-video"
            src="https://www.youtube.com/embed/YbTd2QBZqOk?si=DoGTRXT7tJnu_ReV"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}
