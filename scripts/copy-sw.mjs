// Serwist's Turbopack route serves the compiled service worker from
// /serwist/sw.js and relies on a `Service-Worker-Allowed: /` response header to
// grant it root scope. GitHub Pages serves static files only and cannot set
// that header, so a worker at /serwist/sw.js would be capped to /serwist/ scope
// and never control the app. Copying it to the site root makes its default
// scope `/` with no header required, which is what static hosting needs.
import { copyFileSync, existsSync } from "node:fs";

const src = "out/serwist/sw.js";
if (!existsSync(src)) {
  console.error(`[copy-sw] ${src} not found - did 'next build' export to out/?`);
  process.exit(1);
}

copyFileSync(src, "out/sw.js");
console.log(`[copy-sw] ${src} -> out/sw.js`);

// The worker ends with sourceMappingURL=sw.js.map, which resolves to /sw.js.map
// once served from the root, so copy the map alongside it to avoid a 404. A
// missing map is not fatal - it only affects debugging.
const mapSrc = "out/serwist/sw.js.map";
if (existsSync(mapSrc)) {
  copyFileSync(mapSrc, "out/sw.js.map");
  console.log(`[copy-sw] ${mapSrc} -> out/sw.js.map`);
}
