export const API_URL =
  process.env.NODE_ENV === "production"
    ? "https://staff.boreal.financial/api/applications"
    : "http://localhost:5000/api/applications";