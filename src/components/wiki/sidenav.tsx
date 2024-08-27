"use client";

import { useState, useEffect, useLayoutEffect, useRef } from "react";
import Link from "next/link";

import { useStore } from "@/state/use_store";

import { wikiTree, WikiTreeNode } from "@/data/wiki_tree.ts";
import { findPageNameInTree } from "@/wiki/utils";

function PageLink(
  fullPath: string,
  title: string,
  currentPath: string,
  // Links with children should not be clickable (only expandable)
  disableInteraction = false
) {
  const wrapperClass =
    currentPath === fullPath
      ? "font-semibold text-zinc-50"
      : "hover:text-zinc-50";
  const borderClass = `absolute top-0 -left-2 h-[2.5rem] w-full border-l border-zinc-800 hover:border-zinc-600 cursor-pointer transition-colors duration-200 ${
    currentPath === fullPath ? "border-zinc-600" : ""
  }`;

  return disableInteraction ? (
    <div className={wrapperClass}>
      {title}
      <div className={borderClass} />
    </div>
  ) : (
    <Link className={wrapperClass} href={fullPath}>
      {title}
      <div className={borderClass} />
    </Link>
  );
}

function Details(
  key: string,
  value: WikiTreeNode,
  fullPath: string,
  currentPath: string
) {
  const [wikiSidenavOpen, setWikiSidenavOpen] = useStore((state) => [
    state.wikiSidenavOpen,
    state.setWikiSidenavOpen,
  ]);

  // Handle open/close animations
  const [animationOpen, setAnimationOpen] = useState(
    wikiSidenavOpen.get(fullPath) ?? true
  );
  const [detailsOpen, setDetailsOpen] = useState(
    wikiSidenavOpen.get(fullPath) ?? true
  );

  const details = useRef<HTMLDetailsElement>(null);
  const toggleBox = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let toggleBoxValue = toggleBox.current;
    let detailsValue = details.current;

    function handleClick(e: MouseEvent) {
      e.preventDefault();

      wikiSidenavOpen.set(fullPath, !animationOpen);
      setWikiSidenavOpen(wikiSidenavOpen);

      if (animationOpen) {
        setAnimationOpen(false);
      } else {
        setDetailsOpen(true);
        setAnimationOpen(true);
      }
    }

    function handleAnimationEnd(e: AnimationEvent) {
      e.stopPropagation();
      if (e.animationName === "details-close") {
        setDetailsOpen(false);
      }
    }

    toggleBox.current?.addEventListener("click", handleClick);
    details.current?.addEventListener("animationend", handleAnimationEnd);

    return () => {
      toggleBoxValue?.removeEventListener("click", handleClick);
      detailsValue?.removeEventListener("animationend", handleAnimationEnd);
    };
  }, [animationOpen, fullPath, setWikiSidenavOpen, wikiSidenavOpen]);

  // Wait for the DOM to load before animating to prevent animation on page load
  useEffect(() => {
    function onReady() {
      details.current?.querySelector("ul")?.classList.remove("preload");
    }

    if (document.readyState !== "loading") {
      setTimeout(onReady, 500);
    } else {
      document.addEventListener("DOMContentLoaded", onReady);
    }
  }, []);

  return (
    <details
      className={`${
        animationOpen
          ? "[&>ul]:animate-details-open [&>summary>svg]:-rotate-90"
          : "[&>ul]:animate-details-close"
      }`}
      open={detailsOpen}
      ref={details}
    >
      <summary
        className="pb-2 flex items-center justify-between cursor-pointer"
        ref={toggleBox}
      >
        {PageLink(
          fullPath,
          findPageNameInTree(fullPath) || key,
          currentPath,
          true
        )}
        {/* Arrow SVG */}
        <svg
          className="text-zinc-400 w-4 h-4 inline-block transform rotate-90 transition-transform duration-200"
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
      </summary>

      <ul className="pl-4 h-fit overflow-hidden transition-opacity duration-500 preload">
        {SidenavLayer(value, fullPath, currentPath)}
      </ul>
    </details>
  );
}

function SidenavLayer(tree: WikiTreeNode, path: string, currentPath: string) {
  return Object.entries(tree).map(([key, value]) => {
    const fullPath = `${path}/${key}`;
    return (
      <li
        className={`pl-2 relative select-none ${
          value.children ? "pt-2" : "py-2"
        }`}
        key={key}
      >
        {value.children
          ? Details(key, value.children, fullPath, currentPath)
          : PageLink(
              fullPath,
              findPageNameInTree(fullPath) || key,
              currentPath
            )}
      </li>
    );
  });
}

interface Props extends React.HTMLAttributes<HTMLElement> {
  currentPath: string;
  customScrollbarEnabled: boolean;
  className?: string;
  children?: React.ReactNode;
}

export default function Sidenav({
  currentPath,
  customScrollbarEnabled,
  className,
  children,
  ...props
}: Props) {
  const [wikiSidenavScroll, setWikiSidenavScroll] = useStore((state) => [
    state.wikiSidenavScroll,
    state.setWikiSidenavScroll,
  ]);

  const navRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const navEl = navRef.current;
    if (!navEl) return;

    navEl.scrollTop = wikiSidenavScroll;

    const handleScroll = () => {
      setWikiSidenavScroll(navEl.scrollTop);
    };

    navEl.addEventListener("scroll", handleScroll);

    return () => {
      navEl.removeEventListener("scroll", handleScroll);
    };
  }, [wikiSidenavScroll, setWikiSidenavScroll]);

  return (
    <nav
      {...props}
      className={
        "fixed top-0 inset-0 w-64 shrink-0 p-4 overflow-y-auto border-r border-zinc-800 " +
        className +
        (customScrollbarEnabled ? " custom-scrollbar" : "")
      }
      ref={navRef}
    >
      <ul>{SidenavLayer(wikiTree, "/wiki", currentPath)}</ul>
      {children}
    </nav>
  );
}
