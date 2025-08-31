export type DocRequirement = {
  key: string            // e.g., 'bank_statements'
  label: string          // 'Bank Statements'
  requiredCount: number  // e.g., 6
}

const base: DocRequirement[] = [
  { key: 'bank_statements', label: 'Bank Statements', requiredCount: 6 },
  { key: 'financial_statements', label: 'Financial Statements', requiredCount: 3 },
]

const byCategory: Record<string, DocRequirement[]> = {
  'Term Loan': [...base, { key: 'cash_flow', label: 'Cash Flow Statement', requiredCount: 1 }],
  'Equipment Financing': [...base, { key: 'equipment_quote', label: 'Equipment Quote', requiredCount: 1 }],
  'Invoice Factoring': [...base, { key: 'ar_aging', label: 'A/R Aging', requiredCount: 1 }],
  'Purchase Order Financing': [...base, { key: 'purchase_orders', label: 'Purchase Orders', requiredCount: 1 }],
  'Line of Credit': base,
  'Working Capital': base,
}

export async function getRequiredDocsForCategory(category: string): Promise<DocRequirement[]> {
  // Try staff endpoint if available (external shape may vary)
  const extUrl = (import.meta.env.VITE_STAFF_API_URL ?? 'https://staff.boreal.financial/api') + '/required-docs'
  try {
    const res = await fetch(extUrl)
    if (res.ok) {
      const j = await res.json()
      const arr = (j?.required_documents ?? j?.items ?? []) as any[]
      if (Array.isArray(arr) && arr.length) {
        // If external returns strings, map to labels
        const map: DocRequirement[] = arr.map((s: any) => {
          const key = String(s.key ?? s).toLowerCase().replace(/\s+/g,'_')
          const label = s.label ?? s.name ?? String(s)
          const requiredCount = Number(s.requiredCount ?? 1)
          return { key, label, requiredCount: Number.isFinite(requiredCount) ? requiredCount : 1 }
        })
        // Keep only those that match our chosen category base set (if provided)
        const local = byCategory[category] ?? base
        const keys = new Set(local.map(d => d.key))
        const merged = map.filter(d => keys.has(d.key))
        return merged.length ? merged : local
      }
    }
  } catch { /* ignore */ }
  // Local fallback
  return byCategory[category] ?? base
}