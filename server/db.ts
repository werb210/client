// client/server/db.ts
// Stubbed DB module for client app — no database required

if (process.env.NODE_ENV !== "production") {
  console.warn("[client] Using DB stub — skipping real database connection");
}

// Dummy pool object to satisfy legacy imports
export const pool = {
  query: async (_q?: string, _p?: any[]) => ({ rows: [] }),
  connect: async () => ({ release: () => {} }),
  end: async () => {},
};

// Minimal fake db interface
export const db = {
  query: async () => [],
  insert: async () => {},
  update: async () => {},
  delete: async () => {},
};

export const DATABASE_URL = process.env.DATABASE_URL || "local-dev-db";
