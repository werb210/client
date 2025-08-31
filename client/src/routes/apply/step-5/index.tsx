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
      <h1 className="text-2xl font-bold mb-4 text-primary">Step 5: Required Documents</h1>

      <section className="panel-success mb-4">
        <div className="text-sm text-gray-700">
          Consolidated from all matching lender products for your selected category.
        </div>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {required.map((k) => (
          <div key={k} className="card">
            <h3 className="font-semibold mb-2">{DOC_LABEL[k]}</h3>
            <span className="badge badge-muted mr-2">Required</span>
            <div className="rounded-xl border border-dashed p-6 text-center text-gray-400">
              Upload disabled for this build
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
