import { OfflineStore } from "../state/offline";
import { MockLenderProducts } from "./mockProducts";

const KEY = "boreal_lender_products";

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

  async sync() {
    // Phase 6 will replace this with a real API call
    ProductSync.save(MockLenderProducts);
    return MockLenderProducts;
  }
};
