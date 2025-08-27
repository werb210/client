import { useEffect, useState } from "react";
import { listDocuments, type RequiredDocsInput } from "@/lib/api";

type Item = { key: string; label: string; required: boolean; months?: number };

export default function DynamicDocumentRequirements(props: RequiredDocsInput) {
  const [docs, setDocs] = useState<Item[]>([]);
  useEffect(() => {
    listDocuments(props).then(arr => {
      const normalized = (arr ?? []).map((d: any, i: number) =>
        typeof d === "string" ? { key: `doc_${i}`, label: d, required: true } : d
      );
      setDocs(normalized);
    });
  }, [props.category, props.country, props.amount, props.lenderId]);

  return (
    <div>
      <h3 className="text-lg font-semibold">Required Documents</h3>
      <ul className="mt-2 space-y-2">
        {docs.map(d => (
          <li key={d.key} className="flex items-center gap-2">
            <input type="checkbox" defaultChecked={d.required} disabled />
            <span>{d.label}{d.months ? ` (${d.months} months)` : ""}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}