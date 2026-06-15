import { defineConfig, devices } from "@playwright/test";

const isCI = !!process.env.CI;

// Smoke-level e2e: boot the app and assert the core pages render and the basic
// editing/export flow works. Kept intentionally small and resilient to the
// background model/audio downloads, which need WebGPU + network and would make
// deeper flows flaky in CI.
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  reporter: isCI ? "github" : "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  // In CI, serve the real static export (the app ships as `output: "export"`)
  // so smokes exercise the production bundle and never pay per-route dev-server
  // compilation; the CI workflow runs `npm run build` before this. Locally, use
  // the dev server for fast iteration without a build step.
  webServer: {
    command: isCI ? "npm run serve:out" : "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !isCI,
    timeout: 120_000,
  },
});
