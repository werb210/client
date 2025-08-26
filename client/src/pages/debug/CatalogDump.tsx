import React from "react";
import { fetchCatalogDump } from "@/lib/api";

export default function CatalogDumpPage() {
  const [canon, setCanon] = React.useState<string[]>([]);
  const [rows, setRows] = React.useState<Record<string, any>[]>([]);
  const [err, setErr] = React.useState<string>("");

  React.useEffect(() => {
    (async () => {
      try {
        const { canonical_fields, products } = await fetchCatalogDump({ limit: 500 });
        setCanon(canonical_fields);
        setRows(products);
      } catch (e:any) {
        setErr(e?.message || String(e));
      }
    })();
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h1>Catalog Dump — All Fields, All Values</h1>
      {err && <pre style={{ color: "crimson" }}>{err}</pre>}

      <details open>
        <summary><b>Canonical fields (order)</b></summary>
        <pre>{JSON.stringify(canon, null, 2)}</pre>
      </details>

      <div style={{ marginTop: 16 }}>
        {rows.map((p, idx) => (
          <div key={p.id ?? idx} style={{ marginBottom: 16, padding: 12, border: "1px solid #eee", borderRadius: 8 }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>
              {p.name || "(no name)"} — {p.lender_name || "(no lender)"} — {p.country}/{p.category}
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "monospace", fontSize: 13 }}>
              <thead>
                <tr>
                  <th align="left" style={{ borderBottom: "1px solid #ddd" }}>field</th>
                  <th align="left" style={{ borderBottom: "1px solid #ddd" }}>value</th>
                </tr>
              </thead>
              <tbody>
                {canon.map((f) => (
                  <tr key={f} style={{ borderTop: "1px solid #f3f3f3" }}>
                    <td style={{ verticalAlign: "top", padding: "4px 8px", width: 220 }}>{f}</td>
                    <td style={{ verticalAlign: "top", padding: "4px 8px" }}>
                      <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>{JSON.stringify(p[f] ?? null)}</pre>
                    </td>
                  </tr>
                ))}
                {/* Also show any unexpected extra fields so drift is visible */}
                {Object.keys(p).filter(k => !canon.includes(k)).map((extra) => (
                  <tr key={`extra_${extra}`} style={{ background: "#fffaf0" }}>
                    <td style={{ verticalAlign: "top", padding: "4px 8px" }}>{extra} (extra)</td>
                    <td style={{ verticalAlign: "top", padding: "4px 8px" }}>
                      <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>{JSON.stringify(p[extra])}</pre>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
}