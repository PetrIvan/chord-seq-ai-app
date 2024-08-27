import React, { useState, useEffect, useRef } from "react";
import { useSearch } from "@/wiki/use_search";

import Link from "next/link";
import Image from "next/image";

interface Props extends React.HTMLAttributes<HTMLElement> {
  customScrollbarEnabled: boolean;
  className?: string;
  isOverlay?: boolean;
  setIsSearchOpen?: (value: boolean) => void;
  shouldFocus?: boolean;
}

export default function Search({
  customScrollbarEnabled,
  className,
  isOverlay,
  setIsSearchOpen,
  shouldFocus,
  ...props
}: Props) {
  const [query, setQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const results = useSearch(query);

  // Handle click outside of the dropdown (to close it)
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = (e: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(e.target as Node)
    ) {
      setIsDropdownOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Auto-focus the input when the dropdown is opened
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (shouldFocus) inputRef.current?.focus();
  }, [shouldFocus]);

  return (
    <div
      className={
        "relative flex flex-col items-center justify-center flex-1 max-w-[30rem] mx-2 min-w-0 flex-shrink-1 " +
        className
      }
      ref={dropdownRef}
      {...props}
    >
      <div
        className={`relative flex items-center justify-center w-full p-2 px-3 bg-zinc-900 box-border border-zinc-800 rounded-full min-w-0 ${
          isOverlay ? "" : "border"
        }`}
      >
        <Image
          className="w-5 h-5 mr-2"
          src="/search.svg"
          alt="Search icon"
          width={100}
          height={100}
        />
        <input
          className="flex-1 w-full h-5 p-0 bg-zinc-900 text-white placeholder-zinc-500 placeholder-opacity-50 border-transparent focus:border-transparent focus:ring-0"
          type="text"
          placeholder="Search..."
          id={`search${isOverlay ? "-overlay" : ""}`}
          autoComplete="off"
          value={query}
          onFocus={() => {
            if (!isDropdownOpen && query.trim() !== "") setIsDropdownOpen(true);
          }}
          onChange={(e) => {
            // Open the dropdown if the input is not empty
            setIsDropdownOpen(e.target.value.trim() !== "");
            setQuery(e.target.value);
          }}
          ref={inputRef}
        />
      </div>
      {results.length > 0 && isDropdownOpen && (
        <>
          {isOverlay && <div className="w-full h-[1px] bg-zinc-800" />}
          <div
            className={`max-h-fit overflow-y-auto top-[100%] w-full ${
              isOverlay ? "" : "pt-2 absolute"
            } ${customScrollbarEnabled ? "custom-scrollbar" : ""}`}
          >
            <ul
              className={`w-full flex flex-col items-center justify-center bg-zinc-900 border-zinc-800 rounded-xl ${
                isOverlay ? "" : "border"
              }`}
            >
              {results.map((result) => (
                <li
                  className={`w-full overflow-hidden hover:bg-zinc-800 last:rounded-b-xl ${
                    isOverlay ? "" : "first:rounded-t-xl"
                  }`}
                  key={result.slug}
                >
                  <Link
                    className="w-full whitespace-nowrap line-clamp-1 p-2 px-4"
                    href={`/wiki/${result.slug}`}
                    onClick={() => {
                      setIsDropdownOpen(false);
                      if (isOverlay && setIsSearchOpen) setIsSearchOpen(false);
                    }}
                  >
                    <p className="truncate min-w-0 overflow-hidden text-zinc-500">
                      <span className="text-zinc-300">
                        <span className="font-semibold inline-block">
                          {result.title}
                        </span>
                        : {result.heading}
                      </span>{" "}
                      - {result.summary}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
