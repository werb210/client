/* Minimal local cache (OPTIONAL). Keep small to avoid duplication creep. */
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
export const doc_master = sqliteTable("doc_master", {
  key: text("key").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category"),
});
export const doc_snapshot = sqliteTable("doc_snapshot", {
  context_hash: text("context_hash").primaryKey(),  // e.g., `${productId}:${lenderId}`
  json: text("json").notNull(),                      // raw array JSON for quick restore
  updated_at: integer("updated_at", { mode:"timestamp_ms" })
});