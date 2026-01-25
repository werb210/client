import { useEffect, useState } from "react";
import {
  getClientLenderProducts,
  ClientLenderProduct,
} from "../../api/lenders";

export default function SelectProduct({
  onSelect,
}: {
  onSelect: (p: ClientLenderProduct) => void;
}) {
  const [rows, setRows] = useState<ClientLenderProduct[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    getClientLenderProducts()
      .then(setRows)
      .catch(() => setErr("Failed to load products"));
  }, []);

  if (err) return <div role="alert">{err}</div>;

  return (
    <div>
      <h2>Select a Product</h2>
      <ul>
        {rows.map((p) => (
          <li key={p.id}>
            <button onClick={() => onSelect(p)}>
              {p.lender_name} — {p.name} ({p.product_type})
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
