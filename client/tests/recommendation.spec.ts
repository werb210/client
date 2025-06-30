import { describe, it, expect } from "vitest";
import { filterProducts, RecommendationFormData } from "@/lib/recommendation";
import { LenderProduct } from "@/hooks/useLocalLenders";

const sampleProducts: LenderProduct[] = [
  {
    id: "1",
    product_name: "Business Term Loan",
    lender_name: "Bank of America",
    product_type: "term_loan",
    geography: ["US"],
    min_amount: 10000,
    max_amount: 500000,
    min_revenue: 100000,
    industries: ["technology", "manufacturing"],
    description: "Traditional term loan for established businesses",
    active: true
  },
  {
    id: "2", 
    product_name: "Equipment Financing",
    lender_name: "Wells Fargo",
    product_type: "equipment_financing",
    geography: ["US", "CA"],
    min_amount: 25000,
    max_amount: 2000000,
    min_revenue: 200000,
    industries: ["manufacturing", "construction"],
    description: "Financing for business equipment purchases",
    active: true
  },
  {
    id: "3",
    product_name: "Invoice Factoring",
    lender_name: "BlueVine",
    product_type: "invoice_factoring", 
    geography: ["US"],
    min_amount: 1000,
    max_amount: 5000000,
    industries: ["all"],
    description: "Convert outstanding invoices to immediate cash",
    active: true
  },
  {
    id: "4",
    product_name: "Purchase Order Financing",
    lender_name: "Fundbox",
    product_type: "purchase_order_financing",
    geography: ["US", "CA"],
    min_amount: 5000,
    max_amount: 1000000,
    industries: ["retail", "wholesale"],
    description: "Financing to fulfill large purchase orders",
    active: true
  },
  {
    id: "5",
    product_name: "Working Capital Loan",
    lender_name: "TD Bank",
    product_type: "working_capital",
    geography: ["CA"],
    min_amount: 15000,
    max_amount: 750000,
    min_revenue: 150000,
    industries: ["technology", "services"],
    description: "Short-term working capital for Canadian businesses",
    active: true
  }
];

