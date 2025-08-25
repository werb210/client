import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { apiFetch } from '@/lib/api';
import { UploadedFile } from '@/types/uploadedFile';
import { DynamicDocumentRequirements } from '@/components/DynamicDocumentRequirements';

interface DocumentRule {
  category: string;
  required: boolean;
  description: string;
}

export default function LateUpload() {
  const { id } = useParams(); // application ID
  const [rules, setRules] = useState<DocumentRule[]>([]);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (id) {
      apiFetch(`/api/public/applications/${id}/required-docs`)
        .then(response => response.json())
        .then(data => setRules(data.rules))
        .catch(console.error);
    }
  }, [id]);

  const handleUploadComplete = async (newFiles: UploadedFile[]) => {
    try {
      const formData = new FormData();
      newFiles.forEach((file, index) => {
        formData.append(`files`, file.file);
        formData.append(`documentType_${index}`, file.documentType);
      });
      
      await apiFetch(`/api/applications/${id}/documents`, {
        method: 'POST',
        body: formData,
      });
      setLocation('/upload-complete');
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-4xl px-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Upload Required Documents
          </h1>
          <p className="text-gray-600">
            Application ID: <span className="font-mono">{id}</span>
          </p>
        </div>
        
        <DynamicDocumentRequirements
          applicationId={id || ''}
          existingFiles={files}
          onFilesChange={setFiles}
          onComplete={handleUploadComplete}
        />
      </div>
    </div>
  );
}