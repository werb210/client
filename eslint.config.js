import js from "@eslint/js";
import tseslint from "typescript-eslint";
import globals from "globals";

export default tseslint.config(
  { ignores: ["dist", ".lighthouseci"] },
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: { project: false, ecmaVersion: "latest", sourceType: "module" },
      globals: { ...globals.browser, ...globals.node }
    },
    plugins: { "@typescript-eslint": tseslint.plugin },
    rules: {
      ...js.configs.recommended.rules,
      ...tseslint.configs.recommendedTypeChecked[1].rules,
      "@typescript-eslint/no-explicit-any": "off",
      "no-console": "warn"
    }
  }
);
