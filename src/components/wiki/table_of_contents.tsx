import Link from "next/link";

type Heading = {
  id: string;
  title: string;
  level: number;
};

interface Props {
  headings: Heading[];
  activeId: string;
  className?: string;
}

export default function TableOfContents({
  headings,
  activeId,
  className,
}: Props) {
  return (
    <ul className={"h-full flex-col space-y-1 lg:overflow-y-auto " + className}>
      {headings.map((heading) => (
        <li key={heading.id}>
          <Link
            className={`inline-block w-full truncate transition-all duration-200 hover:pl-1 hover:text-zinc-50 ${
              activeId === heading.id ? "font-semibold text-zinc-50" : ""
            }`}
            href={`#${heading.id}`}
            style={{ marginLeft: `${heading.level}rem` }}
          >
            {heading.title}
          </Link>
        </li>
      ))}
    </ul>
  );
}
