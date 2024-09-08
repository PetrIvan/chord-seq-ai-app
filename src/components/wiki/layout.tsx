"use client";

import { useState, useEffect, useRef } from "react";
import { getSelectorsByUserAgent } from "react-device-detect";
import { useBreakpoint } from "@/state/use_breakpoint";

import Image from "next/image";

import Header from "../header";
import Sidenav from "./sidenav";
import TableOfContents from "./table_of_contents";
import MobileSidenav from "./mobile_sidenav";
import MobileSearch from "./mobile_search";
import MobileTableOfContents from "./mobile_table_of_contents";
import NavigationButtons from "./navigation_buttons";

import { getHeadings } from "@/wiki/utils";

interface Props {
  pagePath: string;
  source: string;
  children: React.ReactNode;
}

export default function WikiLayout({ pagePath, source, children }: Props) {
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

  // Scroll logic with sidenav and search
  const [isTop, setIsTop] = useState(true);
  const [topOffset, setTopOffset] = useState(0);
  const [activeId, setActiveId] = useState("");

  const [isSidenavOpen, setIsSidenavOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const prevIsSidenavOpen = useRef(isSidenavOpen);
  const prevIsSearchOpen = useRef(isSearchOpen);

  useEffect(() => {
    const handleScroll = () => {
      // Check if the scroll position is at the top with a threshold of 20px
      if (!isSidenavOpen && !isSearchOpen) setIsTop(window.scrollY < 20);

      // Scroll to top when the sidenav or search is closed
      if (
        isSidenavOpen !== prevIsSidenavOpen.current ||
        isSearchOpen !== prevIsSearchOpen.current
      ) {
        prevIsSidenavOpen.current = isSidenavOpen;
        prevIsSearchOpen.current = isSearchOpen;

        if (!isSidenavOpen && !isSearchOpen) {
          window.scrollTo({ top: topOffset });
        }
      }

      // Update the top offset
      if (!isSidenavOpen && !isSearchOpen) {
        setTopOffset(window.scrollY);
      }
    };

    // Add event listener to monitor scroll
    window.addEventListener("scroll", handleScroll);
    handleScroll();

    // Cleanup function to remove event listener
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isSidenavOpen, isSearchOpen, topOffset]);

  // Close sidenav and search on breakpoint
  const isAboveLg = useBreakpoint("lg");
  useEffect(() => {
    if (isAboveLg) {
      setIsSidenavOpen(false);
      setIsSearchOpen(false);
    }
  }, [isAboveLg]);

  // Detect which header is currently active based on visibility of the section
  useEffect(() => {
    const entryMap = new Map<Element, IntersectionObserverEntry>();

    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      let anyIntersecting = false;

      // Update the map with the latest entries
      entries.forEach((entry) => {
        entryMap.set(entry.target, entry);
      });

      entryMap.forEach((entry) => {
        if (entry.isIntersecting) {
          anyIntersecting = true;
          const id = entry.target.getAttribute("data-header-id");
          if (id) setActiveId(id);
        }
      });

      if (!anyIntersecting) setActiveId("");
    };

    const observer = new IntersectionObserver(handleIntersection, {
      rootMargin: `-64px 0% -${window.innerHeight - 100}px 0%`,
    });

    const headers = document.querySelectorAll("h2, h3");

    headers.forEach((header, index) => {
      const nextHeader = headers[index + 1];
      const sectionElements: HTMLElement[] = [header as HTMLElement]; // Include the header itself

      // Collect all content between the current header and the next one
      let sibling = header.nextElementSibling;
      while (sibling && sibling !== nextHeader) {
        if (sibling instanceof HTMLElement) {
          sectionElements.push(sibling);
        }
        sibling = sibling.nextElementSibling;
      }

      // Set a common data-header-id attribute for all elements in the section
      sectionElements.forEach((element) => {
        element.setAttribute("data-header-id", header.id);
        observer.observe(element);
      });
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div className="text-zinc-300">
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

      {/* Absolute elements */}
      <MobileSidenav
        isSidenavOpen={isSidenavOpen}
        setIsSidenavOpen={setIsSidenavOpen}
        customScrollbarEnabled={customScrollbarEnabled}
        pagePath={pagePath}
      />
      <MobileSearch
        isSearchOpen={isSearchOpen}
        setIsSearchOpen={setIsSearchOpen}
        customScrollbarEnabled={customScrollbarEnabled}
      />

      {/* Main content */}
      <Header
        isTop={isTop}
        pagePath={pagePath}
        customScrollbarEnabled={customScrollbarEnabled}
        setIsSidenavOpen={setIsSidenavOpen}
        setIsSearchOpen={setIsSearchOpen}
      />
      <div className="flex w-full flex-row">
        <Sidenav
          className="z-20 mt-[4rem] hidden bg-zinc-950/20 backdrop-blur-md lg:block"
          currentPath={`/wiki${pagePath}`}
          customScrollbarEnabled={customScrollbarEnabled}
        />

        <div className="max-w-full lg:pl-[16rem] lg:pr-[16rem]">
          <div
            className={`custom-scrollbar flex w-full flex-row p-5 lg:overflow-y-auto lg:pl-10 ${
              isSidenavOpen || isSearchOpen ? "fixed" : "overflow-y-auto"
            }`}
            style={{
              top:
                isSidenavOpen || isSearchOpen
                  ? `calc(${-topOffset}px + 6.864rem)`
                  : "",
            }}
          >
            {/* Background effect */}
            <div
              className="pointer-events-none absolute inset-x-0 top-0 z-20 flex max-h-screen select-none items-center justify-center overflow-hidden"
              style={{
                top: isSidenavOpen || isSearchOpen ? "-6.864rem" : "",
              }}
            >
              <Image
                className="opacity-65 filter"
                src="/background-effect.png"
                alt=""
                width={1500}
                height={750}
                priority={true}
              />
            </div>

            {/* MDX content */}
            <div className="z-20 flex min-w-0 flex-1 flex-col space-y-2 text-justify">
              <MobileTableOfContents source={source} />
              {children}
              {pagePath !== "/" && <NavigationButtons pagePath={pagePath} />}
            </div>

            <TableOfContents
              headings={getHeadings(source)}
              activeId={activeId}
              className="fixed right-0 top-0 hidden w-64 px-5 pb-5 pt-[6rem] scrollbar-none lg:block"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
