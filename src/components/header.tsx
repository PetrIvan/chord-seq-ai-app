"use client";

import React from "react";

import { getSelectorsByUserAgent } from "react-device-detect";
import { useLayoutEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

import { findPageNameInTree } from "@/wiki/utils";
import Search from "./wiki/search";

interface Props {
  isTop: boolean;
  pagePath?: string;
  customScrollbarEnabled: boolean;
  setIsSidenavOpen?: (value: boolean) => void;
  setIsSearchOpen?: (value: boolean) => void;
  sticky?: boolean;
  h1Logo?: boolean;
  searchEnabled?: boolean;
  sidenavEnabled?: boolean;
  borderEnabled?: boolean;
}

export default function Header({
  isTop,
  pagePath = "/",
  customScrollbarEnabled,
  setIsSidenavOpen,
  setIsSearchOpen,
  sticky = true,
  h1Logo = false,
  searchEnabled = true,
  sidenavEnabled = true,
  borderEnabled = true,
}: Props) {
  const [isMobile, setIsMobile] = useState(false);

  useLayoutEffect(() => {
    const userAgent = navigator.userAgent;
    const selectors = getSelectorsByUserAgent(userAgent);
    setIsMobile(selectors.isMobile);
  }, []);

  const parts = pagePath.split("/").slice(1);

  return (
    <header
      className={`top-0 ${
        sticky ? "sticky" : ""
      } z-40 flex w-full flex-col justify-center backdrop-blur transition-colors duration-500 ${
        isTop ? "bg-transparent" : "bg-zinc-950/50"
      } ${borderEnabled ? "border-b border-b-zinc-800" : ""} cursor-default`}
    >
      <div className="flex flex-row items-center justify-between p-2">
        <Link href="/" className="flex items-center">
          {h1Logo ? (
            <h1>
              <Image
                src="/logo.svg"
                alt="Compose with ChordSeqAI: Your AI Chord Progression Suggester"
                className="hidden h-12 w-full md:block"
                width={161}
                height={38}
              />
              <Image
                src="/app-icon.svg"
                alt="Compose with ChordSeqAI: Your AI Chord Progression Suggester"
                className="h-12 w-12 md:hidden"
                width={100}
                height={100}
              />
            </h1>
          ) : (
            <>
              <Image
                src="/logo.svg"
                alt="ChordSeqAI"
                className="hidden h-12 w-full md:block"
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
            </>
          )}
        </Link>
        {searchEnabled && (
          <Search
            className="hidden lg:block"
            customScrollbarEnabled={customScrollbarEnabled}
          />
        )}
        <div className="flex flex-row items-center justify-around space-x-4 pr-4 text-lg text-white *:contrast-[66%] *:filter hover:*:contrast-100 lg:space-x-8">
          {searchEnabled && (
            <Image
              className="h-5 w-5 cursor-pointer lg:hidden"
              src="/search.svg"
              alt="Search icon"
              title="Search (Ctrl+K)"
              width={100}
              height={100}
              onClick={() => {
                if (setIsSearchOpen) setIsSearchOpen(true);
              }}
            />
          )}
          <Link href="/wiki">Wiki</Link>
          {!isMobile && <Link href="/app">App</Link>}
          <Link
            className="selection-none"
            href="https://github.com/PetrIvan/chord-seq-ai-app"
            rel="noopener noreferrer"
            target="_blank"
          >
            <Image
              className="h-6 w-fit brightness-0 invert filter"
              src="/github-logo.svg"
              alt="GitHub Repository"
              width={98}
              height={96}
            />
          </Link>
        </div>
      </div>

      {sidenavEnabled && (
        <div className="flex flex-row items-center justify-start space-x-3 border-t border-t-zinc-800 p-3 text-sm lg:hidden">
          <Image
            src="/menu.svg"
            alt="Menu"
            className="h-5 w-5 cursor-pointer"
            width={100}
            height={100}
            onClick={() => {
              if (setIsSidenavOpen) setIsSidenavOpen(true);
            }}
          />
          <div className="flex cursor-text flex-row items-center justify-center space-x-2">
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
                      className="inline-block h-[0.6rem] w-[0.6rem]"
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
      )}
    </header>
  );
}
