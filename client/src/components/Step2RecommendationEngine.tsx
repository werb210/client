import React from "react";
import { recommendProducts, type CategoryRecommendation, type IntakeInput } from "@/lib/api";

type Props = {
  intake: IntakeInput; // { amount, country, timeInBusinessMonths?, monthlyRevenue?, creditScore? }
  onSelectProduct?: (p: any) => void;
};

function Step2RecommendationEngine({ intake, onSelectProduct }: Props) {
  const [groups, setGroups] = React.useState<CategoryRecommendation[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true); setErr(null);
      try {
        const recs = await recommendProducts(intake);
        if (mounted) setGroups(recs);
      } catch (e: any) {
        if (mounted) setErr(e?.message ?? "Failed to load recommendations");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [intake?.amount, intake?.country, intake?.category, intake?.timeInBusinessMonths, intake?.monthlyRevenue, intake?.creditScore]);

  if (loading) return <div>Finding matches…</div>;
  if (err) return <div style={{ color: "crimson" }}>{err}</div>;
  if (!groups.length) return <div>No matching products for your criteria.</div>;

  return (
    <div style={{ display: "grid", gap: 16 }}>
      {groups.map(g => (
        <div key={g.category} style={{ border: "1px solid #eee", borderRadius: 8, padding: 12 }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>{g.category}</div>
          <ul style={{ margin: 0, paddingLeft: 16 }}>
            {g.products.map(p => (
              <li key={p.id} style={{ marginBottom: 6 }}>
                <button onClick={() => onSelectProduct?.(p)} style={{ all: "unset", cursor: "pointer" }}>
                  {p.name} — {p.lender_name} · {p.country} · ${(p.min_amount || 0).toLocaleString()}–${(p.max_amount || 0).toLocaleString()}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export default Step2RecommendationEngine;
export { Step2RecommendationEngine };