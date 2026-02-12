import { beforeAll } from "vitest";

// Provide required VITE env for tests
beforeAll(() => {
  (import.meta as any).env = {
    ...import.meta.env,
    VITE_API_BASE_URL: "http://localhost",
  };
});
