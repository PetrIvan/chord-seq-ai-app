import { test, expect } from "@playwright/test";

// These are smoke tests: they confirm the app boots and the core editing/export
// surface works in a real browser. They deliberately avoid the AI model and
// audio rendering (WebGPU + network), which would make them slow and flaky.

// Several overlays auto-open on a fresh visit and would cover the editor: the
// welcome overlay (first visit), the Mozart AI overlay (mozartAIOverlay flag),
// and the new-features overlay (stored version < latest). Seed the persisted
// Zustand state so none of them open, keeping the runs deterministic.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      "state",
      JSON.stringify({
        state: {
          welcomeFirstTime: false,
          mozartAIOverlay: false,
          version: 9999,
        },
        version: 0,
      }),
    );
  });
});

test("landing page renders and links into the app", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", {
      name: "Your AI-powered chord progression copilot",
    }),
  ).toBeVisible();

  const launch = page.getByRole("link", { name: "Launch App" });
  await expect(launch).toHaveAttribute("href", "/app");

  await launch.click();
  await expect(page).toHaveURL(/\/app$/);
});

test("app shell renders the editor toolbar", async ({ page }) => {
  await page.goto("/app");

  // The transpose / import / export controls are always present in the toolbar.
  await expect(page.getByTitle("Transpose (T)")).toBeVisible();
  await expect(page.getByTitle("Import .chseq/.mid (I)")).toBeVisible();
  await expect(page.getByTitle("Export (E)")).toBeVisible();
});

test("exporting a .chseq file triggers a download", async ({ page }) => {
  await page.goto("/app");

  // Open the export dropdown (defaults to the .chseq format).
  await page.getByTitle("Export (E)").click();

  const confirm = page.getByTitle("Export (Enter)");
  await expect(confirm).toBeVisible();

  const downloadPromise = page.waitForEvent("download");
  await confirm.click();
  const download = await downloadPromise;

  expect(download.suggestedFilename()).toBe("chords.chseq");
});
