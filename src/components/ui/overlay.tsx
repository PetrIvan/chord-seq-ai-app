"use client";
import React, { useEffect } from "react";
import { useStore } from "@/state/use_store";
import { shallow } from "zustand/shallow";

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
  const [customScrollbarEnabled, setEnabledShortcuts] = useStore(
    (state) => [state.customScrollbarEnabled, state.setEnabledShortcuts],
    shallow
  );

  // Disable shortcuts when the overlay is open
  useEffect(() => {
    if (isOverlayOpen) {
      setEnabledShortcuts(false);
    }
  }, [isOverlayOpen]);

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
      <div className="fixed inset-0 z-30 bg-zinc-950 bg-opacity-50 flex flex-col items-center justify-center">
        <div
          className={
            `relative bg-zinc-900 h-[80dvh] w-[70dvw] rounded-[0.5dvw] p-[2dvh] ` +
            `${enabledOverflow ? "overflow-y-auto " : ""}` +
            `${
              customScrollbarEnabled
                ? "scrollbar-thin scrollbar-track-zinc-800 scrollbar-track-rounded-full scrollbar-thumb-zinc-700 hover:scrollbar-thumb-zinc-600 active:scrollbar-thumb-zinc-500 scrollbar-thumb-rounded-full"
                : ""
            }`
          }
        >
          <img
            className="absolute top-[1dvh] right-[1dvh] w-[5dvh] h-[5dvh] cursor-pointer filter active:brightness-90"
            src="/close.svg"
            title="Close (Esc)"
            onClick={() => {
              setEnabledShortcuts(true);
              if (callOnClose) callOnClose();
              setIsOverlayOpen(false);
            }}
          />
          <div
            className={
              `w-full flex flex-col items-center justify-center space-y-[2dvh] px-[6dvh] ` +
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
