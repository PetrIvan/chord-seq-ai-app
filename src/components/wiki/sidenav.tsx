"use client";

import Link from "next/link";
import { useState, useLayoutEffect, useRef } from "react";
import { motion } from "framer-motion";

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
      ? "font-semibold text-zinc-50 grid"
      : "hover:text-zinc-50 grid";
  const borderClass = `h-full absolute top-0 -left-2 w-full cursor-pointer transition-colors duration-200 ${
    currentPath === fullPath ? "border-zinc-600" : ""
  } ${
    fullPath.split("/").length > 3
      ? " border-l border-zinc-800 hover:border-zinc-600"
      : ""
  }`;

  return disableInteraction ? (
    <div className={wrapperClass}>
      {title}
      <div className={borderClass} style={{ gridArea: "1 / 1 / 2 / 2" }} />
    </div>
  ) : (
    <Link className={wrapperClass} href={fullPath}>
      {title}
      <div className={borderClass} style={{ gridArea: "1 / 1 / 2 / 2" }} />
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

  const [isOpen, setIsOpen] = useState(wikiSidenavOpen.get(fullPath) ?? true);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();

    wikiSidenavOpen.set(fullPath, !isOpen);
    setWikiSidenavOpen(wikiSidenavOpen);

    setIsOpen(!isOpen);
  };

  return (
    <div className={`${isOpen ? "[&>div>svg]:-rotate-90" : ""}`}>
      <div
        className="pb-2 flex items-center justify-between cursor-pointer"
        onClick={handleToggle}
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
      </div>

      {/* Animated container for the list */}
      <motion.div
        key={fullPath}
        initial={{ height: isOpen ? "auto" : 0 }}
        animate={{ height: isOpen ? "auto" : 0 }}
        transition={{ height: { duration: 0.4, ease: "easeInOut" } }}
        style={{ overflow: "hidden" }}
      >
        <ul className="pl-4">{SidenavLayer(value, fullPath, currentPath)}</ul>
      </motion.div>
    </div>
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

interface Props {
  currentPath: string;
  customScrollbarEnabled: boolean;
  animate?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export default function Sidenav({
  currentPath,
  customScrollbarEnabled,
  animate,
  className,
  children,
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
    <motion.nav
      initial={{ x: animate ? "-16rem" : 0 }}
      animate={{ x: 0 }}
      exit={{ x: animate ? "-16rem" : 0 }}
      transition={{ x: { duration: 0.4, ease: "easeInOut" } }}
      className={
        "fixed top-0 inset-0 w-64 shrink-0 p-4 overflow-y-auto border-r border-zinc-800 " +
        className +
        (customScrollbarEnabled ? " custom-scrollbar" : "")
      }
      ref={navRef}
    >
      <ul>{SidenavLayer(wikiTree, "/wiki", currentPath)}</ul>
      {children}
    </motion.nav>
  );
}
