export function validateEnv() {
  const required = ["VITE_API_BASE_URL"]

  required.forEach((key) => {
    if (!import.meta.env[key]) {
      console.warn(`Missing environment variable: ${key}`)
    }
  })
}
