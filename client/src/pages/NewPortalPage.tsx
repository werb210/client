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
          <div className="flex justify-between items-center p-modern-xl">
            <BorealLogo size="default" />
            <div className="flex items-center gap-modern-lg">
              <div className="flex items-center gap-modern-sm">
                <User className="h-4 w-4 text-modern-secondary" />
                <span className="body-modern-small text-modern-secondary">Welcome, {getUserDisplayName()}</span>
              </div>
              <button 
                className="btn-modern btn-modern-outline"
                onClick={logout}
              >
                <LogOut className="h-4 w-4 mr-modern-xs" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container-modern p-modern-2xl">
        {/* Welcome Section */}
        <div className="mb-modern-2xl">
          <h1 className="heading-modern-h1 mb-modern-sm">
            Welcome back, {getUserDisplayName()}!
          </h1>
          <p className="body-modern-large text-modern-secondary">
            Manage your business loan applications and track your funding progress.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid-modern-3 gap-modern-xl mb-modern-2xl">
          <Card className="card-modern hover-modern-lift cursor-pointer">
            <Link href="/application">
              <CardHeader className="text-center p-modern-xl">
                <Plus className="h-12 w-12 text-brand-blue-600 mx-auto mb-modern-lg" />
                <CardTitle className="heading-modern-h3">New Application</CardTitle>
                <CardDescription className="body-modern text-modern-secondary">
                  Start a new business loan application
                </CardDescription>
              </CardHeader>
            </Link>
          </Card>

          <Card className="card-modern hover-modern-lift">
            <CardHeader className="text-center p-modern-xl">
              <FileText className="h-12 w-12 text-success-600 mx-auto mb-modern-lg" />
              <CardTitle className="heading-modern-h3">Upload Documents</CardTitle>
              <CardDescription className="body-modern text-modern-secondary">
                Add documents to existing applications
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="card-modern hover-modern-lift">
            <CardHeader className="text-center p-modern-xl">
              <Eye className="h-12 w-12 text-brand-purple-600 mx-auto mb-modern-lg" />
              <CardTitle className="heading-modern-h3">Track Progress</CardTitle>
              <CardDescription className="body-modern text-modern-secondary">
                Monitor your application status
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Applications Section */}
        <Card className="card-modern">
          <CardHeader className="p-modern-xl">
            <CardTitle className="heading-modern-h2 flex items-center">
              <FileText className="h-5 w-5 mr-modern-sm" />
              Your Applications
            </CardTitle>
            <CardDescription className="body-modern-large text-modern-secondary">
              Track the status of your business loan applications
            </CardDescription>
          </CardHeader>
          <CardContent className="p-modern-xl">
            {isLoading ? (
              <div className="text-center p-modern-2xl">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue-600 mx-auto mb-modern-lg"></div>
                <p className="body-modern text-modern-secondary">Loading applications...</p>
              </div>
            ) : applications?.length > 0 ? (
              <div className="space-y-modern-lg">
                {applications.map((app: any, index: number) => (
                  <div key={index} className="border border-modern-light rounded-modern-lg p-modern-lg hover:bg-modern-elevated transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-modern-md mb-modern-sm">
                          <h3 className="heading-modern-h4 text-modern-primary">
                            Application #{app.id || `APP-${index + 1}`}
                          </h3>
                          <Badge className={
                            app.status === 'completed' ? 'badge-modern badge-modern-success' :
                            app.status === 'pending' ? 'badge-modern badge-modern-warning' :
                            app.status === 'approved' ? 'badge-modern badge-modern-success' :
                            'badge-modern badge-modern-neutral'
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
                        <div className="grid-modern-4 gap-modern-lg body-modern-small text-modern-secondary">
                          <div>
                            <span className="font-medium text-modern-primary">Amount:</span>
                            <div>${app.fundingAmount || 'Not specified'}</div>
                          </div>
                          <div>
                            <span className="font-medium text-modern-primary">Purpose:</span>
                            <div className="capitalize">{app.fundsPurpose || 'Not specified'}</div>
                          </div>
                          <div>
                            <span className="font-medium text-modern-primary">Business:</span>
                            <div>{app.businessName || 'Not specified'}</div>
                          </div>
                          <div>
                            <span className="font-medium text-modern-primary">Submitted:</span>
                            <div>{app.createdAt ? new Date(app.createdAt).toLocaleDateString() : 'Draft'}</div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-modern-sm ml-modern-lg">
                        <button className="btn-modern btn-modern-outline btn-modern-sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </button>
                        {app.status === 'completed' && (
                          <button className="btn-modern btn-modern-outline btn-modern-sm">
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </button>
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