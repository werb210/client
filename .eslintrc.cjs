/* eslint-env node */
module.exports = {
  root: true,
  extends: ["eslint:recommended", "@typescript-eslint/recommended"],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  rules: {
    // Disallow direct fetch to prevent bypassing API guards
    "no-restricted-syntax": [
      "error",
      {
        "selector": "CallExpression[callee.name='fetch']",
        "message": "Use apiFetch from src/lib/api.ts so Staff host checks are enforced."
      }
    ]
  },
  ignorePatterns: ["dist/", "node_modules/", "server/"]
};