const DEV = import.meta.env.DEV;
const original = window.fetch;

window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  if (DEV) {
    const url = typeof input === "string" ? input : (input as any).url;
    const isExternal = /^https?:\/\//i.test(url) && !/^https?:\/\/(localhost|127\.0\.0\.1)(:\d{2,5})?\//i.test(url);
    if (isExternal) throw new Error(`External fetch blocked in dev: ${url}`);
  }
  return original(input as any, init);
};

export {}; // Make this a module