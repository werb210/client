import { describe, expect, it } from "vitest";
import { clearDraft, loadStepData, mergeDraft, saveStepData } from "../autosave";

function createStorage(initial: Record<string, string> = {}) {
  let store = { ...initial };
  return {
    getItem: (key: string) => (key in store ? store[key] : null),
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    key: (index: number) => Object.keys(store)[index] ?? null,
    get length() {
      return Object.keys(store).length;
    },
  } as Storage;
}

describe("autosave drafts", () => {
  it("persists and restores step drafts", () => {
    const storage = createStorage();
    saveStepData(1, { businessLocation: "Canada" }, storage);
    expect(loadStepData(1, storage)).toEqual({ businessLocation: "Canada" });
  });

  it("merges drafts without overriding existing values", () => {
    const merged = mergeDraft(
      { businessLocation: "United States", industry: "" },
      { businessLocation: "Canada", industry: "Retail" }
    );
    expect(merged).toEqual({
      businessLocation: "United States",
      industry: "Retail",
    });
  });

  it("clears all step drafts", () => {
    const storage = createStorage({
      "client:draft:step:1": JSON.stringify({}),
      "client:draft:step:3": JSON.stringify({}),
      "other:key": "keep",
    });
    clearDraft(storage);
    expect(storage.getItem("client:draft:step:1")).toBeNull();
    expect(storage.getItem("client:draft:step:3")).toBeNull();
    expect(storage.getItem("other:key")).toBe("keep");
  });
});
