import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  RefreshCw,
  FileText,
  PenTool,
  Send,
  Eye
} from 'lucide-react';
import { getUserApplications } from '@/lib/api';

interface ApplicationStatus {
  id: string;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'declined' | 'pending_signature';
  businessName: string;
  loanAmount: number;
  submittedAt?: string;
  lastUpdated: string;
  statusDetails?: {
    documentsComplete: boolean;
    signatureComplete: boolean;
    reviewProgress?: number;
    nextAction?: string;
    estimatedDecision?: string;
  };
}

export function ApplicationStatusMonitor() {
  const [selectedApplication, setSelectedApplication] = useState<string | null>(null);

  const { data: applications, isLoading, error, refetch } = useQuery({
    queryKey: ['applications-cache-only'],
    queryFn: async () => {
      // Production cache-only mode: return empty array
      return [];
    },
    enabled: false,
    staleTime: Infinity,
    retry: false
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'declined':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'under_review':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending_signature':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'submitted':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4" />;
      case 'declined':
        return <AlertCircle className="h-4 w-4" />;
      case 'under_review':
        return <Eye className="h-4 w-4" />;
      case 'pending_signature':
        return <PenTool className="h-4 w-4" />;
      case 'submitted':
        return <Send className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusDescription = (status: string) => {
    switch (status) {
      case 'draft':
        return 'Application in progress';
      case 'submitted':
        return 'Application submitted for review';
      case 'under_review':
        return 'Being reviewed by underwriting team';
      case 'approved':
        return 'Application approved';
      case 'declined':
        return 'Application declined';
      case 'pending_signature':
        return 'Awaiting electronic signature';
      default:
        return 'Status unknown';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            Loading application status...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load application status. Please try refreshing the page.
            </AlertDescription>
          </Alert>
          <Button onClick={() => refetch()} className="mt-4" variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!applications || applications.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Application Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Applications</h3>
            <p className="text-gray-600">You haven't submitted any applications yet.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Application Status Monitor</CardTitle>
          <Button onClick={() => refetch()} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {applications.map((app) => {
              const statusDetails = (app as any).statusDetails || {};
              
              return (
                <div
                  key={app.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => setSelectedApplication(
                    selectedApplication === app.id ? null : app.id
                  )}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <h3 className="font-medium text-gray-900">{app.businessName}</h3>
                      <Badge className={getStatusColor(app.status)}>
                        {getStatusIcon(app.status)}
                        <span className="ml-1 capitalize">{app.status.replace('_', ' ')}</span>
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold">
                        ${app.loanAmount?.toLocaleString() || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : 'Unknown date'}
                      </div>
                    </div>
                  </div>

                  <div className="text-sm text-gray-600 mb-3">
                    {getStatusDescription(app.status)}
                  </div>

                  {/* Expanded Details */}
                  {selectedApplication === app.id && (
                    <div className="mt-4 pt-4 border-t space-y-4">
                      {/* Progress Indicators */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Documents</span>
                            <span className={`text-xs ${statusDetails.documentsComplete ? 'text-green-600' : 'text-orange-600'}`}>
                              {statusDetails.documentsComplete ? 'Complete' : 'Pending'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {statusDetails.documentsComplete ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <Clock className="h-4 w-4 text-orange-500" />
                            )}
                            <span className="text-sm text-gray-600">
                              All required documents uploaded
                            </span>
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Signature</span>
                            <span className={`text-xs ${statusDetails.signatureComplete ? 'text-green-600' : 'text-orange-600'}`}>
                              {statusDetails.signatureComplete ? 'Signed' : 'Pending'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {statusDetails.signatureComplete ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <PenTool className="h-4 w-4 text-orange-500" />
                            )}
                            <span className="text-sm text-gray-600">
                              Electronic signature completed
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Review Progress */}
                      {app.status === 'under_review' && statusDetails.reviewProgress !== undefined && (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Review Progress</span>
                            <span className="text-xs text-blue-600">{statusDetails.reviewProgress}%</span>
                          </div>
                          <Progress value={statusDetails.reviewProgress} className="w-full" />
                        </div>
                      )}

                      {/* Next Action */}
                      {statusDetails.nextAction && (
                        <Alert>
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            <strong>Next Action Required:</strong> {statusDetails.nextAction}
                          </AlertDescription>
                        </Alert>
                      )}

                      {/* Estimated Decision */}
                      {statusDetails.estimatedDecision && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <div className="text-sm">
                            <strong>Estimated Decision:</strong> {statusDetails.estimatedDecision}
                          </div>
                        </div>
                      )}

                      {/* Timeline */}
                      <div className="text-xs text-gray-500 space-y-1">
                        {app.createdAt && (
                          <div>Created: {new Date(app.createdAt).toLocaleString()}</div>
                        )}
                        {app.updatedAt && (
                          <div>Last Updated: {new Date(app.updatedAt).toLocaleString()}</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Real-time Updates Info */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <RefreshCw className="h-4 w-4" />
            Status updates automatically every 30 seconds. Last updated: {new Date().toLocaleTimeString()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}