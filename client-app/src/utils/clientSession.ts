export function saveClientSession(token: string, applicationId: string) {
  localStorage.setItem("clientToken", token);
  localStorage.setItem("applicationId", applicationId);
}

export function clearClientSession() {
  localStorage.removeItem("clientToken");
  localStorage.removeItem("applicationId");
}

export function getSession() {
  return {
    token: localStorage.getItem("clientToken"),
    applicationId: localStorage.getItem("applicationId"),
  };
}
