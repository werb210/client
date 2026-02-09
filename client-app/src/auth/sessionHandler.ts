import {
  getActiveClientSessionToken,
  markClientSessionExpired,
  markClientSessionRevoked,
} from "../state/clientSession";

function isAuthError(status?: number) {
  return status === 401 || status === 403 || status === 419;
}

export async function handleAuthError(error: any) {
  const status = error?.response?.status;
  if (!isAuthError(status)) {
    return Promise.reject(error);
  }
  const activeToken = getActiveClientSessionToken();
  if (activeToken) {
    if (status === 419) {
      markClientSessionExpired(activeToken);
    } else {
      markClientSessionRevoked(activeToken);
    }
  }
  return Promise.reject(error);
}
