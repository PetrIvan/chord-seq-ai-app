import { test, expect } from "@playwright/test";

// These are smoke tests: they confirm the app boots and the core editing/export
// surface works in a real browser. They deliberately avoid the AI model and
// audio rendering (WebGPU + network), which would make them slow and flaky.

// Several overlays auto-open on a fresh visit and would cover the editor: the
// welcome overlay (first visit), the promo overlay (stored promoVersion < the
// promo's), and the new-features overlay (stored version < latest). Seed the
// persisted Zustand state so none of them open, keeping the runs deterministic.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      "state",
      JSON.stringify({
        state: {
          welcomeFirstTime: false,
          promoVersion: 9999,
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

test("inference worker starts after the service worker takes control", async ({
  page,
}) => {
  test.skip(
    !process.env.CI,
    "The service worker is enabled only in the production export.",
  );

  const bootstrapErrors: string[] = [];
  page.on("console", (message) => {
    if (message.text().includes("Missing worker bootstrap config")) {
      bootstrapErrors.push(message.text());
    }
  });

  await page.goto("/app");
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null);

  const workerStarted = page.waitForEvent("worker", (worker) =>
    worker.url().includes("turbopack-worker"),
  );
  await page.reload();
  await workerStarted;
  await page.waitForTimeout(500);

  expect(bootstrapErrors).toEqual([]);
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
