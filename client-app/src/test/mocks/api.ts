import applicationFixture from "@/test/fixtures/application.json";
import lendersFixture from "@/test/fixtures/lenders.json";
import { vi } from "vitest";

export const mockedApi = {
  get: vi.fn(async (url: string) => {
    if (url.includes("lenders")) {
      return { data: lendersFixture };
    }

    return { data: applicationFixture };
  }),
  post: vi.fn(async () => ({ data: applicationFixture })),
  patch: vi.fn(async () => ({ data: applicationFixture })),
};

export function installApiMock() {
  vi.mock("@/lib/api", () => ({
    default: mockedApi,
    apiRequest: vi.fn(async () => applicationFixture),
    buildApiUrl: vi.fn((path: string) => `http://localhost${path}`),
  }));
}
