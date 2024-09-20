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
    setDontShowSupportUsOverlay,
  ] = useStore(
    (state) => [
      state.isSupportUsOverlayOpen,
      state.setIsSupportUsOverlayOpen,
      state.isSupportUsAfterExport,
      state.setDontShowSupportUsOverlay,
    ],
    shallow,
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

  return (
    <Overlay
      isOverlayOpen={isSupportUsOverlayOpen}
      setIsOverlayOpen={setIsSupportUsOverlayOpen}
      enabledOverflow={false}
    >
      <p className="text-center text-[5dvh] font-semibold">
        Support ChordSeqAI
      </p>
      {/* Display different text based on aspect ratio to avoid cluttered text */}
      {aspectRatio >= decisionBoundary && (
        <p className="max-w-[85%] text-justify text-[2.5dvh]">
          ChordSeqAI is a free, open-source tool built with passion and
          dedication. Behind the scenes, hundreds of hours of unpaid work go
          into developing, maintaining, and improving it. If ChordSeqAI has been
          valuable to you, please consider supporting us to help keep the
          project alive and growing.
        </p>
      )}
      {aspectRatio < decisionBoundary && (
        <p className="max-w-[85%] text-justify text-[2.5dvh]">
          ChordSeqAI is a free, open-source project developed with hundreds of
          unpaid hours. If you find it helpful, please consider supporting its
          development.
        </p>
      )}
      <div className="grid w-full max-w-[min(85%,100dvh)] grid-cols-[repeat(auto-fill,minmax(min(100%,40dvh),1fr))] gap-[4dvh]">
        <a
          href="https://paypal.me/xenomuse"
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-[14dvh] flex-col items-center justify-center overflow-hidden rounded-[0.5dvw] bg-zinc-800 p-[2dvh] transition hover:bg-zinc-700"
          onClick={() => {
            try {
              (globalThis as any).umami.track("paypal-button");
            } catch {
              console.error("Failed to track event");
            }
          }}
        >
          <p className="text-center text-[2.5dvh]">Make a one-time donation</p>
          <p className="text-[4dvh] font-medium">PayPal</p>
        </a>
        <a
          href="https://patreon.com/xenomuse"
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-[14dvh] flex-col items-center justify-center overflow-hidden rounded-[0.5dvw] bg-zinc-800 p-[2dvh] transition hover:bg-zinc-700"
          onClick={() => {
            try {
              (globalThis as any).umami.track("patreon-button");
            } catch {
              console.error("Failed to track event");
            }
          }}
        >
          <p className="text-center text-[2.5dvh]">
            Become a monthly supporter
          </p>
          <p className="text-[4dvh] font-medium">Patreon</p>
        </a>
      </div>

      {/* Don't show this again checkbox */}
      {isSupportUsAfterExport && (
        <>
          <div className="flex h-[2px] w-full flex-row items-center justify-center">
            <hr className="my-8 h-[2px] w-1/2 border-0 bg-gradient-to-r from-transparent to-zinc-800" />
            <hr className="my-8 h-[2px] w-1/2 border-0 bg-gradient-to-l from-transparent to-zinc-800" />
          </div>

          <div className="mt-[2dvh] flex w-fit min-w-0 max-w-[85%] flex-wrap items-center justify-center gap-[1dvh] whitespace-nowrap text-[2.5dvh]">
            <label
              className="flex cursor-pointer select-none flex-row items-center justify-center font-medium"
              htmlFor="dont-show-again"
            >
              <input
                id="dont-show-again"
                type="checkbox"
                className="mr-[1dvh] h-[2.4dvh] w-[2.4dvh] rounded-[0.5dvh] border-[0.2dvh] bg-zinc-800 focus:outline-none"
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
