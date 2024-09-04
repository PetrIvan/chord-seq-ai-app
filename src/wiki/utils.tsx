import { wikiTree, WikiTreeNode } from "@/data/wiki_tree.ts";

type Heading = {
  id: string;
  title: string;
  level: number;
};

export function getHeadings(source: string) {
  // Get h2 and h3 headings from the markdown source
  const headingLines = source.split("\n").filter((line) => {
    return line.match(/^###?\s/);
  });

  // Transform the string '## Some text' into an object
  let headings: Heading[] = headingLines.map((raw) => {
    const text = raw.replace(/^###?\s/, "");
    const level = raw.startsWith("###") ? 3 : 2;

    // Convert the text to an ID
    const id = text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "") // Remove special characters
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/-+/g, "-"); // Ensure no multiple hyphens

    // Since we're using h2 and h3, we need to adjust the level
    return { id, title: text, level: level - 2 };
  });

  return headings;
}

export function findPageNameInTree(path: string, tree?: WikiTreeNode) {
  // Get the page name from the wiki tree (if it exists)
  let parts = path
    .split("/")
    .filter(Boolean)
    .filter((key) => key !== "wiki");
  let current = tree || wikiTree;

  for (const part of parts.slice(0, -1)) {
    if (!current[part]) return null;

    if (current[part].children) {
      current = current[part].children;
    } else {
      return current[part].name;
    }
  }

  return current[parts[parts.length - 1]]?.name || null;
}

// Find next and previous siblings in the tree (if there are any)
export function findSiblings(path: string, tree?: WikiTreeNode) {
  const parts = path.split("/").filter(Boolean);
  let parents = [];

  // Find the parent nodes of the current path
  let current = tree || wikiTree;
  for (const part of parts) {
    if (!current[part]) return null;

    parents.push(current);
    if (current[part].children) current = current[part].children;
  }

  // Find the next and previous leaf nodes
  let previous = "";
  let next = "";
  for (let i = parents.length - 1; i >= 0; i--) {
    const parent = parents[i];
    const keys = Object.keys(parent);
    const index = keys.indexOf(parts[i]);

    // If previous or next is a parent node, find the last/first leaf node
    if (index > 0 && !previous) {
      let previousParent = parent[keys[index - 1]].children;
      // Initialize previous as the path up to this parent node
      previous = parts.slice(0, i).join("/") + "/" + keys[index - 1];
      // Iterate through the parent node to find the last leaf node
      while (previousParent) {
        const lastKey = Object.keys(previousParent).slice(-1)[0];
        previousParent = previousParent[lastKey].children;
        if (typeof lastKey === "string") previous += `/${lastKey}`;
      }
    }
    if (index < keys.length - 1 && !next) {
      let nextParent = parent[keys[index + 1]].children;
      // Initialize next as the path up to this parent node
      next = parts.slice(0, i).join("/") + "/" + keys[index + 1];
      // Iterate through the parent node to find the first leaf node
      while (nextParent) {
        const firstKey = Object.keys(nextParent)[0];
        nextParent = nextParent[firstKey].children;
        if (typeof firstKey === "string") next += `/${firstKey}`;
      }
    }

    if (previous && next) break;
  }

  // Add "/" to the beginning of the path if it does not start with it
  if (previous && !previous.startsWith("/")) previous = "/" + previous;
  if (next && !next.startsWith("/")) next = "/" + next;

  return [previous, next];
}
