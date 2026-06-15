// Serwist's Turbopack route serves the compiled service worker from
// /serwist/sw.js and relies on a `Service-Worker-Allowed: /` response header to
// grant it root scope. GitHub Pages serves static files only and cannot set
// that header, so a worker at /serwist/sw.js would be capped to /serwist/ scope
// and never control the app. Copying it to the site root makes its default
// scope `/` with no header required, which is what static hosting needs.
import { copyFileSync, existsSync, readdirSync } from "node:fs";

// `next build` with `output: "export"` is meant to write the route handler
// output to out/serwist/sw.js, but that export step is unreliable across
// platforms: it lands on disk locally (Windows) yet is silently missing in CI
// (Linux), with the same Next and Node versions. The compiled body is always
// written to .next/server/app/serwist/<param>.body during the build, before and
// independent of the export phase, and is byte-identical to the exported file.
// Fall back to it so the root copy is produced in either environment.
function firstExisting(candidates) {
  return candidates.find((p) => existsSync(p));
}

const swSrc = firstExisting([
  "out/serwist/sw.js",
  ".next/server/app/serwist/sw.js.body",
]);

if (!swSrc) {
  console.error("[copy-sw] service worker not found - did 'next build' run?");
  for (const dir of ["out/serwist", ".next/server/app/serwist"]) {
    if (existsSync(dir)) {
      console.error(`[copy-sw]   ${dir}: ${readdirSync(dir).join(", ")}`);
    }
  }
  process.exit(1);
}

copyFileSync(swSrc, "out/sw.js");
console.log(`[copy-sw] ${swSrc} -> out/sw.js`);

// The worker ends with sourceMappingURL=sw.js.map, which resolves to /sw.js.map
// once served from the root, so copy the map alongside it to avoid a 404. A
// missing map is not fatal - it only affects debugging.
const mapSrc = firstExisting([
  "out/serwist/sw.js.map",
  ".next/server/app/serwist/sw.js.map.body",
]);

if (mapSrc) {
  copyFileSync(mapSrc, "out/sw.js.map");
  console.log(`[copy-sw] ${mapSrc} -> out/sw.js.map`);
} else {
  console.warn("[copy-sw] sw.js.map not found, skipping (non-fatal)");
}
