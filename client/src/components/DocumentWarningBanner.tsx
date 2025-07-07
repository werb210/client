import { useFormData } from '@/context/FormDataContext';
import { Link } from 'wouter';

export function DocumentWarningBanner() {
  const { state } = useFormData();
  
  // Only show if documents were bypassed and no documents uploaded
  if (!state.bypassedDocuments || (state.uploadedDocuments && state.uploadedDocuments.length > 0)) {
    return null;
  }

  return (
    <Link
      to={`/upload-documents/${state.applicationId}`}
      className="block bg-yellow-50 p-3 text-center text-sm text-yellow-800 hover:bg-yellow-100 transition-colors"
    >
      📑 Required documents pending – click here to upload
    </Link>
  );
}