export function requireSession() {
  const session = localStorage.getItem("client_session");
  if (!session) {
    window.location.href = "/apply/step-1";
  }
}
