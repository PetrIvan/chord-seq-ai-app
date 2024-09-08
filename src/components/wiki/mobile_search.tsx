"use client";

import { useEffect } from "react";
import { useBreakpoint } from "@/state/use_breakpoint";
import Search from "./search";

interface Props {
  isSearchOpen: boolean;
  setIsSearchOpen: (value: boolean) => void;
  customScrollbarEnabled: boolean;
}

export default function MobileSearch({
  isSearchOpen,
  setIsSearchOpen,
  customScrollbarEnabled,
}: Props) {
  const isAboveLg = useBreakpoint("lg");

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && e.ctrlKey && !isAboveLg) setIsSearchOpen(true);
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [setIsSearchOpen, isAboveLg]);

  return (
    isSearchOpen && (
      <div
        className="fixed top-0 z-50 h-screen w-screen bg-zinc-950/50 lg:hidden"
        onClick={() => setIsSearchOpen(false)}
      >
        {/* Background blur */}
        <div className="h-full w-full backdrop-blur-sm" />

        <div className="fixed inset-0 flex items-start justify-center p-5">
          <Search
            className="max-h-[80dvh] rounded-xl border border-zinc-800 bg-zinc-900"
            customScrollbarEnabled={customScrollbarEnabled}
            isOverlay={true}
            setIsSearchOpen={(value) => {
              setIsSearchOpen(value);
            }}
            shouldFocus={isSearchOpen}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      </div>
    )
  );
}
