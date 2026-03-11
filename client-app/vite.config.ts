import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: true,
    minify: false,
    target: "es2020",
  },
  esbuild: {
    drop: process.env.NODE_ENV === "production" ? ["console", "debugger"] : [],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@twilio/voice-sdk": path.resolve(__dirname, "src/shims/twilio-voice-sdk.ts"),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
  },
});
