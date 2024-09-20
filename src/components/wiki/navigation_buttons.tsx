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
    <div className="flex w-full flex-row justify-between pt-8 font-semibold text-zinc-300">
      <Link
        className="flex w-1/2 flex-row items-center justify-start hover:text-zinc-50"
        href={previous ? `/wiki${previous}` : "/wiki"}
      >
        <svg
          className="mr-2 inline-block h-3 w-3 rotate-180 transform"
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
        <p className="inline-block max-w-full truncate">{previousTitle}</p>
      </Link>
      <Link
        className="flex w-1/2 flex-row items-center justify-end hover:text-zinc-50"
        href={next ? `/wiki${next}` : "/wiki"}
      >
        <p className="inline-block max-w-full truncate">{nextTitle}</p>
        <svg
          className="ml-2 inline-block h-3 w-3"
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
