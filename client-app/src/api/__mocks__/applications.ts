import { vi } from "vitest";

export const submitApplication = vi.fn().mockResolvedValue({ ok: true });
