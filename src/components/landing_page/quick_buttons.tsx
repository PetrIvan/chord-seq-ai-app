"use client";
import Image from "next/image";
import Link from "next/link";

import { useEffect } from "react";

export default function QuickButtons() {
  useEffect(() => {
    document.title = "ChordSeqAI"; // Change the title when the page loads
  }, []);

  return (
    <div className="flex flex-col items-center space-x-0 space-y-4 md:flex-row md:space-x-20 md:space-y-0">
      <Link
        href="https://github.com/PetrIvan/chord-seq-ai-app"
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-12 w-48 items-center justify-center rounded-full border-2 border-zinc-900 bg-white px-6 py-7 text-xl font-medium text-black shadow-md transition duration-300 ease-in-out hover:brightness-90 md:text-2xl"
      >
        <Image
          src="/github-logo.svg"
          alt="GitHub"
          className="mr-2 h-6 w-6"
          width={98}
          height={96}
        />
        GitHub
      </Link>

      <Link
        className="flex h-12 w-48 items-center justify-center rounded-full border-2 border-white bg-gradient-to-bl from-[#8C205C] to-[#5C51A6] px-6 py-7 text-xl font-medium text-white shadow-md transition duration-300 ease-in-out hover:brightness-90 md:text-2xl"
        href="/app"
      >
        Launch App
      </Link>
    </div>
  );
}
