// client-app/src/api/ClientAppAPI.ts

export type ApiResult<T = any> = Promise<T>;

async function request<T = any>(
  url: string,
  method: 'GET' | 'POST' | 'PATCH',
  body?: unknown,
  options?: RequestInit
): ApiResult<T> {
  const res = await fetch(url, {
    ...options,
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    throw new Error(`API request failed: ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export const api = {
  get<T = any>(url: string, options?: RequestInit) {
    return request<T>(url, 'GET', undefined, options);
  },

  post<T = any>(url: string, body?: unknown, options?: RequestInit) {
    return request<T>(url, 'POST', body, options);
  },

  patch<T = any>(url: string, body?: unknown, options?: RequestInit) {
    return request<T>(url, 'PATCH', body, options);
  },
};
