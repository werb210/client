// ---- Attribution Persistence ----

export const ATTR_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "gclid",
  "msclkid",
  "ga_client_id",
] as const;

type AttrKey = (typeof ATTR_KEYS)[number];

export type PersistedAttribution = Record<AttrKey, string | null>;

export const persistAttributionFromUrl = () => {
  if (typeof window === "undefined") return;

  const url = new URL(window.location.href);

  ATTR_KEYS.forEach((key) => {
    const value = url.searchParams.get(key);
    if (value) {
      localStorage.setItem(key, value);
    }
  });
};

export const getPersistedAttribution = (): PersistedAttribution => {
  const attribution = {} as PersistedAttribution;

  ATTR_KEYS.forEach((key) => {
    attribution[key] = localStorage.getItem(key);
  });

  return attribution;
};

