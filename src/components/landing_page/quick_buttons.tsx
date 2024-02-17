"use client";
import { getSelectorsByUserAgent } from "react-device-detect";

import { useEffect, useState } from "react";

export default function QuickButtons() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    document.title = "ChordSeqAI"; // Change the title when the page loads
    const userAgent = navigator.userAgent;
    const selectors = getSelectorsByUserAgent(userAgent);
    setIsMobile(selectors.isMobile);
  }, []);

  return (
    <div
      className={`flex flex-col md:flex-row items-center space-x-0 md:space-x-20 space-y-4 md:space-y-0 ${
        isMobile && "mt-0"
      }`}
    >
      {isMobile && (
        <p className="text-lg md:text-xl text-zinc-300 px-5">
          Currently available only on desktop devices.
        </p>
      )}

      <a
        href="https://github.com/PetrIvan/chord-seq-ai-app"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center bg-white text-black py-7 px-6 rounded-full shadow-md border-2 border-zinc-900 text-xl md:text-2xl font-medium transition duration-300 ease-in-out hover:brightness-90 w-48 h-12"
      >
        <img src="/github-logo.svg" alt="GitHub" className="mr-2 h-6 w-6" />
        GitHub
      </a>

      {!isMobile && (
        <a
          className="flex items-center justify-center py-7 px-6 rounded-full shadow-md border-2 text-xl md:text-2xl font-medium w-48 h-12 border-white text-white bg-gradient-to-bl from-[#8C205C] to-[#5C51A6] transition duration-300 ease-in-out hover:brightness-90"
          href="/app"
        >
          Launch App
        </a>
      )}
    </div>
  );
}
