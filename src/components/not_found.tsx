"use client";

import { useState, useEffect } from "react";
import { getSelectorsByUserAgent } from "react-device-detect";

import Image from "next/image";
import Header from "@/components/wiki/header";
import { AppProgressBar as ProgressBar } from "next-nprogress-bar";

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
    <>
      <ProgressBar
        height="4px"
        color="#5B21B6"
        options={{ showSpinner: false }}
        shallowRouting={true}
      />
      <div className="text-zinc-300 h-[100dvh] w-full">
        {/* Background */}
        <div className="fixed inset-0 -z-20">
          <Image
            className="filter bg-zinc-950 object-cover"
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
        <div className="h-[calc(100%-65px)] flex flex-col items-center justify-center lg:overflow-y-auto custom-scrollbar p-5 overflow-y-auto">
          {/* Background effect */}
          <div className="absolute z-20 pointer-events-none top-0 inset-x-0 max-h-screen select-none flex items-center justify-center overflow-hidden">
            <Image
              className="filter opacity-65"
              src="/background-effect.png"
              alt=""
              width={1500}
              height={750}
              priority={true}
            />
          </div>

          <div className="flex-auto h-full w-full text-center flex flex-col md:flex-row items-center justify-center">
            <h1 className="text-4xl font-extrabold text-zinc-50 md:pr-6 md:mr-6 md:border-r md:border-r-zinc-300/50">
              404
            </h1>
            <p className="text-lg mt-2 md:mt-0">
              This page could not be found.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
