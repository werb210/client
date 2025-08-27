// client/src/lib/fetch-guard.ts
if (import.meta.env.DEV) {
  const origFetch = window.fetch;
  window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    if (/^https?:\/\//i.test(url) && !/^https?:\/\/(localhost|127\.0\.0\.1)/i.test(url)) {
      throw new Error(`Blocked external fetch in dev: ${url}`);
    }
    return origFetch(input, init);
  };
  // eslint-disable-next-line no-console
  console.info("[fetch-guard] dev external fetch blocking is ACTIVE");
}

export {}; // Make this a module