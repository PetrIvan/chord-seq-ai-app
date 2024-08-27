import TableOfContents from "./table_of_contents";
import { getHeadings } from "@/wiki/utils";

interface Props {
  source: string;
  detailsOpen: boolean;
  animationOpen: boolean;
  details: any;
  toggleBox: any;
}

export default function MobileTableOfContents({
  source,
  detailsOpen,
  animationOpen,
  details,
  toggleBox,
}: Props) {
  return (
    getHeadings(source).length > 0 && (
      <div className="lg:hidden">
        <details
          className={`bg-zinc-900 rounded-md mb-4 p-2 px-4 ${
            animationOpen
              ? "[&>ul]:animate-details-open [&>summary>svg]:-rotate-90"
              : "[&>ul]:animate-details-close"
          }`}
          open={detailsOpen}
          ref={details}
        >
          <summary
            className="flex items-center justify-between cursor-pointer"
            ref={toggleBox}
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
          </summary>

          <TableOfContents
            headings={getHeadings(source)}
            activeId={""} // Mobile TOC doesn't need highlighting, because it is not sticky
            className="pt-2"
          />
        </details>
      </div>
    )
  );
}
