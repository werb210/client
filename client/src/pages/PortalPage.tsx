import React from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { markPortalDefault } from "@/lib/visitFlags";
import { 
  FileText, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Plus,
  Eye,
  Settings,
  HelpCircle
} from "lucide-react";

export default function PortalPage() {
  const [, setLocation] = useLocation();
  const { user, logout } = useAuth();

  const handleStartApplication = () => {
    markPortalDefault(); // user has reached portal once
    setLocation("/application/step-1"); // Start Application CTA
  };

  const handleViewApplication = (id: string) => {
    setLocation(`/application/${id}`);
  };

  const handleLogout = async () => {
    await logout();
    setLocation('/');
  };

  // Mock application data - in real app this would come from API
  const applications = [
    {
      id: "APP-001",
      businessName: "Tech Solutions Inc",
      amount: 250000,
      status: "under_review",
      submitDate: "2025-06-25",
      productType: "Working Capital"
    },
    {
      id: "APP-002", 
      businessName: "Manufacturing Co",
      amount: 500000,
      status: "approved",
      submitDate: "2025-06-20",
      productType: "Equipment Financing"
    }
  ];

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'under_review': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-blue-100 text-blue-800';
      case 'declined': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'under_review': return <Clock className="w-4 h-4" />;
      case 'pending': return <AlertCircle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-800">Boreal Financial</h1>
              <span className="ml-4 text-gray-500">Portal</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user?.firstName || 'User'}</span>
              <Button variant="ghost" onClick={() => setLocation('/settings')}>
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.firstName || 'User'}
          </h2>
          <p className="text-gray-600">
            Manage your financing applications and explore new funding opportunities.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={handleStartApplication}>
            <CardContent className="p-6 text-center">
              <Plus className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">New Application</h3>
              <p className="text-sm text-gray-600">Start a new financing application</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Market Rates</h3>
              <p className="text-sm text-gray-600">View current financing rates</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <FileText className="w-8 h-8 text-purple-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Documents</h3>
              <p className="text-sm text-gray-600">Manage your documents</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow" onClick={() => setLocation('/support')}>
            <CardContent className="p-6 text-center">
              <HelpCircle className="w-8 h-8 text-orange-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Get Help</h3>
              <p className="text-sm text-gray-600">Contact our support team</p>
            </CardContent>
          </Card>
        </div>

        {/* Applications Overview */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Applications */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Your Applications</span>
                  <Button variant="outline" size="sm" onClick={handleStartApplication}>
                    <Plus className="w-4 h-4 mr-2" />
                    New Application
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {applications.map((app) => (
                    <div key={app.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-full ${getStatusColor(app.status)}`}>
                          {getStatusIcon(app.status)}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{app.businessName}</h4>
                          <p className="text-sm text-gray-600">{app.productType} • ${app.amount.toLocaleString()}</p>
                          <p className="text-xs text-gray-500">Submitted {app.submitDate}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(app.status)}>
                          {app.status.replace('_', ' ')}
                        </Badge>
                        <Button variant="ghost" size="sm" onClick={() => handleViewApplication(app.id)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Account Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Account Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Active Applications</span>
                  <span className="font-semibold">2</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Requested</span>
                  <span className="font-semibold">$750,000</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Approved Amount</span>
                  <span className="font-semibold text-green-600">$500,000</span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Market Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600">Average Rate</span>
                    <span className="text-sm font-medium">8.5%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{width: '65%'}}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600">Approval Rate</span>
                    <span className="text-sm font-medium">92%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{width: '92%'}}></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}