import { stat } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { modelOptions } from "./models";

describe("modelOptions", () => {
  it.each(modelOptions)(
    "keeps the size of $name in sync with its asset",
    async (model) => {
      const asset = await stat(
        path.join(process.cwd(), "public", model.path.replace(/^\//, "")),
      );

      expect(model.sizeBytes).toBe(asset.size);
    },
  );
});
