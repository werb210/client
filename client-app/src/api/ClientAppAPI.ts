// client-app/src/api/ClientAppAPI.ts

export type ApiResult<T> = Promise<T>;

async function request<T>(
  url: string,
  method: 'GET' | 'POST' | 'PATCH',
  body?: unknown,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(url, {
    ...options,
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers ?? {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    throw new Error(`API request failed: ${res.status}`);
  }

  const data = await res.json();

  return data as T;
}

export const api = {
  get<T>(url: string, options?: RequestInit) {
    return request<T>(url, 'GET', undefined, options);
  },

  post<T>(url: string, body?: unknown, options?: RequestInit) {
    return request<T>(url, 'POST', body, options);
  },

  patch<T>(url: string, body?: unknown, options?: RequestInit) {
    return request<T>(url, 'PATCH', body, options);
  },
};
