let runtimeConfig: any = null;

export async function loadRuntimeConfig() {
  if (runtimeConfig) return runtimeConfig;

  const res = await fetch("/config.json", { cache: "no-store" });

  if (!res.ok) {
    throw new Error("Failed to load runtime config");
  }

  runtimeConfig = await res.json();

  return runtimeConfig;
}

export function getRuntimeConfig() {
  if (!runtimeConfig) {
    throw new Error("Runtime config not initialized");
  }

  return runtimeConfig;
}
