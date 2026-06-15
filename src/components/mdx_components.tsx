import type { MDXComponents } from "mdx/types";
import Link from "next/link";
import Image from "next/image";
import React from "react";

import Blocks from "@/components/wiki/blocks";
import InlineIcon from "@/components/wiki/inline_icon";
import LargeImage from "@/components/wiki/large_image";
import QuestionAnswer from "@/components/wiki/question_answer";
import QuickLinkBlock from "@/components/wiki/quick_link_block";

// Hover hashtag deep-link anchor rendered next to every wiki section heading
// (h2-h6). The whole heading is wrapped in the link so clicking it jumps to the
// section.
function HeadingContent(
  props: React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLHeadingElement>,
    HTMLHeadingElement
  >,
) {
  return (
    <Link href={`#${props.id}`} className="relative">
      <div className="absolute right-[100%] top-1/2 mr-2 hidden h-6 w-6 -translate-y-1/2 transform items-center justify-center rounded-md bg-zinc-800 opacity-0 transition-opacity duration-200 group-hover:opacity-75 lg:flex">
        <Image
          src="/hashtag.svg"
          alt="Direct link to title"
          title={`Direct link to ${props.children}`}
          width={100}
          height={100}
          className="h-[0.8rem] w-[0.8rem]"
        />
      </div>

      {props.children}
    </Link>
  );
}

// Plain function (not a `use*` hook) so it can be called from the async server
// component that renders the wiki pages, where React hooks are not allowed.
export function getMdxComponents(): MDXComponents {
  return {
    h1: (props: any) => (
      <h1 {...props} className="text-left text-3xl font-semibold text-zinc-50" />
    ),
    h2: (props: any) => (
      <h2
        {...props}
        className="group scroll-mt-[7rem] pt-2 text-left text-2xl font-semibold text-zinc-50 lg:scroll-mt-[4rem]"
      >
        {HeadingContent(props)}
      </h2>
    ),
    h3: (props: any) => (
      <h3
        {...props}
        className="group scroll-mt-[7rem] pt-2 text-left text-xl font-semibold text-zinc-50 lg:scroll-mt-[4rem]"
      >
        {HeadingContent(props)}
      </h3>
    ),
    h4: (props: any) => (
      <h4
        {...props}
        className="group scroll-mt-[7rem] pt-2 text-left text-lg font-semibold text-zinc-50 lg:scroll-mt-[4rem]"
      >
        {HeadingContent(props)}
      </h4>
    ),
    h5: (props: any) => (
      <h5
        {...props}
        className="group scroll-mt-[7rem] pt-2 text-left text-base font-semibold text-zinc-50 lg:scroll-mt-[4rem]"
      >
        {HeadingContent(props)}
      </h5>
    ),
    h6: (props: any) => (
      <h6
        {...props}
        className="group scroll-mt-[7rem] pt-2 text-left text-base font-medium text-zinc-50 lg:scroll-mt-[4rem]"
      >
        {HeadingContent(props)}
      </h6>
    ),
    a: ({ href, children, ...props }: any) => {
      const isInternalLink =
        href &&
        (href.startsWith("/") ||
          href.startsWith("#") ||
          !href.startsWith("http"));

      // Internal links use next/link for client-side navigation (instant routing
      // with the top progress bar); external links are plain anchors opened in a
      // new tab.
      if (isInternalLink) {
        return (
          <Link className="text-blue-400 hover:underline" href={href} {...props}>
            {children}
          </Link>
        );
      }

      return (
        <a
          className="text-blue-400 hover:underline"
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          {...props}
        >
          {children}
        </a>
      );
    },
    ul: (props: any) => <ul {...props} className="list-disc pl-4" />,
    ol: (props: any) => <ol {...props} className="list-decimal pl-4" />,
    li: (props: any) => <li {...props} />,
    table: (props: any) => (
      <div className="custom-scrollbar overflow-x-auto py-2">
        <table
          {...props}
          className="table-auto border-collapse whitespace-nowrap"
        />
      </div>
    ),
    th: (props: any) => (
      <th
        {...props}
        className="bg-zinc-850 p-2 font-semibold first:rounded-tl-md last:rounded-tr-md"
      />
    ),
    tr: (props: any) => (
      <tr
        {...props}
        className="bg-zinc-850 odd:bg-zinc-900 last:[&>td]:last:rounded-br-md first:[&>td]:last:rounded-bl-md"
      />
    ),
    td: (props: any) => <td {...props} className="p-2" />,
    code: (props: any) => (
      <code
        {...props}
        className="rounded-md bg-zinc-800 px-1 font-mono text-base text-zinc-50"
        style={{
          wordBreak: "keep-all",
          whiteSpace: "normal",
        }}
      >
        {typeof props.children === "string"
          ? props.children.replace(/\//g, "/​").replace(/_/g, "_​")
          : props.children}
      </code>
    ),
    img: (props: any) => (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={props.src as string}
        className="rounded-lg"
        alt={props.alt as string}
      />
    ),
    Blocks,
    InlineIcon,
    LargeImage,
    QuestionAnswer,
    QuickLinkBlock,
  };
}
