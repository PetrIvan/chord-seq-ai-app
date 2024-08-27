import React from "react";

import Link from "next/link";
import Image from "next/image";

import { findPageNameInTree } from "@/wiki/utils";
import Search from "./search";

interface Props {
  isTop: boolean;
  pagePath: string;
  customScrollbarEnabled: boolean;
  setIsSidenavOpen: (value: boolean) => void;
  setIsSearchOpen: (value: boolean) => void;
}

export default function Header({
  isTop,
  pagePath,
  customScrollbarEnabled,
  setIsSidenavOpen,
  setIsSearchOpen,
}: Props) {
  const parts = pagePath.split("/").slice(1);

  return (
    <header
      className={`top-0 sticky z-40 flex flex-col justify-center w-full backdrop-blur transition-colors duration-500 ${
        isTop ? "bg-transparent" : "bg-zinc-950/50"
      } border-b border-b-zinc-800 cursor-default`}
    >
      <div className="flex flex-row justify-between items-center p-2">
        <Link href="/" className="flex items-center">
          <Image
            src="/logo.svg"
            alt="ChordSeqAI"
            className="h-12 w-full hidden md:block"
            width={161}
            height={38}
          />
          <Image
            src="/app-icon.svg"
            alt="ChordSeqAI"
            className="h-12 w-12 md:hidden"
            width={100}
            height={100}
          />
        </Link>
        <Search
          className="hidden lg:block"
          customScrollbarEnabled={customScrollbarEnabled}
        />
        <div className="text-lg flex flex-row items-center justify-around space-x-4 lg:space-x-8 pr-4 text-white *:filter *:contrast-[66%] hover:*:contrast-100">
          <Image
            className="w-5 h-5 lg:hidden cursor-pointer"
            src="/search.svg"
            alt="Search icon"
            width={100}
            height={100}
            onClick={() => setIsSearchOpen(true)}
          />
          <Link href="/wiki">Wiki</Link>
          <Link href="/app">App</Link>
          <Link
            className="selection-none"
            href="https://github.com/PetrIvan/chord-seq-ai-app"
            rel="noopener noreferrer"
            target="_blank"
          >
            <Image
              className="h-6 w-fit filter brightness-0 invert"
              src="/github-logo.svg"
              alt="GitHub Repository"
              width={98}
              height={96}
            />
          </Link>
        </div>
      </div>

      <div className="lg:hidden flex flex-row items-center justify-start text-sm space-x-3 border-t border-t-zinc-800 p-3">
        <Image
          src="/menu.svg"
          alt="Menu"
          className="h-5 w-5 cursor-pointer"
          width={100}
          height={100}
          onClick={() => setIsSidenavOpen(true)}
        />
        <div className="flex flex-row items-center justify-center space-x-2 cursor-text">
          {parts.map((part, index) => {
            return (
              <React.Fragment key={index}>
                <p
                  className={
                    index === parts.length - 1
                      ? "font-semibold text-zinc-50"
                      : ""
                  }
                >
                  {findPageNameInTree(parts.slice(0, index + 1).join("/"))}
                </p>
                {index < parts.length - 1 && (
                  <svg
                    className="w-[0.6rem] h-[0.6rem] inline-block"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 6 10"
                  >
                    <path
                      transform="rotate(-90 5 5)"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1"
                      d="m1 1 4 4 4-4"
                    />
                  </svg>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </header>
  );
}
