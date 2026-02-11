import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { AiChatWidget, getPanelLayoutStyles } from "../AiChatWidget";

describe("AiChatWidget", () => {
  it("chat renders", () => {
    const markup = renderToStaticMarkup(<AiChatWidget />);
    expect(markup).toContain("Open chat assistant");
  });

  it("mobile layout snapshot", () => {
    const mobileLayout = getPanelLayoutStyles(true);
    expect(mobileLayout.width).toBe("100vw");
    expect(mobileLayout.height).toBe("100dvh");

    const markup = renderToStaticMarkup(<AiChatWidget initialOpen />);
    expect(markup).toContain("Boreal Marketplace Assistant");
  });
});
