import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";
import { beforeAll, afterEach, afterAll } from "vitest";

export const mockProducts = [
  {
    id: "prod-1",
    product_name: "Business Line of Credit",
    lender_name: "Capital One",
    product_type: "line_of_credit",
    geography: ["US", "CA"],
    min_amount: 10000,
    max_amount: 500000,
    min_revenue: 100000,
    industries: ["retail", "technology", "manufacturing"],
    video_url: "https://example.com/video1",
    description: "Flexible business line of credit for working capital needs"
  },
  {
    id: "prod-2", 
    product_name: "Equipment Financing",
    lender_name: "Wells Fargo",
    product_type: "equipment_financing",
    geography: ["US"],
    min_amount: 25000,
    max_amount: 2000000,
    min_revenue: 250000,
    industries: ["construction", "manufacturing", "transportation"],
    video_url: "https://example.com/video2",
    description: "Finance new or used equipment for your business"
  },
  {
    id: "prod-3",
    product_name: "Term Loan",
    lender_name: "Bank of Montreal",
    product_type: "term_loan", 
    geography: ["CA"],
    min_amount: 50000,
    max_amount: 1000000,
    min_revenue: 500000,
    industries: ["technology", "healthcare", "professional_services"],
    video_url: "https://example.com/video3",
    description: "Fixed-term business loan for expansion and growth"
  }
];

export const server = setupServer(
  http.get("https://staffportal.replit.app/api/public/lenders", () => {
    return HttpResponse.json({ products: mockProducts });
  }),
  
  http.get("*/api/lenders", () => {
    return HttpResponse.json({
      products: mockProducts,
      total: mockProducts.length,
      page: 1,
      limit: 50,
      totalPages: 1
    });
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());