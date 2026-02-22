import { useMayaSession } from "../store/mayaSession";

export function QualificationSummary() {
  const session = useMayaSession();

  return (
    <div style={{ marginTop: "0.75rem" }}>
      <p>Funding: {session.funding_amount ?? "—"}</p>
      <p>Revenue: {session.annual_revenue ?? "—"}</p>
      <p>Time in Business: {session.time_in_business ?? "—"}</p>
      <p>Product: {session.product_type ?? "—"}</p>
      <p>Industry: {session.industry ?? "—"}</p>
    </div>
  );
}
