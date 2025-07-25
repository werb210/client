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
  // Hide banner per user request - no visual warnings
  return null;
}