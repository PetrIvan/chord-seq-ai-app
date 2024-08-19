"use client";
import { useStore } from "@/state/use_store";
import { shallow } from "zustand/shallow";
import { useEffect, useState } from "react";

export default function SupportUsButton() {
  const [setIsSupportUsOverlayOpen, setIsSupportUsLandingPage] = useStore(
    (state) => [
      state.setIsSupportUsOverlayOpen,
      state.setIsSupportUsLandingPage,
    ],
    shallow
  );

  const [aspectRatio, setAspectRatio] = useState(16 / 9);

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
    // Show only if the aspect ratio is supported
    aspectRatio > 0.7 &&
    aspectRatio < 4 && (
      <button
        className="max-md:hidden whitespace-nowrap flex items-center justify-center text-white py-7 px-6 text-2xl transition duration-300 ease-in-out hover:brightness-90 w-36 h-12"
        onClick={() => {
          setIsSupportUsLandingPage(true);
          setIsSupportUsOverlayOpen(true);

          try {
            (globalThis as any).umami.track("support-us-button");
          } catch {
            console.error("Failed to track event");
          }
        }}
      >
        Support us
      </button>
    )
  );
}