describe("Recommendation Engine Business Rules", () => {
  describe("Core filtering logic", () => {
    it("filters by country match", () => {
      const form: RecommendationFormData = {
        headquarters: "CA",
        fundingAmount: 100000,
        lookingFor: "capital",
        accountsReceivableBalance: 0,
        fundsPurpose: "working_capital"
      };
      
      const result = filterProducts(sampleProducts, form);
      const productIds = result.map(p => p.id);
      
      // Should include products available in CA that match "capital" type: purchase order (4), working capital (5)
      // Equipment financing (2) is excluded because lookingFor="capital" excludes equipment_financing
      expect(productIds).toContain("4"); 
      expect(productIds).toContain("5");
      // Should exclude US-only products: term loan (1), invoice factoring (3)
      expect(productIds).not.toContain("1");
      expect(productIds).not.toContain("3");
      // Should exclude equipment financing (2) because lookingFor="capital"
      expect(productIds).not.toContain("2");
    });

    it("filters by amount range", () => {
      const form: RecommendationFormData = {
        headquarters: "US",
        fundingAmount: 20000, // Between 15k-25k range
        lookingFor: "capital", 
        accountsReceivableBalance: 0,
        fundsPurpose: "working_capital"
      };
      
      const result = filterProducts(sampleProducts, form);
      const productIds = result.map(p => p.id);
      
      // Should include: term loan (10k-500k), invoice factoring (1k-5M)
      expect(productIds).toContain("1");
      expect(productIds).toContain("3");
      // Should exclude: equipment financing (25k min), purchase order (5k min but exceeds some other criteria)
      expect(productIds).not.toContain("2");
    });
  });

  describe("Product type rules", () => {
    it("capital excludes equipment_financing only", () => {
      const form: RecommendationFormData = {
        headquarters: "US",
        fundingAmount: 100000,
        lookingFor: "capital",
        accountsReceivableBalance: 0,
        fundsPurpose: "working_capital"
      };
      
      const result = filterProducts(sampleProducts, form);
      const productTypes = result.map(p => p.product_type);
      
      // Should include all except equipment_financing
      expect(productTypes).toContain("term_loan");
      expect(productTypes).toContain("invoice_factoring");
      expect(productTypes).not.toContain("equipment_financing");
    });

    it("equipment allows only equipment_financing", () => {
      const form: RecommendationFormData = {
        headquarters: "US",
        fundingAmount: 100000,
        lookingFor: "equipment",
        accountsReceivableBalance: 0,
        fundsPurpose: "equipment"
      };
      
      const result = filterProducts(sampleProducts, form);
      const productTypes = result.map(p => p.product_type);
      
      // Should only include equipment_financing
      expect(productTypes).toContain("equipment_financing");
      expect(productTypes).not.toContain("term_loan");
      expect(productTypes).not.toContain("invoice_factoring");
    });

    it("both allows all product types", () => {
      const form: RecommendationFormData = {
        headquarters: "US", 
        fundingAmount: 100000,
        lookingFor: "both",
        accountsReceivableBalance: 0,
        fundsPurpose: "working_capital"
      };
      
      const result = filterProducts(sampleProducts, form);
      const productTypes = result.map(p => p.product_type);
      
      // Should include all types that match other criteria
      expect(productTypes).toContain("term_loan");
      expect(productTypes).toContain("equipment_financing");
      expect(productTypes).toContain("invoice_factoring");
    });
  });

  describe("Special inclusion rules", () => {
    it("includes invoice_factoring when AR balance > 0", () => {
      const form: RecommendationFormData = {
        headquarters: "US",
        fundingAmount: 50000,
        lookingFor: "equipment", // Would normally exclude invoice factoring
        accountsReceivableBalance: 10000, // Should trigger inclusion
        fundsPurpose: "equipment"
      };
      
      const result = filterProducts(sampleProducts, form);
      const productTypes = result.map(p => p.product_type);
      
      // Should include both equipment_financing (from type rule) and invoice_factoring (from AR rule)
      expect(productTypes).toContain("equipment_financing");
      expect(productTypes).toContain("invoice_factoring");
    });

    it("includes purchase_order_financing when purpose is inventory", () => {
      const form: RecommendationFormData = {
        headquarters: "US",
        fundingAmount: 50000,
        lookingFor: "equipment", // Would normally exclude purchase order financing
        accountsReceivableBalance: 0,
        fundsPurpose: "inventory" // Should trigger inclusion
      };
      
      const result = filterProducts(sampleProducts, form);
      const productTypes = result.map(p => p.product_type);
      
      // Should include both equipment_financing (from type rule) and purchase_order_financing (from inventory rule)
      expect(productTypes).toContain("equipment_financing");
      expect(productTypes).toContain("purchase_order_financing");
    });

    it("combines multiple special rules", () => {
      const form: RecommendationFormData = {
        headquarters: "US",
        fundingAmount: 50000,
        lookingFor: "equipment", // Base: only equipment_financing
        accountsReceivableBalance: 15000, // Adds: invoice_factoring
        fundsPurpose: "inventory" // Adds: purchase_order_financing
      };
      
      const result = filterProducts(sampleProducts, form);
      const productTypes = result.map(p => p.product_type);
      
      // Should include all three types
      expect(productTypes).toContain("equipment_financing");
      expect(productTypes).toContain("invoice_factoring");
      expect(productTypes).toContain("purchase_order_financing");
      expect(result).toHaveLength(3);
    });
  });

  describe("Deduplication", () => {
    it("removes duplicate products when multiple rules apply", () => {
      const form: RecommendationFormData = {
        headquarters: "US",
        fundingAmount: 50000,
        lookingFor: "both", // Includes invoice_factoring normally
        accountsReceivableBalance: 10000, // Also includes invoice_factoring via AR rule
        fundsPurpose: "working_capital"
      };
      
      const result = filterProducts(sampleProducts, form);
      const invoiceProducts = result.filter(p => p.product_type === "invoice_factoring");
      
      // Should only have one invoice factoring product, not duplicated
      expect(invoiceProducts).toHaveLength(1);
      expect(invoiceProducts[0].id).toBe("3");
    });
  });

  describe("Edge cases", () => {
    it("handles empty product array", () => {
      const form: RecommendationFormData = {
        headquarters: "US",
        fundingAmount: 50000,
        lookingFor: "capital",
        accountsReceivableBalance: 0,
        fundsPurpose: "working_capital"
      };
      
      const result = filterProducts([], form);
      expect(result).toEqual([]);
    });

    it("handles zero funding amount", () => {
      const form: RecommendationFormData = {
        headquarters: "US", 
        fundingAmount: 0,
        lookingFor: "capital",
        accountsReceivableBalance: 0,
        fundsPurpose: "working_capital"
      };
      
      const result = filterProducts(sampleProducts, form);
      // Should return empty since no products have min_amount of 0
      expect(result).toEqual([]);
    });

    it("handles very high funding amount", () => {
      const form: RecommendationFormData = {
        headquarters: "US",
        fundingAmount: 10000000, // 10M - exceeds all max_amounts
        lookingFor: "capital",
        accountsReceivableBalance: 0,
        fundsPurpose: "working_capital"
      };
      
      const result = filterProducts(sampleProducts, form);
      // Should return empty since amount exceeds all product limits
      expect(result).toEqual([]);
    });
  });
});