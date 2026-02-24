import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: "#020C1C",
          surface: "#0E2239",
          accent: "#1E90FF",
          accentHover: "#1877CC"
        },
        subtle: "rgba(255,255,255,0.08)"
      }
    }
  },
  plugins: []
} satisfies Config;
