import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BorealLogo } from '@/components/BorealLogo';
import { 
  Building2, 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Plus,
  Download,
  Eye,
  User,
  LogOut
} from 'lucide-react';

export function NewPortalPage() {
  const { user, logout } = useAuth();

  // Get user's display name
  const getUserDisplayName = () => {
    if (user?.firstName) {
      return user.firstName;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'User';
  };

  // Query user's applications
  const { data: applications, isLoading } = useQuery({
    queryKey: ['/api/applications'],
    queryFn: async () => {
      const response = await fetch('/api/applications');
      if (!response.ok) throw new Error('Failed to fetch applications');
      return response.json();
    }
  });

  return (
    <div className="min-h-screen bg-modern-primary">
      {/* Header */}
      <header className="bg-modern-elevated shadow-modern-sm border-modern-light border-b">
        <div className="container-modern">
          <div className="flex justify-between items-center py-6">
            <BorealLogo size="default" />
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700">Welcome, {getUserDisplayName()}</span>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={logout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {getUserDisplayName()}!
          </h1>
          <p className="text-gray-600">
            Manage your business loan applications and track your funding progress.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/application">
              <CardHeader className="text-center">
                <Plus className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>New Application</CardTitle>
                <CardDescription>
                  Start a new business loan application
                </CardDescription>
              </CardHeader>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <FileText className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <CardTitle>Upload Documents</CardTitle>
              <CardDescription>
                Add documents to existing applications
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <Eye className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <CardTitle>Track Progress</CardTitle>
              <CardDescription>
                Monitor your application status
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Applications Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Your Applications
            </CardTitle>
            <CardDescription>
              Track the status of your business loan applications
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading applications...</p>
              </div>
            ) : applications?.length > 0 ? (
              <div className="space-y-4">
                {applications.map((app: any, index: number) => (
                  <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-gray-900">
                            Application #{app.id || `APP-${index + 1}`}
                          </h3>
                          <Badge variant={
                            app.status === 'completed' ? 'default' :
                            app.status === 'pending' ? 'secondary' :
                            app.status === 'approved' ? 'default' :
                            'outline'
                          }>
                            {app.status === 'completed' ? (
                              <>
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Submitted
                              </>
                            ) : app.status === 'pending' ? (
                              <>
                                <Clock className="h-3 w-3 mr-1" />
                                In Review
                              </>
                            ) : (
                              <>
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Draft
                              </>
                            )}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Amount:</span>
                            <div>${app.fundingAmount || 'Not specified'}</div>
                          </div>
                          <div>
                            <span className="font-medium">Purpose:</span>
                            <div className="capitalize">{app.fundsPurpose || 'Not specified'}</div>
                          </div>
                          <div>
                            <span className="font-medium">Business:</span>
                            <div>{app.businessName || 'Not specified'}</div>
                          </div>
                          <div>
                            <span className="font-medium">Submitted:</span>
                            <div>{app.createdAt ? new Date(app.createdAt).toLocaleDateString() : 'Draft'}</div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        {app.status === 'completed' && (
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No Applications Yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Start your first business loan application to see it here.
                </p>
                <Link href="/application">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Start New Application
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{applications?.length || 0}</div>
              <p className="text-xs text-muted-foreground">
                All time applications
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Review</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {applications?.filter((app: any) => app.status === 'pending').length || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Currently being processed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {applications?.filter((app: any) => app.status === 'completed').length || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Successfully submitted
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}