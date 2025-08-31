import React, { useEffect, useMemo, useState } from 'react'

type Props = {
  products: Array<{ category?: string }>
  onChange?: (cats: string[]) => void
}

export default function CategoryPicker({ products, onChange }: Props) {
  const categories = useMemo(() => {
    const s = new Set<string>()
    for (const p of products) if (p.category) s.add(p.category)
    return Array.from(s).sort()
  }, [products])

  const [selected, setSelected] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem('bf:step2:categories')
      return raw ? JSON.parse(raw) : []
    } catch { return [] }
  })

  useEffect(() => {
    localStorage.setItem('bf:step2:categories', JSON.stringify(selected))
    onChange?.(selected)
  }, [selected, onChange])

  if (!categories.length) return null

  function toggle(cat: string) {
    setSelected(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat])
  }

  return (
    <div style={{margin:'8px 0', padding:'8px', border:'1px solid #e5e7eb', borderRadius:8}}>
      <strong>Filter by product category</strong>
      <div style={{display:'flex', flexWrap:'wrap', gap:8, marginTop:8}}>
        {categories.map(cat => (
          <button
            key={cat}
            type="button"
            onClick={() => toggle(cat)}
            style={{
              padding:'6px 10px',
              borderRadius:999,
              border: selected.includes(cat) ? '2px solid #111' : '1px solid #d1d5db',
              background: selected.includes(cat) ? '#f3f4f6' : '#fff',
              cursor:'pointer'
            }}
            aria-pressed={selected.includes(cat)}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  )
}

// injected: local-first products fetch
import { getProducts, loadSelectedCategories } from "../api/products";
/* injected load on mount (pseudo):
useEffect(() => { (async () => {
  const cats = loadSelectedCategories();
  const products = await getProducts({ useCacheFirst: true });
  // apply category filter if present
  const selected = cats && cats.length ? products.filter(p => cats.includes((p.category||"").toLowerCase())) : products;
  setState({ products: selected });
})(); }, []);
*/
