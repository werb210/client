import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

export default defineConfig(() => {
  const config = {
    plugins: [react()],
    resolve: {
      alias: {
        "@": resolve(__dirname, "src"),
      },
    },
    build: {
      target: "es2022",
      sourcemap: false,
      minify: "esbuild" as const,
    },
    test: {
      env: {
        NODE_ENV: "test",
        VITE_API_BASE_URL: "http://localhost:3000",
      },
    },
  };

  if (process.env.NODE_ENV === "production") {
    config.build = {
      ...config.build,
      minify: "esbuild",
      ...(config.build || {}),
    };
    (config as any).esbuild = {
      drop: ["console", "debugger"],
    };
  }

  return config;
});
