import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { OffersView, type OfferTermSheet } from "../offers/OffersView";

const baseOffer: OfferTermSheet = {
  id: "offer-1",
  lender_name: "North Bank",
  product_name: "Working Capital",
  terms: {
    amount: 250000,
    term_months: 18,
    rate: 7.2,
  },
  expires_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
  status: "active",
  document_url: "https://example.com/term-sheet.pdf",
};

describe("OffersView", () => {
  it("renders empty state when no offers exist", () => {
    const html = renderToStaticMarkup(<OffersView offers={[]} />);
    expect(html).toContain("No offers available yet");
  });

  it("renders active offers with details", () => {
    const html = renderToStaticMarkup(<OffersView offers={[baseOffer]} />);
    expect(html).toContain("Active offers");
    expect(html).toContain(baseOffer.lender_name);
    expect(html).toContain(baseOffer.product_name);
    expect(html).toContain("View Term Sheet");
  });

  it("separates archived offers", () => {
    const archivedOffer = { ...baseOffer, id: "offer-2", status: "expired" };
    const html = renderToStaticMarkup(
      <OffersView offers={[baseOffer, archivedOffer]} />
    );
    expect(html).toContain("Archived offers");
    expect(html).toContain("Expired");
  });

  it("links to term sheet in a new tab", () => {
    const html = renderToStaticMarkup(<OffersView offers={[baseOffer]} />);
    expect(html).toContain(`href=\"${baseOffer.document_url}\"`);
    expect(html).toContain("target=\"_blank\"");
  });

  it("does not render accept or reject actions", () => {
    const html = renderToStaticMarkup(<OffersView offers={[baseOffer]} />);
    expect(html).not.toMatch(/accept/i);
    expect(html).not.toMatch(/reject/i);
  });
});
