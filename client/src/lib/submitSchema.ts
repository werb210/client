export type Submission = Record<string, any>

export function ensureSubmissionSchema(input: Submission): Submission {
  const out = { ...input }
  if (!Array.isArray(out.documents)) out.documents = []
  if (typeof out.documentStatus !== 'string') out.documentStatus = 'pending'
  // include selected category for staff visibility
  try {
    const cat = localStorage.getItem('bf:step2:category')
    if (cat) out.selectedCategory = cat
  } catch {}
  return out
}