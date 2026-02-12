/// <reference types="node" />

import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import path from "node:path";
import { WIZARD_FIELD_INVENTORY } from "../__generated__/wizardFieldInventory";

describe("WIZARD_FIELD_INVENTORY", () => {
  const steps = [
    WIZARD_FIELD_INVENTORY.step1,
    WIZARD_FIELD_INVENTORY.step2,
    WIZARD_FIELD_INVENTORY.step3,
    WIZARD_FIELD_INVENTORY.step4,
    WIZARD_FIELD_INVENTORY.step5,
    WIZARD_FIELD_INVENTORY.step6,
  ];

  it("includes steps 1 through 6", () => {
    steps.forEach((step, index) => {
      expect(step).toBeDefined();
      expect(step.step).toBe(index + 1);
    });
  });

  it("includes at least one field per step", () => {
    steps.forEach((step) => {
      expect(step.fields.length).toBeGreaterThan(0);
    });
  });

  it("does not include duplicate field keys within a step", () => {
    steps.forEach((step) => {
      const keys = step.fields.map((field) => field.key);
      const unique = new Set(keys);
      expect(unique.size).toBe(keys.length);
    });
  });

  it("references files that exist", () => {
    const root = path.resolve(process.cwd(), "..", "..");
    steps.forEach((step) => {
      step.fields.forEach((field) => {
        const filePath = path.join(root, "wizard", field.file);
        expect(existsSync(filePath)).toBe(true);
      });
    });
  });
});
