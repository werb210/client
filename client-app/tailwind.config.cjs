/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        borealBlue: "#1E88E5",
        borealGreen: "#4CAF50",
        borealGray: "#F5F7FA",
        borealText: "#1A1A1A",
      },
      borderRadius: {
        xl: "14px",
        lg: "10px",
      }
    },
  },
  plugins: [],
};
