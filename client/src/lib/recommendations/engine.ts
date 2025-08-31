// Category-based recommendation shim (engine logic removed by design).
// Keeps same export name to avoid widespread import churn.
export type Product = {
  id: string
  name?: string
  productName?: string
  category?: string
  country?: string
  minAmount?: number
  maxAmount?: number
  [k: string]: any
}
export type Intake = {
  amountRequested?: number
  loanAmount?: number
  amount?: number
  country?: string
  [k: string]: any
}

function getAmount(form: Intake) {
  return form.amountRequested ?? form.loanAmount ?? form.amount ?? 0
}

function countryOk(prod: Product, formCountry?: string) {
  if (!formCountry) return true
  const pc = (prod.country || '').toUpperCase()
  const fc = (formCountry || '').toUpperCase()
  return !pc || pc === fc
}

export function getAvailableCategories(products: Product[]): string[] {
  const set = new Set<string>()
  for (const p of products) if (p.category) set.add(p.category)
  return [...set].sort()
}

export function getRecommendedProducts(
  form: Intake,
  products: Product[],
  opts?: { categories?: string[] }
): Product[] {
  const amount = getAmount(form)
  // Read user-selected categories from opts or localStorage
  const chosen =
    opts?.categories ??
    (() => {
      try {
        const raw = localStorage.getItem('bf:step2:categories')
        return raw ? JSON.parse(raw) : []
      } catch { return [] }
    })()

  return products.filter(p => {
    // basic safety gates to avoid nonsense:
    const amtOk =
      (!p.minAmount || amount >= p.minAmount) &&
      (!p.maxAmount || amount <= p.maxAmount)
    const ctgOk = !chosen?.length || (p.category ? chosen.includes(p.category) : false)
    const ctryOk = countryOk(p, form.country)
    return amtOk && ctgOk && ctryOk
  })
}

// default export for existing imports
export default getRecommendedProducts