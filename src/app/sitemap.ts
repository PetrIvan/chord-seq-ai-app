import type { MetadataRoute } from "next";
import { wikiTree, WikiTreeNode } from "@/data/wiki_tree";

// Get all the leaf nodes and their slug paths
function getWikiPaths(tree: WikiTreeNode, parentPath = ""): string[] {
  const paths: string[] = [];
  for (const key in tree) {
    const path = `${parentPath}/${key}`;
    if (tree[key].children) {
      paths.push(...getWikiPaths(tree[key].children, path));
    } else {
      paths.push(path);
    }
  }
  return paths;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = getWikiPaths(wikiTree);

  const wikiSitemap: MetadataRoute.Sitemap = paths.map((path) => ({
    url: `https://chordseqai.com/wiki${path}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  return [
    {
      url: "https://chordseqai.com/",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: "https://chordseqai.com/app",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: "https://chordseqai.com/wiki",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    ...wikiSitemap,
  ];
}
