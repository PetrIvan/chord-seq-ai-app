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
          className="lg:hidden fixed top-0 h-screen w-screen z-50 bg-zinc-950/50"
          onClick={() => setIsSidenavOpen(false)}
        >
          {/* Background blur */}
          <div className="w-full h-full backdrop-blur-sm z-40" />

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
                className="absolute top-6 right-3 h-6 w-6 cursor-pointer"
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
