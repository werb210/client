export interface RuntimeConfig {
  API_URL: string
  API_BASE_URL: string
}

let config: RuntimeConfig | null = null

export async function loadRuntimeConfig(): Promise<RuntimeConfig> {
  if (config) return config

  const res = await fetch("/config.json", { cache: "no-store" })

  if (!res.ok) {
    throw new Error("Failed to load runtime config")
  }

  config = await res.json()

  return config
}

export function getRuntimeConfig(): RuntimeConfig {
  if (!config) {
    throw new Error("Runtime config not loaded")
  }

  return config
}
