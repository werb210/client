const KEY = "boreal_app_cache";

export const OfflineStore = {
  save(data: unknown) {
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
    } catch (error) {
    }
  },
  load() {
    try {
      const raw = localStorage.getItem(KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      if (parsed && typeof parsed === "object") return parsed;
      return null;
    } catch (error) {
      localStorage.removeItem(KEY);
      return null;
    }
  },
  clear() {
    try {
      localStorage.removeItem(KEY);
    } catch (error) {
    }
  },
};
