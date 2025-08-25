// Hard guard: prevent any fetch to external origins from client bundle.
const _fetch = window.fetch.bind(window);
window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
  const url = typeof input === "string" ? input : (input as any).toString?.() || "";
  if (/^https?:\/\//i.test(url)) {
    const u = new URL(url);
    const allowed = [location.origin];
    if (!allowed.includes(`${u.origin}`)) {
      console.error(`[BLOCKED] External fetch from client: ${u.origin}`);
      throw new Error(`[BLOCKED] External fetch from client: ${u.origin}`);
    }
  }
  return _fetch(input, init);
};

export {}; // Make this a module