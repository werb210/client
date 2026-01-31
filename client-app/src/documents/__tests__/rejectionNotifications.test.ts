import { describe, expect, it } from "vitest";
import {
  consumeDueNotification,
  createEmptyRejectionState,
  upsertRejectionState,
} from "../rejectionNotifications";

describe("rejection notifications", () => {
  it("aggregates rejected documents into a single delayed notification", () => {
    const delayMs = 10_000;
    const now = 1000;
    const initial = createEmptyRejectionState();

    const afterFirst = upsertRejectionState(
      initial,
      ["bank_statements"],
      now,
      delayMs
    );
    const afterSecond = upsertRejectionState(
      afterFirst,
      ["ownership_info"],
      now + 2000,
      delayMs
    );

    const { notification } = consumeDueNotification(
      afterSecond,
      now + delayMs + 1
    );
    expect(notification?.documents.sort()).toEqual(
      ["bank_statements", "ownership_info"].sort()
    );
  });
});
