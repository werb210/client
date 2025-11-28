import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// IMPORTANT:
// Vite requires an absolute root for nested client-app folders.
// Also, Azure static deployments require correct base + build.outDir.

export default defineConfig({
  root: ".",
  plugins: [react()],

  server: {
    port: 5173,
    strictPort: true,
  },

  preview: {
    port: 4173,
    strictPort: true,
  },

  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: false,
    manifest: false,
  },

  resolve: {
    alias: {
      "@": "/src",
    },
  },
});
