import { createSerwistRoute } from "@serwist/turbopack";

// Serwist's Turbopack integration serves the compiled service worker through a
// force-static route handler. With `output: "export"` Next prerenders the
// generateStaticParams paths (e.g. /serwist/sw.js) to plain files in out/, so
// no Node runtime is needed at serve time. Replaces the old @serwist/next
// webpack plugin, letting `next build` run on Turbopack (no --webpack).
export const { dynamic, dynamicParams, revalidate, generateStaticParams, GET } =
  createSerwistRoute({
    swSrc: "src/app/sw.ts",
    useNativeEsbuild: true,
  });
