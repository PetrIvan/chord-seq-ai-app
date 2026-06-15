// Copies onnxruntime-web's WebAssembly runtime files into public/wasm so they
// are served as static assets (and end up in the static export `out/`).
//
// ORT loads two things from `ort.env.wasm.wasmPaths` (= `/wasm/`, see
// src/models/onnx_worker.ts): the `.wasm` binaries AND their sibling
// `ort-wasm-simd-threaded.*.mjs` loader modules, which it `import()`s
// dynamically at runtime. Both must be present or `initWasm()` fails with
// "no available backend found". We deliberately do NOT copy the `ort.*.mjs`
// SDK bundles here — those are the package entry points and are bundled by
// webpack, not fetched from `/wasm/`.
//
// This replaces the old webpack CopyPlugin step, keeps the files in sync with
// the installed onnxruntime-web version, and works identically in dev and build.
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { mkdirSync, readdirSync, copyFileSync, statSync } from "node:fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const srcDir = join(root, "node_modules", "onnxruntime-web", "dist");
const destDir = join(root, "public", "wasm");

mkdirSync(destDir, { recursive: true });

// The wasm binaries plus their dynamically-imported loader modules. They share
// the `ort-wasm-simd-threaded` prefix, which excludes the `ort.*.mjs` bundles.
const runtimeFiles = readdirSync(srcDir).filter(
  (f) =>
    f.startsWith("ort-wasm-simd-threaded") &&
    (f.endsWith(".wasm") || f.endsWith(".mjs")),
);

if (runtimeFiles.length === 0) {
  console.error(
    "[copy-ort-wasm] No ort-wasm-simd-threaded.{wasm,mjs} files found in " +
      "onnxruntime-web/dist. Is the package installed?",
  );
  process.exit(1);
}

let copied = 0;
let totalBytes = 0;

for (const file of runtimeFiles) {
  const src = join(srcDir, file);
  const dest = join(destDir, file);
  const srcStat = statSync(src);
  totalBytes += srcStat.size;

  // Skip files that are already up to date (these binaries are large, and this
  // script runs on every dev/build start). A size match plus a destination
  // mtime no older than the source means the copy is current; reinstalling a
  // newer onnxruntime-web gives the source a later mtime (and usually a
  // different size), which fails this check and triggers a re-copy.
  let destStat;
  try {
    destStat = statSync(dest);
  } catch {
    destStat = null;
  }
  if (
    destStat &&
    destStat.size === srcStat.size &&
    destStat.mtimeMs >= srcStat.mtimeMs
  ) {
    continue;
  }

  copyFileSync(src, dest);
  copied++;
}

const totalMB = (totalBytes / 1024 / 1024).toFixed(1);

console.log(
  `[copy-ort-wasm] ${copied}/${runtimeFiles.length} runtime file(s) updated ` +
    `(${totalMB} MB total) -> public/wasm`,
);
