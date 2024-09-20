import type { MDXComponents } from "mdx/types";
import Link from "next/link";
import Image from "next/image";
import React from "react";

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

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: (props) => (
      <h1
        {...props}
        className="text-left text-3xl font-semibold text-zinc-50"
      />
    ),
    h2: (props) => (
      <h2
        {...props}
        className="group scroll-mt-[7rem] pt-2 text-left text-2xl font-semibold text-zinc-50 lg:scroll-mt-[4rem]"
      >
        {HeadingContent(props)}
      </h2>
    ),
    h3: (props) => (
      <h3
        {...props}
        className="group scroll-mt-[7rem] pt-2 text-left text-xl font-semibold text-zinc-50 lg:scroll-mt-[4rem]"
      >
        {HeadingContent(props)}
      </h3>
    ),
    h4: (props) => (
      <h4
        {...props}
        className="group scroll-mt-[7rem] pt-2 text-left text-lg font-semibold text-zinc-50 lg:scroll-mt-[4rem]"
      >
        {HeadingContent(props)}
      </h4>
    ),
    h5: (props) => (
      <h5
        {...props}
        className="group scroll-mt-[7rem] pt-2 text-left text-base font-semibold text-zinc-50 lg:scroll-mt-[4rem]"
      >
        {HeadingContent(props)}
      </h5>
    ),
    h6: (props) => (
      <h6
        {...props}
        className="group scroll-mt-[7rem] pt-2 text-left text-base font-medium text-zinc-50 lg:scroll-mt-[4rem]"
      >
        {HeadingContent(props)}
      </h6>
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
      <div className="custom-scrollbar overflow-x-auto py-2">
        <table
          {...props}
          className="table-auto border-collapse whitespace-nowrap"
        />
      </div>
    ),
    th: (props) => (
      <th
        {...props}
        className="bg-zinc-850 p-2 font-semibold first:rounded-tl-md last:rounded-tr-md"
      />
    ),
    tr: (props) => (
      <tr
        {...props}
        className="bg-zinc-850 odd:bg-zinc-900 last:[&>td]:last:rounded-br-md first:[&>td]:last:rounded-bl-md"
      />
    ),
    td: (props) => <td {...props} className="p-2" />,
    code: (props) => (
      <code
        {...props}
        className="rounded-md bg-zinc-800 px-1 font-mono text-base text-zinc-50"
        style={{
          wordBreak: "keep-all", // Prevents breaking within words
          whiteSpace: "normal", // Allows text wrapping
        }}
      >
        {typeof props.children === "string"
          ? props.children.replace(/\//g, "/\u200B").replace(/_/g, "_\u200B") // Allows breaking long strings
          : props.children}
      </code>
    ),
    img: (props) => (
      <Image
        src={props.src as string}
        className="rounded-lg"
        layout="responsive"
        alt={props.alt as string}
        width={16}
        height={9}
      />
    ),
    ...components,
  };
}
