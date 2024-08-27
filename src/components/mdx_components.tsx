import type { MDXComponents } from "mdx/types";
import Link from "next/link";
import React from "react";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: (props) => (
      <h1 {...props} className="font-semibold text-3xl text-zinc-50" />
    ),
    h2: (props) => (
      <h2
        {...props}
        className="font-semibold text-2xl text-zinc-50 pt-2 scroll-mt-[7rem] lg:scroll-mt-[4rem]"
      />
    ),
    h3: (props) => (
      <h3
        {...props}
        className="font-semibold text-xl text-zinc-50 pt-2 scroll-mt-[7rem] lg:scroll-mt-[4rem]"
      />
    ),
    h4: (props) => (
      <h4
        {...props}
        className="font-semibold text-lg text-zinc-50 pt-2 scroll-mt-[7rem] lg:scroll-mt-[4rem]"
      />
    ),
    h5: (props) => (
      <h5
        {...props}
        className="font-semibold text-base text-zinc-50 pt-2 scroll-mt-[7rem] lg:scroll-mt-[4rem]"
      />
    ),
    h6: (props) => (
      <h6
        {...props}
        className="font-medium text-base text-zinc-50 pt-2 scroll-mt-[7rem] lg:scroll-mt-[4rem]"
      />
    ),
    a: ({
      href,
      children,
      ...props
    }: {
      href?: string;
      children?: React.ReactNode;
    }) => {
      const isInternalLink =
        href &&
        (href.startsWith("/") ||
          href.startsWith("#") ||
          !href.startsWith("http"));

      return (
        <Link
          className="text-blue-400 hover:underline"
          href={href as string}
          target={isInternalLink ? undefined : "_blank"}
          rel={isInternalLink ? undefined : "noopener noreferrer"}
          {...props}
        >
          {children}
        </Link>
      );
    },
    ul: (props) => <ul {...props} className="list-disc pl-4" />,
    ol: (props) => <ol {...props} className="list-decimal pl-4" />,
    li: (props) => <li {...props} />,
    table: (props) => (
      <div className="overflow-x-auto py-2 custom-scrollbar">
        <table
          {...props}
          className="table-auto border-collapse whitespace-nowrap"
        />
      </div>
    ),
    th: (props) => (
      <th
        {...props}
        className="bg-zinc-850 font-semibold p-2 first:rounded-tl-md last:rounded-tr-md"
      />
    ),
    tr: (props) => (
      <tr
        {...props}
        className="bg-zinc-850 odd:bg-zinc-900 first:[&>td]:last:rounded-bl-md last:[&>td]:last:rounded-br-md"
      />
    ),
    td: (props) => <td {...props} className="p-2" />,
    ...components,
  };
}
