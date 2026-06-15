// Serwist's Turbopack route serves the compiled service worker from
// /serwist/sw.js and relies on a `Service-Worker-Allowed: /` response header to
// grant it root scope. GitHub Pages serves static files only and cannot set
// that header, so a worker at /serwist/sw.js would be capped to /serwist/ scope
// and never control the app. Copying it to the site root makes its default
// scope `/` with no header required, which is what static hosting needs.
import { copyFileSync, existsSync } from "node:fs";

const src = "out/serwist/sw.js";
const dest = "out/sw.js";

if (!existsSync(src)) {
  console.error(`[copy-sw] ${src} not found - did 'next build' run?`);
  process.exit(1);
}

copyFileSync(src, dest);
console.log(`[copy-sw] ${src} -> ${dest}`);
