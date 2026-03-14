export type RuntimeConfig = {
  API_BASE_URL: string;
  API_URL: string;
};

declare global {
  interface Window {
    __RUNTIME_CONFIG__?: Partial<RuntimeConfig>;
    RUNTIME_CONFIG?: Partial<RuntimeConfig>;
  }
}

const DEFAULT_API_ORIGIN = "/api";

let runtimeConfig: RuntimeConfig | null = null;
let runtimeConfigPromise: Promise<RuntimeConfig> | null = null;

function normalizeRuntimeConfig(config: Partial<RuntimeConfig> = {}): RuntimeConfig {
  const apiOrigin =
    config.API_BASE_URL ||
    config.API_URL ||
    import.meta.env.VITE_API_BASE ||
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_API_URL ||
    DEFAULT_API_ORIGIN;

  const normalizedBase = apiOrigin.replace(/\/$/, "");

  return {
    API_URL: normalizedBase,
    API_BASE_URL: normalizedBase,
  };
}

function persistWindowConfig(config: RuntimeConfig) {
  window.__RUNTIME_CONFIG__ = {
    ...(window.__RUNTIME_CONFIG__ || {}),
    ...config,
  };
  window.RUNTIME_CONFIG = {
    ...(window.RUNTIME_CONFIG || {}),
    ...config,
  };
}

export async function loadRuntimeConfig() {
  if (runtimeConfig) return runtimeConfig;
  if (runtimeConfigPromise) return runtimeConfigPromise;

  runtimeConfigPromise = (async () => {
    const existingRuntimeConfig = window.__RUNTIME_CONFIG__ || window.RUNTIME_CONFIG;

    if (existingRuntimeConfig) {
      runtimeConfig = normalizeRuntimeConfig(existingRuntimeConfig);
      persistWindowConfig(runtimeConfig);
      return runtimeConfig;
    }

    try {
      const res = await fetch("/config.json", { cache: "no-store" });

      if (!res.ok) {
        throw new Error(`Failed to load runtime config (status ${res.status})`);
      }

      const json = (await res.json()) as Partial<RuntimeConfig>;
      runtimeConfig = normalizeRuntimeConfig(json);
    } catch {
      runtimeConfig = normalizeRuntimeConfig();
    }

    persistWindowConfig(runtimeConfig);
    return runtimeConfig;
  })();

  return runtimeConfigPromise;
}

export function getRuntimeConfig(): RuntimeConfig {
  if (!runtimeConfig) {
    runtimeConfig = normalizeRuntimeConfig(window.__RUNTIME_CONFIG__ || window.RUNTIME_CONFIG || {});
    persistWindowConfig(runtimeConfig);
  }

  return runtimeConfig;
}
