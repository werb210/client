const resolveApiBase = () => {
  const env = import.meta.env

  if (env && env.VITE_API_URL) {
    return env.VITE_API_URL
  }

  return "https://api.staff.boreal.financial"
}

const API_BASE = resolveApiBase()

export async function clientApi(path: string, options: RequestInit = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`API ${res.status}: ${text}`)
  }

  return res.json()
}
