import { refreshSessionOnce } from "./sessionRefresh";

type RetryRequest = (config: any) => Promise<any>;

function isAuthError(status?: number) {
  return status === 401 || status === 403 || status === 419;
}

export async function handleAuthError(error: any, retryRequest: RetryRequest) {
  const status = error?.response?.status;
  const config = error?.config;

  if (!config || config.__retryAuth) {
    return Promise.reject(error);
  }

  if (!isAuthError(status) || config.__skipAuthRefresh) {
    return Promise.reject(error);
  }

  const refreshed = await refreshSessionOnce();
  if (!refreshed) {
    return Promise.reject(error);
  }

  config.__retryAuth = true;
  return retryRequest(config);
}
