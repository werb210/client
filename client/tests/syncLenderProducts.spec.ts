import { describe, it, expect, vi, beforeEach } from "vitest";
import "./setup";
import { syncLenderProducts, getCachedLenderProducts, getCacheMetadata } from "../src/lib/syncLenderProducts";

// Mock localStorage for testing
const localStorageMock = {
  store: {} as Record<string, string>,
  getItem: vi.fn((key: string) => localStorageMock.store[key] || null),
  setItem: vi.fn((key: string, value: string) => {
    localStorageMock.store[key] = value;
  }),
  removeItem: vi.fn((key: string) => {
    delete localStorageMock.store[key];
  }),
  clear: vi.fn(() => {
    localStorageMock.store = {};
  })
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe("Lender Products Caching System", () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  describe("syncLenderProducts", () => {
    it("caches products on first run", async () => {
      const result = await syncLenderProducts();
      
      expect(result).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'lender_products_cache',
        expect.stringContaining('Business Line of Credit')
      );
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'lender_products_last_fetched',
        expect.any(String)
      );
    });

    it("skips fetch if cache is fresh (less than 12 hours)", async () => {
      // Set cache timestamp to 1 hour ago
      const oneHourAgo = Date.now() - (60 * 60 * 1000);
      localStorageMock.setItem('lender_products_last_fetched', oneHourAgo.toString());

      const fetchSpy = vi.spyOn(global, 'fetch');
      const result = await syncLenderProducts();

      expect(result).toBe(true);
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it("fetches fresh data if cache is stale (older than 12 hours)", async () => {
      // Set cache timestamp to 13 hours ago
      const thirteenHoursAgo = Date.now() - (13 * 60 * 60 * 1000);
      localStorageMock.setItem('lender_products_last_fetched', thirteenHoursAgo.toString());

      const fetchSpy = vi.spyOn(global, 'fetch');
      const result = await syncLenderProducts();

      expect(result).toBe(true);
      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining('/api/public/lenders'),
        expect.objectContaining({
          method: 'GET',
          credentials: 'include'
        })
      );
    });

    it("handles network errors gracefully", async () => {
      // Mock fetch to reject
      const fetchSpy = vi.spyOn(global, 'fetch').mockRejectedValue(new Error('Network error'));
      
      const result = await syncLenderProducts();
      
      expect(result).toBe(false);
      expect(fetchSpy).toHaveBeenCalled();
    });

    it("stores metadata correctly", async () => {
      await syncLenderProducts();
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'lender_products_metadata',
        expect.stringContaining('"totalProducts":3')
      );
    });
  });

  describe("getCachedLenderProducts", () => {
    it("returns cached products when available", async () => {
      // First sync to populate cache
      await syncLenderProducts();
      
      const products = await getCachedLenderProducts();
      
      expect(products).toHaveLength(3);
      expect(products[0]).toEqual(
        expect.objectContaining({
          product_name: 'Business Line of Credit',
          lender_name: 'Capital One',
          product_type: 'line_of_credit'
        })
      );
    });

    it("returns empty array when no cache exists", async () => {
      const products = await getCachedLenderProducts();
      
      expect(products).toEqual([]);
    });

    it("triggers sync when no cached data exists", async () => {
      const syncSpy = vi.spyOn(await import('../src/lib/syncLenderProducts'), 'syncLenderProducts');
      
      await getCachedLenderProducts();
      
      expect(syncSpy).toHaveBeenCalled();
    });

    it("handles corrupted cache data gracefully", async () => {
      // Set invalid JSON in cache
      localStorageMock.setItem('lender_products_cache', 'invalid json');
      
      const products = await getCachedLenderProducts();
      
      expect(products).toEqual([]);
    });
  });

  describe("getCacheMetadata", () => {
    it("returns correct metadata when cache exists", async () => {
      await syncLenderProducts();
      
      const metadata = await getCacheMetadata();
      
      expect(metadata).toEqual({
        lastFetched: expect.any(Number),
        totalProducts: 3,
        isStale: false
      });
    });

    it("indicates stale cache correctly", async () => {
      // Set old timestamp
      const oldTimestamp = Date.now() - (13 * 60 * 60 * 1000);
      localStorageMock.setItem('lender_products_last_fetched', oldTimestamp.toString());
      localStorageMock.setItem('lender_products_cache', JSON.stringify([]));
      
      const metadata = await getCacheMetadata();
      
      expect(metadata?.isStale).toBe(true);
    });

    it("returns null when no cache exists", async () => {
      const metadata = await getCacheMetadata();
      
      expect(metadata).toEqual({
        lastFetched: null,
        totalProducts: 0,
        isStale: true
      });
    });
  });

  describe("Product filtering and data integrity", () => {
    beforeEach(async () => {
      await syncLenderProducts();
    });

    it("maintains product data structure", async () => {
      const products = await getCachedLenderProducts();
      
      expect(products[0]).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          product_name: expect.any(String),
          lender_name: expect.any(String),
          product_type: expect.any(String),
          geography: expect.any(Array),
          min_amount: expect.any(Number),
          max_amount: expect.any(Number)
        })
      );
    });

    it("preserves geography and industry arrays", async () => {
      const products = await getCachedLenderProducts();
      const usProduct = products.find(p => p.geography.includes('US'));
      
      expect(usProduct?.geography).toContain('US');
      expect(usProduct?.industries).toBeInstanceOf(Array);
    });

    it("handles different product types correctly", async () => {
      const products = await getCachedLenderProducts();
      const productTypes = products.map(p => p.product_type);
      
      expect(productTypes).toContain('line_of_credit');
      expect(productTypes).toContain('equipment_financing');
      expect(productTypes).toContain('term_loan');
    });
  });

  describe("Cache performance and efficiency", () => {
    it("does not trigger multiple syncs for concurrent calls", async () => {
      const fetchSpy = vi.spyOn(global, 'fetch');
      
      // Make multiple concurrent calls
      await Promise.all([
        getCachedLenderProducts(),
        getCachedLenderProducts(),
        getCachedLenderProducts()
      ]);
      
      // Should only fetch once
      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });

    it("respects the 12-hour cache window precisely", async () => {
      const now = Date.now();
      const elevenHours = now - (11 * 60 * 60 * 1000);
      const thirteenHours = now - (13 * 60 * 60 * 1000);
      
      // Test 11 hours (should not fetch)
      localStorageMock.setItem('lender_products_last_fetched', elevenHours.toString());
      let metadata = await getCacheMetadata();
      expect(metadata?.isStale).toBe(false);
      
      // Test 13 hours (should fetch)
      localStorageMock.setItem('lender_products_last_fetched', thirteenHours.toString());
      metadata = await getCacheMetadata();
      expect(metadata?.isStale).toBe(true);
    });
  });
});