import type { NextConfig } from "next";
import createMDX from "@next/mdx";
import { withSerwist } from "@serwist/turbopack";

const withMDX = createMDX({
  extension: /\.mdx?$/,
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Static export to GitHub Pages. All SEO routes (/, /wiki/*, sitemap) are
  // prerendered to static HTML at build time; /app is client-only.
  output: "export",
  images: {
    unoptimized: true,
  },
  pageExtensions: ["js", "jsx", "ts", "tsx", "md", "mdx"],
};

export default withSerwist(withMDX(nextConfig));
