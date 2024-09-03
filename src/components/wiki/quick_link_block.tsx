import Link from "next/link";

interface Props {
  href: string;
  title: string;
  description: string;
}

export default function QuickLinkBlock({ href, title, description }: Props) {
  const isInternalLink =
    href &&
    (href.startsWith("/") || href.startsWith("#") || !href.startsWith("http"));

  return (
    <Link
      className="text-zinc-50 rounded-md p-3 bg-zinc-900 hover:bg-zinc-800"
      href={href}
      target={isInternalLink ? undefined : "_blank"}
      rel={isInternalLink ? undefined : "noopener noreferrer"}
    >
      <p className="font-semibold text-left">{title}</p>
      <p className="text-sm text-zinc-300">{description}</p>
    </Link>
  );
}
