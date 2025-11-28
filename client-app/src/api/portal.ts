// src/api/portal.ts

export interface PortalRequestOptions {
  method?: "GET" | "POST";
  token?: string;
  body?: unknown;
}

const BASE_URL =
  import.meta.env.VITE_STAFF_API_URL || "https://staff-server.boreal.financial/api/client-portal";

async function portalRequest<T>(
  path: string,
  options: PortalRequestOptions = {}
): Promise<T> {
  const url = `${BASE_URL}/${path.replace(/^\//, "")}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (options.token) {
    headers["Authorization"] = `Bearer ${options.token}`;
  }

  const res = await fetch(url, {
    method: options.method || "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `Portal API error ${res.status}: ${res.statusText} ${text || ""}`.trim()
    );
  }

  return (await res.json()) as T;
}

export function portalGet<T = any>(
  path: string,
  token?: string
): Promise<T> {
  return portalRequest<T>(path, { method: "GET", token });
}

export function portalPost<T = any>(
  path: string,
  body: unknown,
  token?: string
): Promise<T> {
  return portalRequest<T>(path, { method: "POST", token, body });
}
