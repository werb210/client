const API_BASE =
  import.meta.env.PROD
    ? "https://api.boreal.financial"
    : "http://localhost:3000";

export default API_BASE;
