import React from "react";
import { listDocuments, type RequiredDoc, type RequiredDocsInput } from "@/lib/api";

type Props = {
  context: RequiredDocsInput; // must include category; country/amount optional
};

export default function DynamicDocumentRequirements({ context }: Props) {
  const [docs, setDocs] = React.useState<RequiredDoc[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true); setErr(null);
      try {
        const d = await listDocuments(context);
        if (mounted) setDocs(d);
      } catch (e: any) {
        if (mounted) setErr(e?.message ?? "Failed to load document list");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [context.category, context.country, context.amount, context.lenderId, context.timeInBusinessMonths, context.monthlyRevenue, context.creditScore]);

  if (loading) return <div>Loading required documents…</div>;
  if (err) return <div style={{ color: "crimson" }}>{err}</div>;

  const items = docs.map((d, i) => (typeof d === "string" ? { key: `doc_${i}`, label: d, required: true } : d));

  return (
    <div style={{ display: "grid", gap: 8 }}>
      {items.map(d => (
        <label key={d.key} style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input type="checkbox" defaultChecked={false} aria-label={d.label} />
          <span>{d.label}{d.required ? " *" : ""}{(d as any).months ? ` (${(d as any).months} months)` : ""}</span>
        </label>
      ))}
    </div>
  );
}