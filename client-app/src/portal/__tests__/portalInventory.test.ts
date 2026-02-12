/// <reference types="node" />

import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import inventory from "../../_artifacts/portal-surface-inventory.json";

describe("portal-surface-inventory", () => {
  it("lists unique surfaces", () => {
    const surfaces = inventory.map((entry) => entry.surface);
    expect(new Set(surfaces).size).toBe(surfaces.length);
  });

  it("includes fields without duplicates per surface", () => {
    inventory.forEach((entry) => {
      expect(entry.fields.length).toBeGreaterThan(0);
      expect(new Set(entry.fields).size).toBe(entry.fields.length);
    });
  });

  it("references files that exist in the repository", () => {
    inventory.forEach((entry) => {
      const resolved = resolve(process.cwd(), entry.file);
      expect(existsSync(resolved)).toBe(true);
    });
  });
});
