const KEY = "boreal_app_cache";

export const OfflineStore = {
  save(data: any) {
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
    } catch {}
  },
  load() {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
  clear() {
    try {
      localStorage.removeItem(KEY);
    } catch {}
  },
};
