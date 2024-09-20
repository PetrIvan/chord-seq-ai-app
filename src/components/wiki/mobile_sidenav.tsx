"use client";

import Image from "next/image";
import { AnimatePresence } from "framer-motion";
import { useEffect } from "react";

import Sidenav from "./sidenav";

interface Props {
  isSidenavOpen: boolean;
  setIsSidenavOpen: (value: boolean) => void;
  customScrollbarEnabled: boolean;
  pagePath: string;
}

export default function MobileSidenav({
  isSidenavOpen,
  setIsSidenavOpen,
  customScrollbarEnabled,
  pagePath,
}: Props) {
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsSidenavOpen(false);
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [setIsSidenavOpen]);

  return (
    <AnimatePresence>
      {isSidenavOpen && (
        <div
          className="fixed top-0 z-50 h-screen w-screen bg-zinc-950/50 lg:hidden"
          onClick={() => setIsSidenavOpen(false)}
        >
          {/* Background blur */}
          <div className="z-40 h-full w-full backdrop-blur-sm" />

          <div onClick={(e: any) => e.stopPropagation()}>
            <Sidenav
              className="z-50 bg-zinc-900"
              currentPath={`/wiki${pagePath}`}
              customScrollbarEnabled={customScrollbarEnabled}
              animate={true}
            >
              <Image
                src="/close.svg"
                title="Close (Esc)"
                alt="Close"
                className="absolute right-3 top-6 h-6 w-6 cursor-pointer"
                width={100}
                height={100}
                onClick={() => setIsSidenavOpen(false)}
              />
            </Sidenav>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
