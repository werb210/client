import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
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
