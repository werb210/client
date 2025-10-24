// client/server/db.ts
// Stubbed DB module for client app — no database required

if (process.env.NODE_ENV !== "production") {
  console.warn("[client] Using DB stub — skipping real database connection");
}

// Export a fake DB interface so imports elsewhere don’t break
export const db = {
  query: async () => [],
  insert: async () => {},
  update: async () => {},
  delete: async () => {},
};

// This line prevents “DATABASE_URL must be set” errors
export const DATABASE_URL = process.env.DATABASE_URL || "local-dev-db";
