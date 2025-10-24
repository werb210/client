// client/server/db.ts
// Stubbed DB module for client app — no database required

if (process.env.NODE_ENV !== "production") {
  console.warn("[client] Using DB stub — skipping real database connection");
}

// Fake DB interface
export const db = {
  query: async () => [],
  insert: async () => {},
  update: async () => {},
  delete: async () => {},
};

// Prevent DATABASE_URL errors
export const DATABASE_URL = process.env.DATABASE_URL || "local-dev-db";
