"use client";
import ModelSelection from "@/components/model_selection/model_selection";
import TransposeImportExport from "@/components/transpose_import_export/transpose_import_export";
import GetHelp from "@/components/get_help";
import TimelineEditor from "@/components/timeline/timeline_editor";
import Suggestions from "@/components/suggestions/suggestions";
import VariantOverlay from "./overlays/variant_overlay";
import WelcomeOverlay from "./overlays/welcome_overlay";
import NewFeaturesOverlay from "./overlays/new_features_overlay";
import MidiImportOverlay from "./overlays/midi_import_overlay";

import { getSelectorsByUserAgent } from "react-device-detect";

import { useEffect, useState } from "react";
import { useStore } from "@/state/use_store";
import { shallow } from "zustand/shallow";

export default function App() {
  const [setCustomScrollbar] = useStore(
    (state) => [state.setCustomScrollbarEnabled],
    shallow
  );

  // Next.js 13+ implementation, the default isMobile from react-device-detect
  // is not working anymore (see https://stackoverflow.com/a/77174374/3058839)
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    document.title = "ChordSeqAI"; // Change the title when the page loads
    const userAgent = navigator.userAgent;
    const selectors = getSelectorsByUserAgent(userAgent);
    setIsMobile(selectors.isMobile);

    // Disable custom scrollbar for Firefox
    if (/Firefox/i.test(userAgent)) setCustomScrollbar(false);
  }, []);

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

  // Show a message if the aspect ratio or the device is not supported
  let info = "";

  if (isMobile) {
    info =
      "This app is currently not available on mobile devices, please use a desktop.";
  }
  if (aspectRatio <= 0.96) {
    info =
      "This app is not supported on this screen size, please use a landscape orientation.";
  }
  if (aspectRatio >= 4) {
    info =
      "This app is not supported on this screen size, please use a more narrow screen.";
  }

  if (info) {
    return (
      <div className="w-full min-h-screen flex flex-col justify-center items-center bg-zinc-950 p-[4dvh]">
        <p className="text-[4dvh] font-bold text-zinc-500 text-center">
          {info}
        </p>
      </div>
    );
  }

  // Main app
  return (
    <div
      className="relative max-h-screen flex flex-col bg-scroll bg-center bg-cover text-[2.5dvh]"
      style={{ backgroundImage: `url('/background.jpg')` }}
    >
      <MidiImportOverlay />
      <VariantOverlay />
      <WelcomeOverlay />
      <NewFeaturesOverlay />
      <div className="min-h-screen min-w-full grid grid-rows-[9dvh_min(30dvw,27.5dvh)_auto] backdrop-blur-[max(2dvw,4dvh)] gap-[1dvw] p-[1dvw]">
        <div className="grid grid-cols-[15fr_5fr_2fr] gap-[1dvw] w-full min-w-0">
          <ModelSelection />
          <TransposeImportExport />
          <GetHelp />
        </div>
        <TimelineEditor />
        <Suggestions />
      </div>
    </div>
  );
}
