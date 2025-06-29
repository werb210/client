import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { isUnauthorizedError } from '@/lib/authUtils';
import { Application } from '@/lib/api';
import { useLocation } from 'wouter';
import { Plus, TrendingUp, HelpCircle, FileText, Calendar, Building } from 'lucide-react';
import borealLogo from '@assets/Boreal Financial Logo 2_1751090147857.png';

export default function Dashboard() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: applications, isLoading: applicationsLoading } = useQuery<Application[]>({
    queryKey: ['/api/applications'],
    enabled: isAuthenticated,
  });

  const handleStartNewApplication = () => {
    setLocation('/step1-financial-profile');
  };

  const handleLogout = () => {
    window.location.href = '/api/logout';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800">Draft</Badge>;
      case 'submitted':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Submitted</Badge>;
      case 'under_review':
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800">Under Review</Badge>;
      case 'approved':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation Header */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <img 
                src={borealLogo} 
                alt="Boreal Financial" 
                className="h-8 w-auto object-contain"
              />
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <img 
                  src={(user as any)?.profileImageUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&w=40&h=40&fit=crop&crop=face'} 
                  alt="User profile" 
                  className="w-8 h-8 rounded-full object-cover" 
                />
                <span className="text-sm font-medium text-cbf-primary">
                  {(user as any)?.firstName} {(user as any)?.lastName}
                </span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="text-cbf-secondary hover:text-cbf-primary">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                </svg>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {(user as any)?.firstName || 'User'}!
          </h2>
          <p className="text-gray-600">
            Manage your financial applications and track your progress.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={handleStartNewApplication}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Plus className="text-blue-500 text-xl w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Quick Application</h3>
                  <p className="text-sm text-gray-500">Original 7-step application</p>
                </div>
              </div>
              <Button className="w-full bg-blue-500 hover:bg-blue-600">
                Quick Start
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setLocation('/comprehensive-application')}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                  <FileText className="text-teal-600 text-xl w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Comprehensive Application</h3>
                  <p className="text-sm text-gray-500">Detailed 42-field application form</p>
                </div>
              </div>
              <Button className="w-full bg-teal-600 hover:bg-teal-700">
                Start Comprehensive
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setLocation('/side-by-side-application')}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Building className="text-purple-600 text-xl w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Side-by-Side Application</h3>
                  <p className="text-sm text-gray-500">View all steps simultaneously</p>
                </div>
              </div>
              <Button className="w-full bg-purple-600 hover:bg-purple-700">
                Start Side-by-Side
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="text-green-500 text-xl w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Application Status</h3>
                  <p className="text-sm text-gray-500">Track your submissions</p>
                </div>
              </div>
              <Button variant="secondary" className="w-full">
                View Status
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <HelpCircle className="text-orange-500 text-xl w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Help & FAQs</h3>
                  <p className="text-sm text-gray-500">Get assistance</p>
                </div>
              </div>
              <Button variant="secondary" className="w-full">
                Learn More
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Applications */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Applications</CardTitle>
          </CardHeader>
          <CardContent>
            {applicationsLoading ? (
              <div className="animate-pulse space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between py-4 border-b border-gray-100">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                      <div>
                        <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-24"></div>
                      </div>
                    </div>
                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                  </div>
                ))}
              </div>
            ) : applications && applications.length > 0 ? (
              <div className="space-y-4">
                {applications.map((app: Application) => (
                  <div key={app.id} className="flex items-center justify-between py-4 border-b border-gray-100 last:border-b-0">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FileText className="text-blue-500 w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-medium text-cbf-primary">
                          {app.businessName || 'Business Loan Application'}
                        </h4>
                        <div className="flex items-center space-x-2 text-sm text-cbf-secondary">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : 'Unknown date'}
                          </span>
                          {app.loanAmount && (
                            <>
                              <span>•</span>
                              <span>${app.loanAmount.toLocaleString()}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {getStatusBadge(app.status)}
                      <Button variant="ghost" size="sm" className="text-blue-500 hover:text-blue-600">
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No applications yet. Start your first application above!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
