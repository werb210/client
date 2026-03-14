import { describe, expect, test } from "vitest";
import { normalizePhone } from "../utils/normalizePhone";

describe("normalizePhone", () => {
  test("normalizes canadian phone", () => {
    expect(normalizePhone("4035551234")).toBe("+14035551234");
  });

  test("accepts plus phone", () => {
    expect(normalizePhone("+14035551234")).toBe("+14035551234");
  });
});
