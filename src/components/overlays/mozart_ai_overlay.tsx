"use client";
import { useStore } from "@/state/use_store";
import { shallow } from "zustand/shallow";
import Overlay from "../ui/overlay";
import TrackedLink from "../landing_page/tracked_link";
import Image from "next/image";
import { useEffect, useRef } from "react";

export default function MozartAIOverlay() {
  const [
    mozartAIOverlay,
    setMozartAIOverlay,
    isMozartAIOverlayOpen,
    setIsMozartAIOverlayOpen,
    welcomeFirstTime,
  ] = useStore(
    (state) => [
      state.mozartAIOverlay,
      state.setMozartAIOverlay,
      state.isMozartAIOverlayOpen,
      state.setIsMozartAIOverlayOpen,
      state.welcomeFirstTime,
    ],
    shallow,
  );

  const isFirstLoad = useRef(welcomeFirstTime);

  useEffect(() => {
    // For existing users, show the overlay right away.
    if (mozartAIOverlay && !isFirstLoad.current) {
      setIsMozartAIOverlayOpen(true);
      setMozartAIOverlay(false);
    }
  }, [mozartAIOverlay, setIsMozartAIOverlayOpen, setMozartAIOverlay]);

  return (
    <Overlay
      isOverlayOpen={isMozartAIOverlayOpen}
      setIsOverlayOpen={setIsMozartAIOverlayOpen}
    >
      <p className="w-full px-[1dvh] text-center text-[5dvh] font-semibold">
        Check out Mozart AI!
      </p>
      <p className="max-w-[85%] text-center text-[2.5dvh]">
        The AI music co-producer I&apos;m helping build. Get AI-powered
        completions for your melodies, generate vocals, and reference your
        favorite artists to match their style.
      </p>
      <Image
        src="/mozart-ai-daw.webp"
        alt="Mozart AI DAW interface"
        width={1920}
        height={1080}
        className="h-[min(40dvh,_30dvw)] max-w-[85%] rounded-lg object-contain py-[2.5dvh] shadow-lg"
      />
      <TrackedLink
        href="https://getmozart.ai"
        className="inline-block rounded-full bg-white px-[2.5dvh] py-[1dvh] text-[2.2dvh] font-semibold text-zinc-950 shadow-md transition-transform duration-200 ease-in-out hover:scale-105 hover:bg-zinc-200"
        event="mozart-ai-cta"
      >
        Try Mozart AI
      </TrackedLink>
    </Overlay>
  );
}
