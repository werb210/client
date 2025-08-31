import React from 'react'
import { getProducts, type Product } from '../../api/products'
import { computeCategories, getSelectedCategory, setSelectedCategory, type Intake } from '../../lib/recommendations/categoryEngine'

type Props = {
  intake: Intake
  onSelect: (category: string, products: Product[]) => void
}

export default function CategoryCards({ intake, onSelect }: Props) {
  const [loading, setLoading] = React.useState(true)
  const [clusters, setClusters] = React.useState<ReturnType<typeof computeCategories>>([])
  const [error, setError] = React.useState<string | null>(null)
  const selected = getSelectedCategory()

  React.useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const products = await getProducts()
        if (!alive) return
        const cs = computeCategories(intake, products)
        setClusters(cs)
      } catch (e:any) {
        setError(e?.message ?? 'Failed to load categories')
      } finally {
        setLoading(false)
      }
    })()
    return () => { alive = false }
  }, [JSON.stringify(intake)])

  if (loading) return <div>Loading categories…</div>
  if (error) return <div className="text-red-600">{error}</div>
  if (!clusters.length) return <div>No eligible categories found for your profile.</div>

  return (
    <div className="space-y-4">
      {clusters.map((c) => (
        <div key={c.category} className="rounded-xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-start gap-4 justify-between">
            <div>
              <h3 className="text-lg font-semibold">{c.category}</h3>
              <div className="mt-1 text-sm text-gray-600">
                <strong>{c.count}</strong> product{c.count===1?'':'s'} available &middot; Market share ~{c.percentage}% &middot; Match score {c.matchScore}%
              </div>
              <ul className="mt-2 list-disc pl-5 text-sm text-emerald-700">
                <li>Matches your funding requirement</li>
                <li>Available in your region ({(intake.country ?? 'CA').toUpperCase()})</li>
              </ul>
            </div>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 text-sm px-3 py-1">
                {c.matchScore}% Match
              </span>
              <button
                className={`px-4 py-2 rounded-lg text-sm font-medium border ${
                  selected === c.category ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-emerald-700 border-emerald-600'
                }`}
                onClick={() => { setSelectedCategory(c.category); onSelect(c.category, c.products) }}
                aria-label={`Select ${c.category}`}
              >
                {selected === c.category ? 'Selected' : 'Select'}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}