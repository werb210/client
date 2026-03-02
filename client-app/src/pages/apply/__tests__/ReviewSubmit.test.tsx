import { describe, expect, it, vi } from "vitest";
import React from "react";
import { createRoot } from "react-dom/client";
import { act } from "react-dom/test-utils";
import ReviewSubmit from "../ReviewSubmit";
import * as api from "../../../api/applications";

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

    const container = document.createElement("div");
    document.body.appendChild(container);

    const root = createRoot(container);
    await act(async () => {
      root.render(<ReviewSubmit state={state as never} />);
    });

    const button = container.querySelector("button");
    expect(button).not.toBeNull();

    await act(async () => {
      button?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(api.submitApplication).toHaveBeenCalledWith(
      expect.objectContaining({
        lender_id: "l1",
        product_id: "p1",
      })
    );

    root.unmount();
    container.remove();
  });
});
