"use client";

import { useState, useEffect } from "react";
import { getSelectorsByUserAgent } from "react-device-detect";

import Image from "next/image";
import Header from "@/components/header";

export default function NotFound() {
  // Scrollbar customization
  const [customScrollbarEnabled, setCustomScrollbarEnabled] = useState(true);

  useEffect(() => {
    const userAgent = navigator.userAgent;
    const isMobile = getSelectorsByUserAgent(userAgent).isMobile;
    document.body.classList.add("custom-scrollbar");

    // Disable custom scrollbar for Firefox and mobile devices
    if (/Firefox/i.test(userAgent) || isMobile) {
      setCustomScrollbarEnabled(false);
      // Remove custom-scrollbar class from all elements
      document.querySelectorAll(".custom-scrollbar").forEach((element) => {
        element.classList.remove("custom-scrollbar");
      });
    }
  }, []);

  return (
    <div className="h-[100dvh] w-full text-zinc-300">
      {/* Background */}
      <div className="fixed inset-0 -z-20">
        <Image
          className="bg-zinc-950 object-cover filter"
          src="/background-blurred.png"
          alt=""
          fill
        />
        <div className="fixed inset-0 bg-zinc-950/50" />
      </div>

      {/* Main content */}
      <Header
        isTop={true}
        pagePath={"/404"}
        customScrollbarEnabled={customScrollbarEnabled}
        setIsSidenavOpen={() => {}}
        setIsSearchOpen={() => {}}
        searchEnabled={false}
        sidenavEnabled={false}
      />
      <div className="custom-scrollbar flex h-[calc(100%-65px)] flex-col items-center justify-center overflow-y-auto p-5 lg:overflow-y-auto">
        {/* Background effect */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex max-h-screen select-none items-center justify-center overflow-hidden">
          <Image
            className="opacity-65 filter"
            src="/background-effect.png"
            alt=""
            width={1500}
            height={750}
            priority={true}
          />
        </div>

        <div className="flex h-full w-full flex-auto flex-col items-center justify-center text-center md:flex-row">
          <h1 className="text-4xl font-extrabold text-zinc-50 md:mr-6 md:border-r md:border-r-zinc-300/50 md:pr-6">
            404
          </h1>
          <p className="mt-2 text-lg md:mt-0">This page could not be found.</p>
        </div>
      </div>
    </div>
  );
}
