"use client";
import React, { useEffect } from "react";
import { useStore } from "@/state/use_store";
import { shallow } from "zustand/shallow";
import Image from "next/image";

interface Props {
  children: React.ReactNode;
  isOverlayOpen: boolean;
  setIsOverlayOpen: (value: boolean) => void;
  enabledOverflow?: boolean;
  callOnClose?: () => void;
  otherShortcuts?: (e: KeyboardEvent) => void;
}

export default function Overlay({
  children,
  isOverlayOpen,
  setIsOverlayOpen,
  enabledOverflow = true,
  callOnClose,
  otherShortcuts,
}: Props) {
  const [
    customScrollbarEnabled,
    isStepByStepTutorialOpen,
    setEnabledShortcuts,
  ] = useStore(
    (state) => [
      state.customScrollbarEnabled,
      state.isStepByStepTutorialOpen,
      state.setEnabledShortcuts,
    ],
    shallow,
  );

  // Disable shortcuts when the overlay is open
  useEffect(() => {
    if (isOverlayOpen) {
      setEnabledShortcuts(false);
    }
  }, [isOverlayOpen, setEnabledShortcuts]);

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!isOverlayOpen) return;

      if (e.key === "Escape") {
        if (callOnClose) callOnClose();
        setEnabledShortcuts(true);
        setIsOverlayOpen(false);
      }

      if (otherShortcuts) otherShortcuts(e);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    callOnClose,
    isOverlayOpen,
    otherShortcuts,
    setEnabledShortcuts,
    setIsOverlayOpen,
  ]);

  return (
    isOverlayOpen && (
      <div
        className="fixed inset-0 z-30 flex flex-col items-center justify-center bg-zinc-950 bg-opacity-50"
        style={isStepByStepTutorialOpen ? { zIndex: 150 } : {}}
      >
        <div
          className={
            `relative h-[80dvh] w-[70dvw] rounded-[0.5dvw] bg-zinc-900 p-[2dvh] ` +
            `${enabledOverflow ? "overflow-y-auto" : ""} ` +
            `${
              customScrollbarEnabled
                ? "scrollbar-thin scrollbar-track-zinc-800 scrollbar-thumb-zinc-700 scrollbar-track-rounded-full scrollbar-thumb-rounded-full hover:scrollbar-thumb-zinc-600 active:scrollbar-thumb-zinc-500"
                : ""
            }`
          }
        >
          <Image
            className="absolute right-[1dvh] top-[1dvh] h-[5dvh] w-[5dvh] cursor-pointer filter active:brightness-90"
            src="/close.svg"
            title="Close (Esc)"
            alt="Close"
            width={100}
            height={100}
            onClick={() => {
              setEnabledShortcuts(true);
              if (callOnClose) callOnClose();
              setIsOverlayOpen(false);
            }}
          />
          <div
            className={
              `flex w-full flex-col items-center justify-center space-y-[2dvh] px-[6dvh] ` +
              `${enabledOverflow ? "h-fit min-h-full" : "h-full"}`
            }
          >
            {children}
          </div>
        </div>
      </div>
    )
  );
}
