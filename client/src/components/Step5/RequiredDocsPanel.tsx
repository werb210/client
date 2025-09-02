import React from 'react'
import { getDocumentRequirementsIntersection } from '../../lib/documentIntersection'
import { getSelectedCategory } from '../../lib/recommendations/categoryEngine'
import { useFormData } from '../../context/FormDataContext'

interface DocumentResult {
  eligibleLenders: any[];
  requiredDocuments: string[];
  message: string;
  hasMatches: boolean;
}

type Props = {
  onResolved?: (docs: string[]) => void
  // If your app already has a FileUploadTile or similar, pass it in and we'll use it.
  UploaderTile?: React.ComponentType<{ docKey:string; label:string; requiredCount:number }>
}

export default function RequiredDocsPanel({ onResolved, UploaderTile }: Props) {
  const { data: formData } = useFormData()
  const [category] = React.useState(getSelectedCategory())
  const [documentResult, setDocumentResult] = React.useState<DocumentResult | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    (async () => {
      setLoading(true)
      try {
        // Get Step 1 data for business location and funding amount
        const businessLocation = formData?.step1?.businessLocation || formData?.businessLocation || 'US'
        const fundingAmount = formData?.step1?.fundingAmount || formData?.fundingAmount || 0
        
        // Get Step 2 selected category
        const selectedCategory = category || formData?.selectedCategory || 'Line of Credit'
        
        console.log('🔍 Step 5: Using data from previous steps:', {
          businessLocation,
          fundingAmount,
          selectedCategory
        })

        // Use the sophisticated intersection logic instead of generic rules
        const result = await getDocumentRequirementsIntersection(
          selectedCategory,
          businessLocation,
          fundingAmount
        )
        
        setDocumentResult(result)
        onResolved?.(result.requiredDocuments)
      } catch (error) {
        console.error('❌ Step 5: Error getting document requirements:', error)
        setDocumentResult({
          eligibleLenders: [],
          requiredDocuments: ['Bank Statements', 'Financial Statements'],
          message: 'Using default requirements due to error',
          hasMatches: false
        })
      } finally {
        setLoading(false)
      }
    })()
  }, [category, formData])

  if (loading) return <div>Loading personalized requirements…</div>
  if (!documentResult) return <div>Unable to load requirements</div>

  return (
    <div className="space-y-4">
      <div className="rounded-md bg-emerald-50 border border-emerald-200 px-4 py-3 text-emerald-800">
        <strong>Required Documents – Personalized for Your Application</strong>
        <div className="text-sm">
          {documentResult.hasMatches 
            ? `Based on ${documentResult.eligibleLenders.length} eligible lender(s) for your selections`
            : documentResult.message
          }
        </div>
      </div>

      {documentResult.hasMatches && documentResult.eligibleLenders.length > 0 && (
        <div className="rounded-md bg-blue-50 border border-blue-200 px-4 py-2 text-blue-800 text-sm">
          <strong>Eligible Lenders:</strong> {documentResult.eligibleLenders.map(l => l.lenderName || l.name).join(', ')}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {documentResult.requiredDocuments.map((docName, index) => (
          <div key={`${docName}-${index}`} className="rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">{docName}</h3>
              <span className="text-xs rounded-full bg-rose-50 text-rose-700 px-2 py-1">Required</span>
            </div>
            <div className="text-sm text-gray-600 mb-3">Required: <strong>1 file</strong></div>
            {UploaderTile
              ? <UploaderTile docKey={docName.toLowerCase().replace(/\s+/g, '_')} label={docName} requiredCount={1}/>
              : <div className="border-2 border-dashed rounded-lg p-6 text-center text-gray-500">Choose files or drag and drop</div>
            }
          </div>
        ))}
      </div>
    </div>
  )
}