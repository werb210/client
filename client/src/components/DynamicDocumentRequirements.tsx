import React from "react";
import { listDocuments, RequiredDoc } from "@/lib/api";

type Props = { category: string; country: string; amount: number };

export default function DynamicDocumentRequirements({ category, country, amount }: Props) {
  const [docs, setDocs] = React.useState<RequiredDoc[]>([]);
  React.useEffect(() => {
    listDocuments({ category, country, amount }).then(setDocs).catch(() => setDocs([]));
  }, [category, country, amount]);

  const items = (docs ?? []).map((d, i) =>
    typeof d === "string" ? { key: `doc_${i}`, label: d, required: true } : d
  );

  return (
    <ul className="space-y-2">
      {items.map((d: any) => (
        <li key={d.key} className="text-sm">
          <span className="font-medium">{d.label}</span>
          {d.required ? <span className="ml-2 text-red-600">(required)</span> : null}
        </li>
      ))}
    </ul>
  );
}