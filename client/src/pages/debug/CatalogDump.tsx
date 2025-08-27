import React from "react";
import { fetchCatalogDump, type CanonicalField, type CanonicalProduct } from "@/lib/api";

export default function CatalogDump() {
  const [fields, setFields] = React.useState<CanonicalField[]>([]);
  const [rows, setRows] = React.useState<CanonicalProduct[]>([]);
  const [err, setErr] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    (async () => {
      try {
        const { canonical_fields, products } = await fetchCatalogDump(500);
        setFields(canonical_fields);
        setRows(products);
      } catch (e: any) {
        setErr(e?.message ?? "Failed to load catalog");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div style={{ padding: 16 }}>Loading catalog data…</div>;
  if (err) return <div style={{ color: "crimson", padding: 16 }}>Error: {err}</div>;

  const cols = fields.map((f) => f.name);

  const asText = (v: any) => {
    if (v == null) return "";
    if (Array.isArray(v)) {
      return v
        .map((d) => (typeof d === "string" ? d : d?.label ?? JSON.stringify(d)))
        .join(" • ");
    }
    if (typeof v === "object") return JSON.stringify(v);
    if (typeof v === "number") return v.toLocaleString();
    return String(v);
  };

  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ marginBottom: 8 }}>Catalog Dump (Canonical Fields)</h1>
      <div style={{ marginBottom: 12, fontFamily: "monospace" }}>
        Fields: {cols.join(", ")}
      </div>
      <div style={{ overflowX: "auto", border: "1px solid #eee", borderRadius: 8 }}>
        <table style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr>
              {cols.map((c) => (
                <th
                  key={c}
                  style={{
                    textAlign: "left",
                    padding: "8px 10px",
                    borderBottom: "1px solid #ddd",
                    background: "#fafafa",
                    whiteSpace: "nowrap",
                    fontWeight: 600,
                  }}
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={(r as any).id ?? i}>
                {cols.map((c) => (
                  <td key={c} style={{ padding: "6px 10px", borderBottom: "1px solid #f3f3f3", verticalAlign: "top" }}>
                    {asText((r as any)[c])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p style={{ marginTop: 10, color: "#666" }}>
        Source: Prefer <code>/api/catalog/dump</code>; falls back to legacy and normalizes.
      </p>
    </div>
  );
}