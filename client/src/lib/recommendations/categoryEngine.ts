import type { Product } from '../../api/products'

export type Intake = {
  amountRequested?: number
  loanAmount?: number
  country?: string
  province?: string
  industry?: string
}

export type CategoryCluster = {
  category: string
  products: Product[]
  count: number
  percentage: number
  matchScore: number
}

const LSK = 'bf:step2:category'

export function getSelectedCategory(): string | null {
  try { return localStorage.getItem(LSK) } catch { return null }
}
export function setSelectedCategory(cat: string) {
  try { localStorage.setItem(LSK, cat) } catch {}
}

export function computeCategories(intake: Intake, products: Product[]): CategoryCluster[] {
  const amount = intake.amountRequested ?? intake.loanAmount ?? 0
  const country = (intake.country ?? 'CA').toUpperCase()

  const eligible = products.filter(p => {
    const okCountry = !p.country || String(p.country).toUpperCase() === country
    const min = p.minAmount ?? 0
    const max = p.maxAmount ?? Number.MAX_SAFE_INTEGER
    const okAmount = !amount || (amount >= min && amount <= max)
    return okCountry && okAmount
  })

  const byCat = new Map<string, Product[]>()
  for (const p of eligible) {
    const c = normalizeCategory(p.category || '') || 'Other'
    if (!byCat.has(c)) byCat.set(c, [])
    byCat.get(c)!.push(p)
  }

  const total = eligible.length || 1
  const clusters: CategoryCluster[] = Array.from(byCat.entries()).map(([category, prods]) => {
    const coverage = prods.length / total
    // Simple scoring: availability + coverage
    const score = Math.round( (0.7 * 100) + (coverage * 30) )
    return {
      category,
      products: prods,
      count: prods.length,
      percentage: Math.round(coverage * 100),
      matchScore: Math.min(100, Math.max(70, score))
    }
  })

  // Stable order (your six categories prioritized)
  const order = [
    'Line of Credit',
    'Term Loan',
    'Invoice Factoring',
    'Equipment Financing',
    'Purchase Order Financing',
    'Working Capital'
  ]
  clusters.sort((a,b) => {
    const ia = order.indexOf(a.category); const ib = order.indexOf(b.category)
    if (ia !== -1 && ib !== -1 && ia !== ib) return ia - ib
    if (ia !== -1 && ib === -1) return -1
    if (ib !== -1 && ia === -1) return 1
    return b.matchScore - a.matchScore
  })

  return clusters
}

function normalizeCategory(raw: string): string {
  const s = String(raw || '').toLowerCase().replace(/\s+/g,'_')
  const map: Record<string,string> = {
    line_of_credit: 'Line of Credit',
    loc: 'Line of Credit',
    term_loan: 'Term Loan',
    invoice_factoring: 'Invoice Factoring',
    factoring: 'Invoice Factoring',
    equipment_financing: 'Equipment Financing',
    equipment_finance: 'Equipment Financing',
    purchase_order_financing: 'Purchase Order Financing',
    po_financing: 'Purchase Order Financing',
    working_capital: 'Working Capital',
  }
  return map[s] ?? (raw ? raw : 'Other')
}