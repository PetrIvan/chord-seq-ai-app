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
    <ul className={"flex-col space-y-1 " + className}>
      {headings.map((heading) => (
        <li key={heading.id}>
          <Link
            className={`inline-block truncate w-full hover:text-zinc-50 transition-all duration-200 hover:pl-1 ${
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
