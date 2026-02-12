export function checkEnv() {
  const required = ["VITE_API_BASE_URL"];
  const missing = required.filter(
    (key) => !(import.meta.env as Record<string, string | undefined>)[key]
  );

  if (missing.length) {
    console.error("Missing ENV:", missing);
  }
}
