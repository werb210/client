/**
 * ✅ FALLBACK STATUS BANNER
 * Shows warning when documents are in fallback mode and may be lost
 */

import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { hasFallbackDocuments, getFallbackDocuments, getFallbackDocumentCount } from '@/utils/fallbackUploadQueue';

interface FallbackStatusBannerProps {
  applicationId: string;
  onRetryAll?: () => void;
}

export function FallbackStatusBanner({ applicationId, onRetryAll }: FallbackStatusBannerProps) {
  const hasFallback = hasFallbackDocuments(applicationId);
  const fallbackCount = getFallbackDocumentCount(applicationId);
  const fallbackDocs = getFallbackDocuments(applicationId);

  if (!hasFallback) return null;

  return (
    <Card className="border-yellow-200 bg-yellow-50">
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 mt-1 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold text-yellow-800 mb-2">
              ⚠️ Document Upload Warning
            </h3>
            <p className="text-yellow-700 mb-3">
              {fallbackCount} document{fallbackCount > 1 ? 's' : ''} uploaded in fallback mode and may not be permanently stored. 
              These documents should be re-uploaded to ensure they are saved properly.
            </p>
            
            <div className="space-y-2 mb-3">
              <p className="text-sm font-medium text-yellow-800">Documents in fallback mode:</p>
              <ul className="text-sm text-yellow-700 space-y-1">
                {fallbackDocs.map((doc, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                    <span>{doc.fileName} ({doc.documentType})</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {onRetryAll && (
              <Button 
                onClick={onRetryAll}
                variant="outline"
                size="sm"
                className="border-yellow-300 text-yellow-800 hover:bg-yellow-100"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry All Uploads
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}