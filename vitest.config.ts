import { defineConfig } from "vitest/config";

// Unit/integration tests run under Vitest. Playwright e2e specs live in e2e/ and
// are run separately (npm run test:e2e), so they are excluded here to keep the
// two runners from picking up each other's files.
export default defineConfig({
  // Resolve the "@/..." path alias from tsconfig.json (Vite 8+ native support).
  resolve: { tsconfigPaths: true },
  test: {
    environment: "jsdom",
    globals: true,
    include: ["src/**/*.test.{ts,tsx}"],
    exclude: ["e2e/**", "node_modules/**"],
    coverage: {
      provider: "v8",
      include: [
        "src/playback/**",
        "src/state/**",
        "src/data/transposition_map.ts",
      ],
      exclude: ["**/*.test.{ts,tsx}"],
    },
  },
});
