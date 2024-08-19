"use client";
import { useEffect, useState } from "react";
import { useStore } from "@/state/use_store";
import { shallow } from "zustand/shallow";
import Overlay from "../ui/overlay";

export default function SupportUsOverlay() {
  const [
    isSupportUsOverlayOpen,
    setIsSupportUsOverlayOpen,
    isSupportUsAfterExport,
    isSupportUsLandingPage,
    setDontShowSupportUsOverlay,
  ] = useStore(
    (state) => [
      state.isSupportUsOverlayOpen,
      state.setIsSupportUsOverlayOpen,
      state.isSupportUsAfterExport,
      state.isSupportUsLandingPage,
      state.setDontShowSupportUsOverlay,
    ],
    shallow
  );

  const [aspectRatio, setAspectRatio] = useState(16 / 9);
  const decisionBoundary = 1.5;

  // On window resize, update the aspect ratio
  useEffect(() => {
    setAspectRatio(window.innerWidth / window.innerHeight); // Initial aspect ratio

    function handleResize() {
      setAspectRatio(window.innerWidth / window.innerHeight);
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close if the aspect ratio is not supported
  if ((aspectRatio <= 0.7 || aspectRatio >= 4) && isSupportUsOverlayOpen) {
    setIsSupportUsOverlayOpen(false);
  }

  return (
    <Overlay
      isOverlayOpen={isSupportUsOverlayOpen}
      setIsOverlayOpen={setIsSupportUsOverlayOpen}
      enabledOverflow={isSupportUsLandingPage}
    >
      <p className="text-[5dvh] text-center font-semibold">
        Support ChordSeqAI
      </p>
      {/* Display different text based on aspect ratio to avoid cluttered text */}
      {aspectRatio >= decisionBoundary && (
        <p className="text-[2.5dvh] max-w-[85%] text-justify">
          ChordSeqAI is a free, open-source tool built with passion and
          dedication. Behind the scenes, hundreds of hours of unpaid work go
          into developing, maintaining, and improving it. If ChordSeqAI has been
          valuable to you, please consider supporting us to help keep the
          project alive and growing.
        </p>
      )}
      {aspectRatio < decisionBoundary && (
        <p className="text-[2.5dvh] max-w-[85%] text-justify">
          ChordSeqAI is a free, open-source project developed with hundreds of
          unpaid hours. If you find it helpful, please consider supporting its
          development.
        </p>
      )}
      <div className="w-full max-w-[min(85%,100dvh)] grid grid-cols-[repeat(auto-fill,minmax(min(100%,40dvh),1fr))] gap-[4dvh]">
        <a
          href="https://paypal.me/xenomuse"
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center h-[14dvh] p-[2dvh] rounded-[0.5dvw] bg-zinc-800 transition hover:bg-zinc-700 overflow-hidden"
          onClick={() => {
            try {
              (globalThis as any).umami.track("paypal-button");
            } catch {
              console.error("Failed to track event");
            }
          }}
        >
          <p className="text-[2.5dvh] text-center">Make a one-time donation</p>
          <p className="text-[4dvh] font-medium">PayPal</p>
        </a>
        <a
          href="https://patreon.com/xenomuse"
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center h-[14dvh] p-[2dvh] rounded-[0.5dvw] bg-zinc-800 transition hover:bg-zinc-700 overflow-hidden"
          onClick={() => {
            try {
              (globalThis as any).umami.track("patreon-button");
            } catch {
              console.error("Failed to track event");
            }
          }}
        >
          <p className="text-[2.5dvh] text-center">
            Become a monthly supporter
          </p>
          <p className="text-[4dvh] font-medium">Patreon</p>
        </a>
      </div>

      {/* Don't show this again checkbox */}
      {isSupportUsAfterExport && (
        <>
          <div className="w-full h-[2px] flex flex-row items-center justify-center">
            <hr className="h-[2px] w-1/2 my-8 bg-gradient-to-r from-transparent to-zinc-800 border-0" />
            <hr className="h-[2px] w-1/2 my-8 bg-gradient-to-l from-transparent to-zinc-800 border-0" />
          </div>

          <div className="max-w-[85%] min-w-0 w-fit text-[2.5dvh] mt-[2dvh] whitespace-nowrap flex flex-wrap justify-center items-center gap-[1dvh]">
            <label
              className="flex flex-row justify-center items-center font-medium cursor-pointer select-none"
              htmlFor="dont-show-again"
            >
              <input
                id="dont-show-again"
                type="checkbox"
                className="h-[2.4dvh] w-[2.4dvh] border-[0.2dvh] bg-zinc-800 rounded-[0.5dvh] focus:outline-none mr-[1dvh]"
                onChange={(e) => {
                  setDontShowSupportUsOverlay(e.target.checked);
                }}
              />
              Don&apos;t show this again
            </label>
            <p className="text-center">(shown after key actions)</p>
          </div>
        </>
      )}
    </Overlay>
  );
}
