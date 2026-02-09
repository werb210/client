import { describe, expect, it } from "vitest";
import contract from "../../_artifacts/client-api-contract.json";
import { clientApiContract } from "../clientApiSchemas";

describe("client API contract", () => {
  it("exports the frozen contract artifact", () => {
    expect(contract).toEqual(clientApiContract);
  });

  it("lists contract endpoints", () => {
    const endpoints = Object.keys(contract.endpoints);
    expect(endpoints.length).toBeGreaterThan(0);
    expect(new Set(endpoints).size).toBe(endpoints.length);
  });
});
