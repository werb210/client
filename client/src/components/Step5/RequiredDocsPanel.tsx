import React from 'react'
import { getRequiredDocsForCategory, type DocRequirement } from '../../lib/docs/rules'
import { getSelectedCategory } from '../../lib/recommendations/categoryEngine'

type Props = {
  onResolved?: (docs: DocRequirement[]) => void
  // If your app already has a FileUploadTile or similar, pass it in and we'll use it.
  UploaderTile?: React.ComponentType<{ docKey:string; label:string; requiredCount:number }>
}

export default function RequiredDocsPanel({ onResolved, UploaderTile }: Props) {
  const [category] = React.useState(getSelectedCategory())
  const [docs, setDocs] = React.useState<DocRequirement[] | null>(null)

  React.useEffect(() => {
    (async () => {
      const d = await getRequiredDocsForCategory(category ?? 'Line of Credit')
      setDocs(d)
      onResolved?.(d)
    })()
  }, [category])

  if (!docs) return <div>Loading requirements…</div>

  return (
    <div className="space-y-4">
      <div className="rounded-md bg-emerald-50 border border-emerald-200 px-4 py-3 text-emerald-800">
        <strong>Required Documents – Authentic Lender Requirements</strong>
        <div className="text-sm">Consolidated from matching lender products for your selections</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {docs.map(d => (
          <div key={d.key} className="rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">{d.label}</h3>
              <span className="text-xs rounded-full bg-rose-50 text-rose-700 px-2 py-1">Required</span>
            </div>
            <div className="text-sm text-gray-600 mb-3">Required: <strong>{d.requiredCount} file{d.requiredCount===1?'':'s'}</strong></div>
            {UploaderTile
              ? <UploaderTile docKey={d.key} label={d.label} requiredCount={d.requiredCount}/>
              : <div className="border-2 border-dashed rounded-lg p-6 text-center text-gray-500">Choose files or drag and drop</div>
            }
          </div>
        ))}
      </div>
    </div>
  )
}