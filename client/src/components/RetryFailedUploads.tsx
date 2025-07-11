import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  RefreshCw, 
  Upload, 
  AlertCircle, 
  CheckCircle, 
  X,
  FileText
} from 'lucide-react';
import { uploadDocumentPublic } from '@/lib/api';

interface FailedUpload {
  id: string;
  file: File;
  fileName: string;
  categoryId: string;
  applicationId: string;
  error: string;
  attempts: number;
  lastAttempt: Date;
}

export function RetryFailedUploads() {
  const { toast } = useToast();
  const [failedUploads, setFailedUploads] = useState<FailedUpload[]>([]);
  const [retryingIds, setRetryingIds] = useState<Set<string>>(new Set());
  const [isRetryingAll, setIsRetryingAll] = useState(false);

  // Load failed uploads from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('failedUploads');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setFailedUploads(parsed.map((upload: any) => ({
          ...upload,
          lastAttempt: new Date(upload.lastAttempt),
          // Note: File objects can't be serialized, so we'll need to handle this differently in production
        })));
      } catch (error) {
        console.error('Failed to load failed uploads:', error);
      }
    }
  }, []);

  // Save failed uploads to localStorage
  const saveFailedUploads = (uploads: FailedUpload[]) => {
    try {
      localStorage.setItem('failedUploads', JSON.stringify(uploads));
    } catch (error) {
      console.error('Failed to save failed uploads:', error);
    }
  };

  const retryUpload = async (upload: FailedUpload) => {
    setRetryingIds(prev => new Set(prev).add(upload.id));

    try {
      await uploadDocumentPublic(upload.file, upload.applicationId, upload.categoryId);
      
      // Remove from failed uploads on success
      const updatedUploads = failedUploads.filter(u => u.id !== upload.id);
      setFailedUploads(updatedUploads);
      saveFailedUploads(updatedUploads);
      
      toast({
        title: "Upload Successful",
        description: `${upload.fileName} has been uploaded successfully.`,
      });
    } catch (error) {
      // Update failed upload with new attempt info
      const updatedUploads = failedUploads.map(u => 
        u.id === upload.id 
          ? { 
              ...u, 
              attempts: u.attempts + 1, 
              lastAttempt: new Date(),
              error: error instanceof Error ? error.message : 'Upload failed'
            }
          : u
      );
      setFailedUploads(updatedUploads);
      saveFailedUploads(updatedUploads);
      
      toast({
        title: "Upload Failed",
        description: `Failed to upload ${upload.fileName}. You can try again later.`,
        variant: "destructive",
      });
    } finally {
      setRetryingIds(prev => {
        const next = new Set(prev);
        next.delete(upload.id);
        return next;
      });
    }
  };

  const retryAllUploads = async () => {
    setIsRetryingAll(true);
    let successCount = 0;
    let failureCount = 0;

    for (const upload of failedUploads) {
      try {
        await uploadDocumentPublic(upload.file, upload.applicationId, upload.categoryId);
        successCount++;
      } catch (error) {
        failureCount++;
        // Update attempt count for failed retries
        const updatedUploads = failedUploads.map(u => 
          u.id === upload.id 
            ? { 
                ...u, 
                attempts: u.attempts + 1, 
                lastAttempt: new Date(),
                error: error instanceof Error ? error.message : 'Upload failed'
              }
            : u
        );
        setFailedUploads(updatedUploads);
      }
    }

    // Remove successful uploads
    const remainingUploads = failedUploads.filter((_, index) => index >= successCount);
    setFailedUploads(remainingUploads);
    saveFailedUploads(remainingUploads);

    toast({
      title: "Retry Complete",
      description: `${successCount} uploads succeeded, ${failureCount} failed.`,
      variant: successCount > 0 ? "default" : "destructive",
    });

    setIsRetryingAll(false);
  };

  const removeFailedUpload = (uploadId: string) => {
    const updatedUploads = failedUploads.filter(u => u.id !== uploadId);
    setFailedUploads(updatedUploads);
    saveFailedUploads(updatedUploads);
    
    toast({
      title: "Upload Removed",
      description: "Failed upload has been removed from the retry queue.",
    });
  };

  const clearAllFailedUploads = () => {
    setFailedUploads([]);
    localStorage.removeItem('failedUploads');
    
    toast({
      title: "Queue Cleared",
      description: "All failed uploads have been removed.",
    });
  };

  if (failedUploads.length === 0) {
    return null; // Don't render if no failed uploads
  }

  return (
    <Card className="border-orange-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-700">
          <AlertCircle className="h-5 w-5" />
          Failed Uploads ({failedUploads.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Alert className="mb-4 border-orange-200 bg-orange-50">
          <Upload className="h-4 w-4" />
          <AlertDescription className="text-orange-800">
            Some file uploads failed. You can retry them individually or all at once.
          </AlertDescription>
        </Alert>

        <div className="space-y-3 mb-4">
          {failedUploads.map((upload) => (
            <div
              key={upload.id}
              className="flex items-center justify-between p-3 border border-orange-200 rounded-lg bg-orange-50"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="h-4 w-4 text-orange-600" />
                  <span className="font-medium text-orange-900">{upload.fileName}</span>
                  <Badge variant="outline" className="text-xs">
                    Attempt {upload.attempts}
                  </Badge>
                </div>
                <p className="text-sm text-orange-700 mb-1">
                  Category: {upload.categoryId.replace('-', ' ').toUpperCase()}
                </p>
                <p className="text-xs text-orange-600">
                  Error: {upload.error}
                </p>
                <p className="text-xs text-orange-500">
                  Last attempt: {upload.lastAttempt.toLocaleString()}
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => retryUpload(upload)}
                  disabled={retryingIds.has(upload.id) || isRetryingAll}
                  className="border-orange-300 text-orange-700 hover:bg-orange-100"
                >
                  {retryingIds.has(upload.id) ? (
                    <RefreshCw className="h-3 w-3 animate-spin" />
                  ) : (
                    <RefreshCw className="h-3 w-3" />
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeFailedUpload(upload.id)}
                  disabled={retryingIds.has(upload.id) || isRetryingAll}
                  className="text-orange-600 hover:bg-orange-100"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <Button
            onClick={retryAllUploads}
            disabled={isRetryingAll || failedUploads.length === 0}
            className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700"
          >
            {isRetryingAll ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Retrying All...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Retry All ({failedUploads.length})
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={clearAllFailedUploads}
            disabled={isRetryingAll}
            className="border-orange-300 text-orange-700 hover:bg-orange-100"
          >
            Clear All
          </Button>
        </div>

        {isRetryingAll && (
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-2">
              <span>Retrying uploads...</span>
              <span>Progress will update as each upload completes</span>
            </div>
            <Progress value={50} className="w-full" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}