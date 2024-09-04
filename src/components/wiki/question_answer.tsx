"use client";

import { motion } from "framer-motion";
import { useState } from "react";

interface Props {
  question: string;
  children: React.ReactNode;
}

export default function QuestionAnswer({ question, children }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsOpen(!isOpen);
  };

  return (
    <div
      className={`bg-zinc-900 rounded-md p-2 px-4 ${
        isOpen ? "[&>div>svg]:-rotate-90" : ""
      }`}
    >
      <div
        className="flex items-center justify-between cursor-pointer font-medium text-left text-lg text-zinc-50"
        onClick={handleToggle}
      >
        {question}

        {/* Arrow SVG */}
        <svg
          className="text-zinc-400 ml-5 w-4 h-4 inline-block transform rotate-90 transition-transform duration-200"
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

      {/* Animated container for the answer */}
      <motion.div
        initial={{ height: isOpen ? "auto" : 0 }}
        animate={{ height: isOpen ? "auto" : 0 }}
        transition={{ height: { duration: 0.4, ease: "easeInOut" } }}
        style={{ overflow: "hidden" }}
      >
        <div className="text-justify">{children}</div>
      </motion.div>
    </div>
  );
}
