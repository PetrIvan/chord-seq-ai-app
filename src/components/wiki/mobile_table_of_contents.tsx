"use client";

import { motion } from "framer-motion";
import { useState } from "react";

import TableOfContents from "./table_of_contents";
import { getHeadings } from "@/wiki/utils";

interface Props {
  source: string;
}

export default function MobileTableOfContents({ source }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsOpen(!isOpen);
  };

  return (
    getHeadings(source).length > 0 && (
      <div className="lg:hidden">
        <div
          className={`bg-zinc-900 rounded-md mb-4 p-2 px-4 ${
            isOpen ? "[&>div>svg]:-rotate-90" : ""
          }`}
        >
          <div
            className="flex items-center justify-between cursor-pointer"
            onClick={handleToggle}
          >
            On this page
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
            initial={{ height: isOpen ? "auto" : 0 }}
            animate={{ height: isOpen ? "auto" : 0 }}
            transition={{ height: { duration: 0.4, ease: "easeInOut" } }}
            style={{ overflow: "hidden" }}
          >
            <TableOfContents
              headings={getHeadings(source)}
              activeId={""} // Mobile TOC doesn't need highlighting, because it is not sticky
              className="pt-2"
            />
          </motion.div>
        </div>
      </div>
    )
  );
}
