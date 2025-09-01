import React from 'react';
import { useApp } from '@/store/app';
import { buildRequirements } from '@/lib/docRequirements';

export default function Step5_RequiredDocuments() {
  const { intake, step2, documents, set } = useApp();

  if (!step2) {
    console.error('[Step5] No Step 2 selection in storage – sending user back.');
    return (
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-2">Select a product category first</h2>
        <p>Please return to Step 2 and choose a financing category.</p>
        <a href="/apply/step-2" className="inline-block mt-4 px-4 py-2 rounded bg-emerald-600 text-white">Go to Step 2</a>
      </div>
    );
  }

  const reqs = buildRequirements(intake, step2);

  function formatDocumentLabel(docType: string): string {
    const labels: Record<string, string> = {
      'bank_statements': 'Bank Statements (last 6 months)',
      'financial_statements': 'Business Financial Statements (P&L & Balance Sheet)',
      'ar_aging': 'A/R Aging Report',
      'invoice_samples': 'Sample Invoices (unpaid)',
      'equipment_quote': 'Equipment Quote / Spec Sheet',
      'purchase_orders': 'Purchase Orders'
    };
    return labels[docType] || docType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  return (
    <div className="p-6 space-y-6">
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
        <div className="text-emerald-800 font-medium">
          Required Documents – Authentic Lender Requirements
        </div>
        <div className="text-emerald-700 text-sm">
          Based on your profile (amount: <b>${(intake?.fundingAmount ?? 0).toLocaleString()}</b>, country: <b>{intake?.country ?? '—'}</b>) and your selected category <b>{step2?.selectedCategoryName ?? '—'}</b>.
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {reqs.map(r => (
          <div key={r.id} data-doc-card={r.id} className="rounded-xl border p-4">
            <div className="flex items-center justify-between">
              <div className="font-medium">{r.label}</div>
              <span className={`text-xs px-2 py-1 rounded ${!r.optional ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'}`}>
                {!r.optional ? 'Required' : 'Optional'}
              </span>
            </div>
            {/* hook your existing uploader here; leaving as placeholder */}
            <div className="mt-3 text-sm text-slate-600">Upload area goes here</div>
          </div>
        ))}
      </div>

      <div className="flex justify-between">
        <a href="/apply/step-4" className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300">Back</a>
        <a href="/apply/step-6" className="px-4 py-2 rounded bg-emerald-600 text-white" onClick={(e) => {
          // Track bypassed documents when user continues without uploads
          const bypass = reqs.map(r => r.id).filter(req => {
            const input = document.querySelector(`[data-doc-card="${req}"] input[type="file"]`) as HTMLInputElement;
            return !input?.files?.length;
          });
          
          // Update documents state in Zustand store
          set({
            documents: {
              ...documents,
              bypassedDocuments: bypass
            }
          });
          
          console.log('[Step5] Bypassed documents:', bypass);
        }}>Continue to Final Submission</a>
      </div>
    </div>
  );
}