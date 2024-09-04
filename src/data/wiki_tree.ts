import wikiTreeJson from "./wiki_tree.json";

export interface WikiTreeNode {
  [key: string]: { children?: WikiTreeNode; name: string };
}

export const wikiTree: WikiTreeNode = wikiTreeJson;
