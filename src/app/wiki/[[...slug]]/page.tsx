import fs from "fs";
import path from "path";

import type { Metadata, ResolvingMetadata } from "next";

import { compileMDX } from "next-mdx-remote/rsc";
import { useMDXComponents } from "@/components/mdx_components";

import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";

import { wikiTree, WikiTreeNode } from "@/data/wiki_tree.ts";
import { findPageNameInTree } from "@/wiki/utils";

import NotFound from "@/components/not_found";
import WikiLayout from "@/components/wiki/layout";

interface WikiPageProps {
  params: { slug?: string[] };
}

export default async function WikiPage({ params }: WikiPageProps) {
  let pagePath = `/${(params.slug || []).join("/")}`;
  const components = useMDXComponents({});

  const mdx = await getMDX(params.slug, components);

  if (!mdx || !mdx.content) return <NotFound />;

  return (
    <WikiLayout pagePath={pagePath} source={mdx.source}>
      {mdx.content}
    </WikiLayout>
  );
}

export async function generateMetadata(
  { params }: WikiPageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const mdx = await getMDX(params.slug, {});

  if (!mdx) return { title: "404 - Page Not Found" };

  const pageTitle = (mdx.frontmatter.title as string) + " | ChordSeqAI Wiki";
  const pageDescription = mdx.frontmatter.description as string;

  return {
    metadataBase: new URL("https://chordseqai.com"),
    title: pageTitle,
    description: pageDescription,
    manifest: "/manifest.json",
    icons: { icon: "/icon-512x512.png", apple: "/icon-192x192.png" },
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      images: [{ url: "/og.png" }],
    },
  };
}

// Get all possible paths for the wiki pages
export async function generateStaticParams() {
  const paths: { slug: string[] }[] = [];

  function addPaths(tree: WikiTreeNode, currentPath = "") {
    for (const key in tree) {
      const fullPath = `${currentPath}/${key}`;

      if (tree[key].children) addPaths(tree[key].children, fullPath);
      else paths.push({ slug: fullPath.split("/").filter((x) => x) });
    }
  }

  paths.push({ slug: [] });
  addPaths(wikiTree);

  return paths;
}

/* MDX loading logic */
type MDXData = {
  content: React.ReactElement<any, string | React.JSXElementConstructor<any>>;
  frontmatter: Record<string, any>;
  source: string;
};

async function getMDX(
  slug: string[] | undefined,
  components: any
): Promise<MDXData | null> {
  let pagePath = `/${(slug || []).join("/")}`;

  if (pagePath === "/") {
    pagePath = "";
  } else {
    const page = findPageNameInTree(pagePath);
    if (!page) return null;
  }

  // Load the mdx file from src/content/wiki/${path}.mdx
  let source;
  try {
    source = fs.readFileSync(
      path.join(process.cwd(), "src/content/wiki" + `${pagePath}.mdx`),
      "utf8"
    );
  } catch (error) {
    console.error(error);
    return null;
  }

  const { content, frontmatter } = await compileMDX({
    source,
    options: {
      mdxOptions: {
        rehypePlugins: [rehypeHighlight, rehypeSlug],
        remarkPlugins: [remarkGfm],
      },
      parseFrontmatter: true,
    },
    components,
  });

  return { content, frontmatter, source };
}
