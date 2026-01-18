const KEY = "boreal_app_cache";

export const OfflineStore = {
  save(data: any) {
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
    } catch (error) {
      console.warn("Failed to save offline cache:", error);
    }
  },
  load() {
    try {
      const raw = localStorage.getItem(KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      if (parsed && typeof parsed === "object") return parsed;
      return null;
    } catch (error) {
      console.warn("Failed to load offline cache:", error);
      localStorage.removeItem(KEY);
      return null;
    }
  },
  clear() {
    try {
      localStorage.removeItem(KEY);
    } catch (error) {
      console.warn("Failed to clear offline cache:", error);
    }
  },
};
