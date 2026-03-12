export function getToken() {
  return sessionStorage.getItem("boreal_client_token")
}

export function setToken(token: string) {
  sessionStorage.setItem("boreal_client_token", token)
}

export function clearToken() {
  sessionStorage.removeItem("boreal_client_token")
}
