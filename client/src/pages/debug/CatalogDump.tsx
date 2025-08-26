import React from "react";
import { fetchCatalogNormalized, CanonicalProduct } from "@/lib/catalog";

export default function CatalogDumpPage() {
  const [products, setProducts] = React.useState<CanonicalProduct[]>([]);
  const [err, setErr] = React.useState<string>("");
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    (async () => {
      try {
        const normalized = await fetchCatalogNormalized();
        setProducts(normalized);
      } catch (e: any) {
        setErr(e?.message || String(e));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const canonicalFields = ["id", "name", "lender_id", "lender_name", "country", "category", "min_amount", "max_amount", "interest_rate_min", "interest_rate_max", "term_min", "term_max", "active", "required_documents"];

  if (loading) return <div style={{ padding: 24 }}>Loading catalog data...</div>;

  return (
    <div style={{ padding: 24 }}>
      <h1>Catalog Dump — All Normalized Fields & Values</h1>
      <p>Shows products normalized through catalog system with field aliasing and fallback support.</p>
      
      {err && <pre style={{ color: "crimson", background: "#fff5f5", padding: 12, borderRadius: 4 }}>{err}</pre>}

      <div style={{ marginBottom: 16, padding: 12, background: "#f8f9fa", borderRadius: 4 }}>
        <strong>📊 Summary:</strong> {products.length} products normalized from catalog/legacy endpoints
      </div>

      <details open style={{ marginBottom: 16 }}>
        <summary><b>📋 Canonical Field Schema</b></summary>
        <pre style={{ background: "#f8f9fa", padding: 12, borderRadius: 4 }}>
{canonicalFields.map(f => `  ${f}`).join('\n')}
        </pre>
      </details>

      <div style={{ marginTop: 16 }}>
        {products.map((product, idx) => (
          <div key={product.id} style={{ marginBottom: 16, padding: 12, border: "1px solid #e1e5e9", borderRadius: 8, background: "#fff" }}>
            <div style={{ fontWeight: 700, marginBottom: 8, color: "#0366d6" }}>
              #{idx + 1}: {product.name || "(no name)"} — {product.lender_name || "(no lender)"} — {product.country}/{product.category}
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "monospace", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#f6f8fa" }}>
                  <th align="left" style={{ borderBottom: "1px solid #d0d7de", padding: "8px 12px", width: "220px" }}>Field</th>
                  <th align="left" style={{ borderBottom: "1px solid #d0d7de", padding: "8px 12px" }}>Value</th>
                </tr>
              </thead>
              <tbody>
                {canonicalFields.map((field) => {
                  const value = (product as any)[field];
                  let displayValue;
                  
                  if (value === null || value === undefined) {
                    displayValue = <span style={{ color: "#6a737d", fontStyle: "italic" }}>null</span>;
                  } else if (field === "required_documents") {
                    displayValue = <pre style={{ margin: 0, whiteSpace: "pre-wrap", fontSize: 11 }}>{JSON.stringify(value, null, 2)}</pre>;
                  } else if (typeof value === "boolean") {
                    displayValue = <span style={{ color: value ? "#28a745" : "#dc3545" }}>{String(value)}</span>;
                  } else if (typeof value === "number") {
                    displayValue = <span style={{ color: "#005cc5" }}>{value.toLocaleString()}</span>;
                  } else {
                    displayValue = <span style={{ color: "#032f62" }}>"{value}"</span>;
                  }

                  return (
                    <tr key={field} style={{ borderTop: "1px solid #f1f3f4" }}>
                      <td style={{ verticalAlign: "top", padding: "8px 12px", fontWeight: 500, color: "#24292e" }}>{field}</td>
                      <td style={{ verticalAlign: "top", padding: "8px 12px" }}>{displayValue}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
}