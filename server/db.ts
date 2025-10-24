// client/server/db.ts
// Stubbed database module for client app (no actual DB connection)

import path from "path";

if (process.env.NODE_ENV !== "production") {
  console.warn(
    "[client/server/db.ts] Using local stub — no database connection required."
  );
}

export const db = {
  query: async () => [],
  insert: async () => {},
  update: async () => {},
  delete: async () => {},
};

export const DATABASE_URL =
  process.env.DATABASE_URL || path.resolve("./dev.db");
