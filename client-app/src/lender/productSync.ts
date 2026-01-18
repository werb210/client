import { api } from "../api/client";
import { OfflineStore } from "../state/offline";

export const ProductSync = {
  load(): any[] {
    const cached = OfflineStore.load();
    if (cached?.lenderProducts) return cached.lenderProducts;
    return [];
  },

  save(products: any[]) {
    const existing = OfflineStore.load() || {};
    OfflineStore.save({
      ...existing,
      lenderProducts: products,
    });
  },

  invalidateCache() {
    const existing = OfflineStore.load() || {};
    if (existing.lenderProducts) {
      const { lenderProducts, ...rest } = existing;
      OfflineStore.save(rest);
    }
  },

  async sync() {
    ProductSync.invalidateCache();
    const res = await api.get("/api/lender-products/public");
    const products = Array.isArray(res.data) ? res.data : [];
    if (!products.length) {
      throw new Error("No lender products returned from server.");
    }
    ProductSync.save(products);
    return products;
  },
};
