"use client";
import ModelSelection from "@/components/model_selection/model_selection";
import TransposeImportExport from "@/components/transpose_import_export/transpose_import_export";
import SupportHelp from "@/components/support_help";
import TimelineEditor from "@/components/timeline/timeline_editor";
import Suggestions from "@/components/suggestions/suggestions";
import VariantOverlay from "./overlays/variant_overlay";
import WelcomeOverlay from "./overlays/welcome_overlay";
import NewFeaturesOverlay from "./overlays/new_features_overlay";
import MidiImportOverlay from "./overlays/midi_import_overlay";
import SupportUsOverlay from "./overlays/support_us_overlay";

import { getSelectorsByUserAgent } from "react-device-detect";

import { useEffect, useState, useLayoutEffect } from "react";
import { useStore } from "@/state/use_store";
import { shallow } from "zustand/shallow";

export default function App() {
  const [
    setCustomScrollbar,
    isMobile,
    setIsMobile,
    showFullscreenButton,
    setShowFullscreenButton,
  ] = useStore(
    (state) => [
      state.setCustomScrollbarEnabled,
      state.isMobile,
      state.setIsMobile,
      state.showFullscreenButton,
      state.setShowFullscreenButton,
    ],
    shallow,
  );

  // Next.js 13+ implementation, the default isMobile from react-device-detect
  // is not working anymore (see https://stackoverflow.com/a/77174374/3058839)
  useEffect(() => {
    document.title = "ChordSeqAI"; // Change the title when the page loads
    const userAgent = navigator.userAgent;
    const selectors = getSelectorsByUserAgent(userAgent);
    setIsMobile(selectors.isMobile);

    // If it is already installed, it will be fullscreen by default
    const isFullscreen = window.matchMedia(
      "(display-mode: fullscreen)",
    ).matches;

    const isFullscreenSupported = document.fullscreenEnabled;

    setShowFullscreenButton(
      isFullscreenSupported && !isFullscreen && selectors.isMobile,
    );

    // Disable custom scrollbar for Firefox and mobile devices
    if (/Firefox/i.test(userAgent) || selectors.isMobile)
      setCustomScrollbar(false);
  }, [setCustomScrollbar, setIsMobile, setShowFullscreenButton]);

  const [aspectRatio, setAspectRatio] = useState(0);

  // On window resize, update the aspect ratio
  useLayoutEffect(() => {
    setAspectRatio(window.innerWidth / window.innerHeight); // Initial aspect ratio

    function handleResize() {
      setAspectRatio(window.innerWidth / window.innerHeight);
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Show a message if the aspect ratio is not supported
  let info = "";

  if (aspectRatio <= 0.96) {
    if (isMobile) {
      info = "Please rotate your device to landscape orientation.";
    } else {
      info =
        "This app is not supported on this screen size, please use a landscape orientation.";
    }
  }
  if (aspectRatio >= 4) {
    info =
      "This app is not supported on this screen size, please use a more narrow screen.";
  }

  if (info) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-zinc-950 p-[4dvh]">
        <p className="text-center text-[4dvh] font-bold text-zinc-500">
          {info}
        </p>
      </div>
    );
  }

  // Main app
  return (
    <div
      className="relative flex max-h-screen flex-col bg-cover bg-scroll bg-center text-[2.5dvh]"
      style={{ backgroundImage: `url('/background-blurred.png')` }}
    >
      <MidiImportOverlay />
      <VariantOverlay />
      <WelcomeOverlay />
      <NewFeaturesOverlay />
      <SupportUsOverlay />
      <div className="grid min-h-screen min-w-full grid-rows-[9dvh_min(30dvw,27.5dvh)_auto] gap-[1dvw] p-[1dvw]">
        <div
          className={`grid w-full min-w-0 ${showFullscreenButton ? "grid-cols-[25fr_7fr_7fr]" : "grid-cols-[25fr_7fr_5fr]"} gap-[1dvw]`}
        >
          <ModelSelection />
          <TransposeImportExport />
          <SupportHelp />
        </div>
        <TimelineEditor />
        <Suggestions />
      </div>
    </div>
  );
}
