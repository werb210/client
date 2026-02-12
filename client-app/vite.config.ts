import { defineConfig } from "vite";
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
      minify: "esbuild" as const,
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
