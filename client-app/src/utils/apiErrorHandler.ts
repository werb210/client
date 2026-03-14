export function handleApiError(err: any) {
  if (err?.response?.status === 401) {
    sessionStorage.removeItem("boreal_client_token");
    window.location.reload();
  }

  console.error("API error:", err);
}
