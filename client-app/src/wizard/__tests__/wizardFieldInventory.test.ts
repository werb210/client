/// <reference types="node" />

import { describe, expect, it } from "vitest"
import { existsSync } from "node:fs"
import path from "node:path"
import { WIZARD_FIELD_INVENTORY } from "../wizardFieldInventory"

describe("WIZARD_FIELD_INVENTORY", () => {
  it("includes the locked V1 6-step flow", () => {
    expect(WIZARD_FIELD_INVENTORY.map((step) => step.step)).toEqual([
      "Step1_KYC",
      "Step2_ProductCategory",
      "Step3_BusinessDetails",
      "Step4_ApplicantInformation",
      "Step5_Documents",
      "Step6_TermsSignature",
    ])
  })

  it("includes at least one field per step", () => {
    WIZARD_FIELD_INVENTORY.forEach((step) => {
      expect(step.fields.length).toBeGreaterThan(0)
    })
  })

  it("does not include duplicate field names within a step", () => {
    WIZARD_FIELD_INVENTORY.forEach((step) => {
      const keys = step.fields.map((field) => field.name)
      const unique = new Set(keys)
      expect(unique.size).toBe(keys.length)
    })
  })

  it("references files that exist", () => {
    const root = path.resolve(process.cwd(), "src", "wizard")

    WIZARD_FIELD_INVENTORY.forEach((step) => {
      step.fields.forEach((field) => {
        const filePath = path.join(root, field.file)
        expect(existsSync(filePath)).toBe(true)
      })
    })
  })
})
