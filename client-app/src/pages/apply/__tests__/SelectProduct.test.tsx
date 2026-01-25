import { describe, expect, it, vi } from "vitest";
import type { ReactElement } from "react";

const sampleProduct = {
  id: "p1",
  name: "LOC",
  product_type: "LOC",
  min_amount: 10000,
  max_amount: 500000,
  lender_id: "l1",
  lender_name: "Test Lender",
};

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

describe("SelectProduct", () => {
  it("renders products and allows selection", async () => {
    vi.resetModules();

    vi.mock("react", async () => {
      const actual = await vi.importActual<typeof import("react")>("react");
      let call = 0;
      return {
        ...actual,
        useState: () => {
          call += 1;
          if (call === 1) {
            return [sampleProduct ? [sampleProduct] : [], vi.fn()];
          }
          if (call === 2) {
            return [null, vi.fn()];
          }
          return [undefined, vi.fn()];
        },
        useEffect: () => {},
      };
    });

    const { default: SelectProduct } = await import("../SelectProduct");

    const onSelect = vi.fn();
    const element = SelectProduct({ onSelect });

    expect(JSON.stringify(element)).toContain("Test Lender");

    const button = findButton(element as ReactElement);
    expect(button).not.toBeNull();

    if (button) {
      button.props.onClick();
    }

    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({ id: "p1", product_type: "LOC" })
    );
  });
});
