import React from "react";
import { getCatalogFields, getCatalogSample, fetchCatalogNormalized } from "@/lib/api";

export default function CatalogFieldsPage() {
  const [fields, setFields] = React.useState<any[]>([]);
  const [aliases, setAliases] = React.useState<Record<string,string>>({});
  const [sample, setSample] = React.useState<any>(null);
  const [rows, setRows] = React.useState<any[]>([]);
  const [err, setErr] = React.useState<string>("");

  React.useEffect(() => {
    (async () => {
      try {
        const meta = await getCatalogFields();
        setFields(meta.canonical_fields || []);
        setAliases(meta.legacy_aliases || {});
        const s = await getCatalogSample();
        setSample(s?.sample ?? null);
        const { products } = await fetchCatalogNormalized(10);
        setRows(products);
      } catch (e:any) {
        setErr(e?.message || String(e));
      }
    })();
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h1>Catalog: Canonical Fields</h1>
      {err && <pre style={{ color: "crimson" }}>{err}</pre>}

      <h2>Field Schema</h2>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th align="left">name</th>
            <th align="left">type</th>
            <th align="left">required</th>
            <th align="left">values</th>
            <th align="left">source</th>
            <th align="left">legacy aliases</th>
          </tr>
        </thead>
        <tbody>
          {fields.map((f:any) => (
            <tr key={f.name} style={{ borderTop: "1px solid #eee" }}>
              <td>{f.name}</td>
              <td>{f.type}</td>
              <td>{String(f.required)}</td>
              <td>{Array.isArray(f.values) ? f.values.join(", ") : ""}</td>
              <td>{f.source || ""}</td>
              <td>{
                Object.entries(aliases).filter(([,canon]) => canon === f.name)
                  .map(([legacy]) => legacy).join(", ")
              }</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 style={{ marginTop: 24 }}>Sample (server-normalized)</h2>
      <pre>{JSON.stringify(sample, null, 2)}</pre>

      <h2 style={{ marginTop: 24 }}>First 10 Products (client-normalized)</h2>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th align="left">name</th>
            <th align="left">lender_name</th>
            <th align="left">country</th>
            <th align="left">category</th>
            <th align="right">min_amount</th>
            <th align="right">max_amount</th>
            <th align="left">required_documents</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r:any) => (
            <tr key={r.id} style={{ borderTop: "1px solid #eee" }}>
              <td>{r.name}</td>
              <td>{r.lender_name || ""}</td>
              <td>{r.country}</td>
              <td>{r.category}</td>
              <td align="right">{r.min_amount ?? ""}</td>
              <td align="right">{r.max_amount ?? ""}</td>
              <td>{Array.isArray(r.required_documents) ? r.required_documents.length : 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}