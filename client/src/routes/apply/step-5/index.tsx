import React, { useEffect, useMemo, useState } from "react";
import { DOC_LABEL, docsForCategory } from "../../../lib/docRules";

const LS_CAT = "bf:step2:category";
const LS_FORM = "bf:intake";

export default function Step5() {
  const [answers, setAnswers] = useState<any>({});
  const [category, setCategory] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(LS_FORM);
      if (raw) setAnswers(JSON.parse(raw));
    } catch {}
    const c = window.localStorage.getItem(LS_CAT);
    if (c) setCategory(c);
  }, []);

  const required = useMemo(() => docsForCategory(category as any), [category]);

  return (
    <main className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Step 5: Required Documents</h1>

      <section className="rounded-2xl border p-4 mb-4">
        <div className="text-sm text-gray-700">
          Consolidated from all matching lender products for your selected category.
        </div>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {required.map((k) => (
          <div key={k} className="rounded-2xl border p-4">
            <h3 className="font-semibold mb-2">{DOC_LABEL[k]}</h3>
            <div className="text-sm text-gray-500 mb-2">Required</div>
            <div className="text-xs text-gray-400">Upload disabled in this build</div>
          </div>
        ))}
      </section>
    </main>
  );
}
