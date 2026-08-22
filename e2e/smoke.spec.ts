import { test, expect } from "@playwright/test";
import MidiWriter from "midi-writer-js";
import { writeFile } from "node:fs/promises";

const fileInput = (page: import("@playwright/test").Page) =>
  page.locator('input[type="file"]');

const acceptAlertFrom = async (
  page: import("@playwright/test").Page,
  action: () => Promise<void>,
) => {
  const messagePromise = page.waitForEvent("dialog").then(async (dialog) => {
    const message = dialog.message();
    await dialog.accept();
    return message;
  });
  await action();
  return messagePromise;
};

const persistedState = (chords: unknown[]) =>
  JSON.stringify({
    state: {
      chords,
      signature: [4, 4],
      welcomeFirstTime: false,
      promoVersion: 9999,
      version: 9999,
    },
    version: 0,
  });

const oddMeterMidi = () => {
  const track = new MidiWriter.Track();
  track.setTimeSignature(12, 8, 24, 8);
  track.setTempo(120);
  track.addEvent(
    new MidiWriter.NoteEvent({
      pitch: ["C4", "E4", "G4"],
      duration: "T128",
    }),
  );
  return Buffer.from(new MidiWriter.Writer(track).base64(), "base64");
};

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

test("production security policy allows the app to boot", async ({ page }) => {
  test.skip(!process.env.CI, "The CSP is emitted only in production builds.");

  const policyErrors: string[] = [];
  page.on("console", (message) => {
    if (message.text().toLowerCase().includes("content security policy")) {
      policyErrors.push(message.text());
    }
  });

  await page.goto("/app");

  const policy = page.locator('meta[http-equiv="Content-Security-Policy"]');
  await expect(policy).toHaveAttribute("content", /default-src 'self'/);
  await expect(page.getByTitle("Import .chseq/.mid (I)")).toBeVisible();
  expect(policyErrors).toEqual([]);
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

test("a long safe .chseq sequence exports and imports without data loss", async ({
  page,
}, testInfo) => {
  await page.addInitScript(
    (state) => localStorage.setItem("state", state),
    persistedState([
      { index: 0, token: 0, duration: 3000, variant: 0 },
      { index: 1, token: 0, duration: 3000, variant: 0 },
    ]),
  );
  await page.goto("/app");

  await expect(page.locator('[title$="elect this chord"]')).toHaveCount(2);
  await page.getByTitle("Export (E)").click();
  const downloadPromise = page.waitForEvent("download");
  await page.getByTitle("Export (Enter)").click();
  const download = await downloadPromise;
  const exportedPath = testInfo.outputPath("roundtrip.chseq");
  await download.saveAs(exportedPath);

  await page.getByTitle("Close (Esc)").click();

  await page.getByTitle("Delete all chords (Ctrl+Del)").click();
  await page.getByTitle("Confirm deletion (Enter)").click();
  await expect(page.locator('[title$="elect this chord"]')).toHaveCount(0);

  await fileInput(page).setInputFiles(exportedPath);
  await expect(page.locator('[title$="elect this chord"]')).toHaveCount(2);
});

test("invalid and oversized .chseq files are rejected without replacing state", async ({
  page,
}, testInfo) => {
  await page.goto("/app");
  await page.getByTitle("Add chord (A)").click();
  await expect(page.locator('[title$="elect this chord"]')).toHaveCount(1);

  const invalidMessage = await acceptAlertFrom(page, () =>
    fileInput(page).setInputFiles({
      name: "invalid.chseq",
      mimeType: "application/json",
      buffer: Buffer.from(
        JSON.stringify({
          chords: [{ index: 0, token: 999999, duration: 4, variant: 0 }],
          signature: [4, 4],
        }),
      ),
    }),
  );
  expect(invalidMessage).toBe("Couldn't parse the file.");
  await expect(page.locator('[title$="elect this chord"]')).toHaveCount(1);

  const oversizedPath = testInfo.outputPath("oversized.chseq");
  await writeFile(oversizedPath, Buffer.alloc(10 * 1024 * 1024 + 1));
  const oversizedMessage = await acceptAlertFrom(page, () =>
    fileInput(page).setInputFiles(oversizedPath),
  );
  expect(oversizedMessage).toBe(
    "The selected file is too large to import safely.",
  );
  await expect(page.locator('[title$="elect this chord"]')).toHaveCount(1);
});

test("12/8 MIDI import clamps quantization and preserves MIDI metadata", async ({
  page,
}) => {
  await page.goto("/app");
  await fileInput(page).setInputFiles({
    name: "twelve-eight.mid",
    mimeType: "audio/midi",
    buffer: oddMeterMidi(),
  });

  await expect(page.getByText("Import MIDI", { exact: true })).toBeVisible();
  await expect(page.getByTitle("Beats")).toHaveValue("8");
  await page.getByTitle("Import (Enter)").click();

  await expect(page.getByText("Import MIDI", { exact: true })).toBeHidden();
  await expect(page.getByTitle("Change signature")).toContainText("12");
  await expect(page.getByTitle("Change signature")).toContainText("8");
  await expect(page.locator('[title$="elect this chord"]')).toHaveCount(1);
});

test("malformed MIDI files are rejected without opening the import overlay", async ({
  page,
}) => {
  await page.goto("/app");

  const message = await acceptAlertFrom(page, () =>
    fileInput(page).setInputFiles({
      name: "malformed.mid",
      mimeType: "audio/midi",
      buffer: Buffer.from([0, 1, 2, 3]),
    }),
  );

  expect(message).toContain("An error occurred while importing");
  await expect(page.getByText("Import MIDI", { exact: true })).toBeHidden();
});

test("unsafe in-memory sequences are not exported", async ({ page }) => {
  await page.addInitScript(
    (state) => localStorage.setItem("state", state),
    persistedState([{ index: 0, token: 0, duration: 4096.5, variant: 0 }]),
  );
  await page.goto("/app");

  await page.getByTitle("Export (E)").click();
  const message = await acceptAlertFrom(page, () =>
    page.getByTitle("Export (Enter)").click(),
  );

  expect(message).toContain("exceeds the supported safety limits");
});
