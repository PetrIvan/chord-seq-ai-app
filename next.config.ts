import type { NextConfig } from "next";
import createMDX from "@next/mdx";
import withSerwistInit from "@serwist/next";

const withMDX = createMDX({
  extension: /\.mdx?$/,
});

const withSerwist = withSerwistInit({
  // Service worker source + generated output (served from public/, ends up in out/).
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  cacheOnNavigation: true,
  reloadOnOnline: true,
  // Disabled in dev because Turbopack (the dev bundler) does not run Serwist's
  // webpack plugin; the SW is generated and active in production builds only.
  disable: process.env.NODE_ENV === "development",
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
