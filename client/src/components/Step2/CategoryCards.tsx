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
  // Use local state for selection that syncs with localStorage
  const [selected, setSelected] = React.useState<string | null>(null)
  
  // Sync with localStorage on mount
  React.useEffect(() => {
    const saved = getSelectedCategory()
    if (saved) setSelected(saved)
  }, [])

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

  // Force state update when selection changes
  const [, forceUpdate] = React.useReducer(x => x + 1, 0)

  if (loading) return <div>Loading categories…</div>
  if (error) return <div className="text-red-600">{error}</div>
  if (!clusters.length) return <div>No eligible categories found for your profile.</div>

  return (
    <div className="space-y-4">
      {clusters.map((c) => (
        <div key={c.category} className="category-card-wrapper relative">
          <button
            type="button"
            data-testid={`cat-${c.category}`}
            aria-pressed={selected === c.category}
            onClick={(e) => { 
              e.preventDefault();
              e.stopPropagation();
              console.log('Category clicked:', c.category);
              setSelected(c.category); // Update local state
              setSelectedCategory(c.category); 
              onSelect(c.category, c.products);
              // Ensure localStorage persistence matches categoryEngine
              try { 
                localStorage.setItem('bf:step2:category', c.category); 
                console.log('Saved to localStorage:', c.category);
              } catch {}
            }}
            className={[
              "w-full text-left rounded-xl border transition shadow-sm",
              "px-5 py-4",
              selected === c.category
                ? "border-emerald-400 ring-2 ring-emerald-300 bg-emerald-50"
                : "border-gray-200 hover:border-gray-300 hover:bg-gray-50",
              "pointer-events-auto focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
            ].join(' ')}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-slate-900 font-semibold text-lg">{c.category}</div>
                <div className="mt-1 text-gray-600 text-sm">
                  <strong>{c.count}</strong> product{c.count===1?'':'s'} available · Market share ~{c.percentage}% · Match score {c.matchScore}%
                </div>
                <ul className="mt-2 text-sm text-emerald-700 list-disc ml-5">
                  <li>Matches your funding requirement</li>
                  <li>Available in your region ({(intake.country ?? 'CA').toUpperCase()})</li>
                </ul>
              </div>
              <div>
                <span
                  className={[
                    "inline-flex items-center rounded-full px-3 py-1 text-sm",
                    selected === c.category ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-700"
                  ].join(' ')}
                >
                  {selected === c.category ? 'Selected' : 'Select'}
                </span>
              </div>
            </div>
          </button>
        </div>
      ))}
    </div>
  )
}