export async function secureFetch(
  url: string,
  init: RequestInit = {}
): Promise<Response> {
  // read CSRF token from cookie or <meta>
  const token =
    document.cookie.split('; ').find(c => c.startsWith('__Host-bf_csrf='))?.split('=')[1] ||
    document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ||
    '';

  const headers = new Headers(init.headers || {});
  if (token) headers.set('X-CSRF-Token', token);

  return fetch(url, {
    ...init,
    headers,
    credentials: 'include', // include cookies for CSRF/session
    keepalive: init.keepalive ?? true,
  });
}