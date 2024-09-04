import Link from "next/link";

import { findSiblings, findPageNameInTree } from "@/wiki/utils";

interface Props {
  pagePath: string;
}

export default function NavigationButtons({ pagePath }: Props) {
  // Get the previous and next siblings of the current page
  const siblings = findSiblings(pagePath);
  const previous = siblings ? siblings[0] : null;
  const next = siblings ? siblings[1] : null;

  let previousTitle = "Home";
  if (previous) previousTitle = findPageNameInTree(previous) || "Home";

  let nextTitle = "Home";
  if (next) nextTitle = findPageNameInTree(next) || "Home";

  return (
    <div className="w-full flex flex-row justify-between pt-8 text-zinc-300 font-semibold">
      <Link
        className="flex flex-row items-center justify-start hover:text-zinc-50 w-1/2"
        href={previous ? `/wiki${previous}` : "/wiki"}
      >
        <svg
          className="w-3 h-3 inline-block mr-2 transform rotate-180"
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
        <p className="truncate max-w-full inline-block">{previousTitle}</p>
      </Link>
      <Link
        className="flex flex-row items-center justify-end hover:text-zinc-50 w-1/2"
        href={next ? `/wiki${next}` : "/wiki"}
      >
        <p className="truncate max-w-full inline-block">{nextTitle}</p>
        <svg
          className="w-3 h-3 inline-block ml-2"
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
      </Link>
    </div>
  );
}
