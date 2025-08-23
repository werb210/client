import { useApplicationStatus } from '../hooks/useApplicationStatus';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, Clock, AlertCircle, FileCheck } from 'lucide-react';

interface ApplicationStatusViewProps {
  applicationId: string;
}

export default function ApplicationStatusView({ applicationId }: ApplicationStatusViewProps) {
  const { data, isLoading, error } = useApplicationStatus(applicationId);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
          <span className="ml-2">Checking application status...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200">
        <CardContent>
          <Alert className="border-red-200">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              Unable to check application status. Please try again later.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'documents accepted':
      case 'approved':
        return <CheckCircle2 className="w-6 h-6 text-green-600" />;
      case 'pending review':
      case 'under review':
        return <Clock className="w-6 h-6 text-orange-600" />;
      case 'documents required':
        return <FileCheck className="w-6 h-6 text-blue-600" />;
      default:
        return <Clock className="w-6 h-6 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'documents accepted':
      case 'approved':
        return 'border-green-200 bg-green-50';
      case 'pending review':
      case 'under review':
        return 'border-orange-200 bg-orange-50';
      case 'documents required':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  // UI only displays current status
  const applicationStatus = data?.status || 'Unknown';

  return (
    <Card className={`border-2 ${getStatusColor(applicationStatus)}`}>
      <CardHeader>
        <div className="flex items-center gap-3">
          {getStatusIcon(applicationStatus)}
          <CardTitle className="text-xl">
            Application Status
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <h3 className="text-2xl font-semibold mb-2">
            {applicationStatus}
          </h3>
          <p className="text-gray-600">
            Application ID: {applicationId}
          </p>
        </div>

        {applicationStatus?.toLowerCase() === 'documents accepted' && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">
              All required documents have been reviewed and accepted. 
              Our team is now processing your application.
            </AlertDescription>
          </Alert>
        )}

        {applicationStatus?.toLowerCase() === 'pending review' && (
          <Alert className="border-orange-200 bg-orange-50">
            <Clock className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-700">
              Your application is currently being reviewed by our team.
            </AlertDescription>
          </Alert>
        )}

        {applicationStatus?.toLowerCase() === 'documents required' && (
          <Alert className="border-blue-200 bg-blue-50">
            <FileCheck className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-700">
              Additional documents are required to process your application.
            </AlertDescription>
          </Alert>
        )}

        <div className="text-sm text-gray-500 text-center">
          Status updates automatically every 30 seconds
        </div>
      </CardContent>
    </Card>
  );
}