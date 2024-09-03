import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from 'remark';
import strip from 'strip-markdown';
import { readFile } from 'fs/promises';

const wikiTree = JSON.parse(
  await readFile(
    new URL('../data/wiki_tree.json', import.meta.url)
  )
);

const wikiDirectory = path.join(process.cwd(), "src/content/wiki");

function getAllMdxFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);

    if (fs.statSync(fullPath).isDirectory()) {
      // Recursively get files from subdirectories
      getAllMdxFiles(fullPath, arrayOfFiles);
    } else if (file.endsWith(".mdx")) {
      // Add MDX files to the array
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
}

async function extractPlainTextFromMDX(mdxContent) {
  // Process the MDX content with remark and strip-markdown
  const processedContent = await remark()
    .use(strip)
    .process(mdxContent);

  return processedContent.toString();
};

async function buildSearchIndex() {
  const mdxFiles = getAllMdxFiles(wikiDirectory);

  const index = [];
  const generatedTree = {};

  for (const file of mdxFiles) {
    const content = fs.readFileSync(file, "utf8");
    const { data, content: mdxContent } = matter(content);

    // Remove MDX-specific characters from the content
    // CONTINUE HERE, add something
    const cleanContent = mdxContent
      .replace(/\r/g, " ")
      .trim();

    // Split the MDX content into an array of headings and paragraphs
    const sections = cleanContent
      .split(/(?=^#{1,6} .*$)/m)
      .map((section) => section.trim());

    const title = data.title || path.basename(file, ".mdx");

    // Calculate the relative slug path
    const relativePath = path
      .relative(wikiDirectory, file)
      .replace(/\\/g, "/")
      .replace(".mdx", "");

    // Build the search index entries
    for (const section of sections) {
      const heading = section.match(/^#+ (.+)/)?.[1].trim() || title;
      let summary = await extractPlainTextFromMDX(section.replace(/^#+ .+/, ""));
      summary = summary.replace(/\s+/g, " ").replace(/\n/g, " ").trim();

      // Create a slug from the file path and heading
      let slug = relativePath;
      // Add a heading if not h1
      if (!section.match(/^# /))
        slug += "#" + heading.toLowerCase().replace(/\s+/g, "-");

      index.push({
        slug,
        title,
        heading,
        summary,
      });
    }

    // Build the generated tree
    const parts = relativePath.split("/");
    let current = generatedTree;

    parts.forEach((part, index) => {
      if (!current[part]) {
        current[part] = {
          name: parts.length - 1 === index ? title : part.replace(/-/g, " "),
          children: {},
        };
      }
      if (current[part].children) current = current[part].children;
    });
  }

  // Ensure the predefined tree matches the generated tree
  function compareTrees(
    predefinedNode,
    generatedNode,
    path = ""
  ) {
    for (const key in generatedNode) {
      const predefinedChild = predefinedNode[key];

      // Ensure the predefined tree has the same node
      if (!predefinedChild) {
        throw new Error(
          `Missing node in predefined tree at path: ${path}/${key}`
        );
      }
    }

    for (const key in predefinedNode) {
      const predefinedChild = predefinedNode[key];
      const generatedChild = generatedNode[key];

      // Ensure the generated tree has the same node
      if (!generatedChild) {
        throw new Error(`No MDX files found at path: ${path}/${key}`);
      }

      // Recursively compare child nodes
      if (predefinedChild.children && generatedChild.children) {
        compareTrees(
          predefinedChild.children,
          generatedChild.children,
          `${path}/${key}`
        );
      }
    }
  }

  // Start the comparison
  compareTrees(wikiTree, generatedTree);

  // Write the index to a JSON file
  fs.writeFileSync("public/search-index.json", JSON.stringify(index, null, 2));
}

buildSearchIndex();
