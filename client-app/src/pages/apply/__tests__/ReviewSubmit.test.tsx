import { describe, expect, it, vi } from "vitest";
import type { ReactElement } from "react";
import ReviewSubmit from "../ReviewSubmit";
import * as api from "../../../api/applications";

function findButton(element: ReactElement): ReactElement | null {
  if (element.type === "button") {
    return element;
  }

  const children = element.props?.children;
  if (!children) return null;

  const queue = Array.isArray(children) ? children : [children];
  for (const child of queue) {
    if (!child || typeof child !== "object") continue;
    const found = findButton(child as ReactElement);
    if (found) return found;
  }

  return null;
}

describe("ReviewSubmit", () => {
  it("submits application with lender + product", async () => {
    vi.spyOn(api, "submitApplication").mockResolvedValue({ ok: true });

    const state = {
      selectedProduct: {
        id: "p1",
        lender_id: "l1",
        name: "LOC",
        product_type: "LOC",
      },
    };

    const element = ReviewSubmit({ state } as any);
    const button = findButton(element as ReactElement);
    expect(button).not.toBeNull();

    if (button) {
      await button.props.onClick();
    }

    expect(api.submitApplication).toHaveBeenCalledWith(
      expect.objectContaining({
        lender_id: "l1",
        product_id: "p1",
      })
    );
  });
});
