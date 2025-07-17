"use client";
import { useStore } from "@/state/use_store";
import { shallow } from "zustand/shallow";
import { useInit } from "@/state/use_init";
import Overlay from "../ui/overlay";
import TrackedLink from "../landing_page/tracked_link";
import Image from "next/image";
import { useEffect } from "react";

export default function MozartAIOverlay() {
  const [
    mozartAIOverlay,
    setMozartAIOverlay,
    isMozartAIOverlayOpen,
    setIsMozartAIOverlayOpen,
    welcomeFirstTime,
    isWelcomeOverlayOpen,
  ] = useStore(
    (state) => [
      state.mozartAIOverlay,
      state.setMozartAIOverlay,
      state.isMozartAIOverlayOpen,
      state.setIsMozartAIOverlayOpen,
      state.welcomeFirstTime,
      state.isWelcomeOverlayOpen,
    ],
    shallow,
  );

  useEffect(() => {
    // For existing users, show the overlay right away.
    if (mozartAIOverlay && !welcomeFirstTime) {
      setIsMozartAIOverlayOpen(true);
      setMozartAIOverlay(false);
    }
  }, [
    mozartAIOverlay,
    welcomeFirstTime,
    setIsMozartAIOverlayOpen,
    setMozartAIOverlay,
  ]);

  useEffect(() => {
    // For new users, show the Mozart AI overlay after the welcome overlay is closed.
    if (
      welcomeFirstTime &&
      !isWelcomeOverlayOpen &&
      !isMozartAIOverlayOpen &&
      mozartAIOverlay
    ) {
      setIsMozartAIOverlayOpen(true);
      setMozartAIOverlay(false);
    }
  }, [
    isWelcomeOverlayOpen,
    isMozartAIOverlayOpen,
    setIsMozartAIOverlayOpen,
    mozartAIOverlay,
    setMozartAIOverlay,
    welcomeFirstTime,
  ]);

  return (
    <Overlay
      isOverlayOpen={isMozartAIOverlayOpen}
      setIsOverlayOpen={setIsMozartAIOverlayOpen}
    >
      <p className="w-full px-[1dvh] text-center text-[5dvh] font-semibold">
        Mozart AI is now live!
      </p>
      <p className="max-w-[85%] text-center text-[2.5dvh]">
        The AI music co-producer I'm helping build,{" "}
        <TrackedLink
          href="https://www.producthunt.com/products/mozart-ai"
          className="text-blue-400 hover:underline"
          event="mozart-ai-product-hunt-link"
        >
          Mozart AI
        </TrackedLink>
        , is now live on Product Hunt! We'd love your support.
      </p>
      <Image
        src="/mozart-ai-daw.webp"
        alt="Mozart AI DAW interface"
        width={1920}
        height={1080}
        className="w-[70dvh] rounded-lg object-cover py-[2.5dvh] shadow-lg"
      />
      <TrackedLink
        href="https://www.producthunt.com/products/mozart-ai"
        className="inline-block rounded-full bg-white px-[2.5dvh] py-[1dvh] text-[2.2dvh] font-semibold text-zinc-950 shadow-md transition-transform duration-200 ease-in-out hover:scale-105 hover:bg-zinc-200"
        event="mozart-ai-product-hunt-cta"
      >
        Support us on Product Hunt
      </TrackedLink>
    </Overlay>
  );
}
