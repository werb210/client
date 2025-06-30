import React from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  PlusCircle, 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Calendar,
  Bell,
  Settings,
  User,
  LogOut,
  Home,
  CreditCard,
  BarChart3,
  FileCheck,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const applicationStatuses = [
  {
    id: 'APP-2025-001',
    type: 'Working Capital',
    amount: '$75,000',
    status: 'under_review',
    submittedDate: '2025-06-25',
    progress: 65,
    nextAction: 'Awaiting credit review',
    estimatedDecision: '2025-07-02'
  },
  {
    id: 'APP-2025-002',
    type: 'Equipment Financing',
    amount: '$150,000',
    status: 'approved',
    submittedDate: '2025-06-20',
    progress: 100,
    nextAction: 'Ready for signature',
    estimatedDecision: 'Approved'
  },
  {
    id: 'APP-2024-089',
    type: 'Line of Credit',
    amount: '$50,000',
    status: 'active',
    submittedDate: '2024-12-15',
    progress: 100,
    nextAction: 'Account active',
    estimatedDecision: 'Funded'
  }
];

const quickActions = [
  {
    title: 'New Application',
    description: 'Start a comprehensive loan application',
    icon: <PlusCircle className="h-6 w-6" />,
    href: '/comprehensive-application',
    color: 'bg-teal-600 hover:bg-teal-700',
    textColor: 'text-white'
  },
  {
    title: 'Quick Application',
    description: 'Fast 7-step application process',
    icon: <Clock className="h-6 w-6" />,
    href: '/application',
    color: 'bg-orange-500 hover:bg-orange-600',
    textColor: 'text-white'
  },
  {
    title: 'Upload Documents',
    description: 'Submit additional documentation',
    icon: <FileText className="h-6 w-6" />,
    href: '/documents',
    color: 'bg-blue-500 hover:bg-blue-600',
    textColor: 'text-white'
  },
  {
    title: 'Schedule Consultation',
    description: 'Meet with a loan specialist',
    icon: <Calendar className="h-6 w-6" />,
    href: '/consultation',
    color: 'bg-purple-500 hover:bg-purple-600',
    textColor: 'text-white'
  }
];

const dashboardMetrics = [
  {
    title: 'Total Funding',
    value: '$275,000',
    change: '+$150,000',
    changeType: 'positive',
    icon: <DollarSign className="h-5 w-5" />
  },
  {
    title: 'Active Applications',
    value: '2',
    change: '+1 this month',
    changeType: 'neutral',
    icon: <FileCheck className="h-5 w-5" />
  },
  {
    title: 'Credit Utilization',
    value: '32%',
    change: '-8% this month',
    changeType: 'positive',
    icon: <BarChart3 className="h-5 w-5" />
  },
  {
    title: 'Next Payment',
    value: 'Jul 15',
    change: '$2,850 due',
    changeType: 'neutral',
    icon: <Calendar className="h-5 w-5" />
  }
];

const recentActivity = [
  {
    type: 'application_submitted',
    message: 'Equipment financing application submitted',
    timestamp: '2 hours ago',
    icon: <FileText className="h-4 w-4 text-blue-500" />
  },
  {
    type: 'document_uploaded',
    message: 'Tax returns uploaded successfully',
    timestamp: '1 day ago',
    icon: <CheckCircle className="h-4 w-4 text-green-500" />
  },
  {
    type: 'payment_made',
    message: 'Monthly payment processed ($2,850)',
    timestamp: '3 days ago',
    icon: <CreditCard className="h-4 w-4 text-teal-500" />
  },
  {
    type: 'message_received',
    message: 'New message from loan specialist',
    timestamp: '1 week ago',
    icon: <MessageSquare className="h-4 w-4 text-purple-500" />
  }
];

function getStatusBadge(status: string) {
  switch (status) {
    case 'draft':
      return <Badge variant="secondary">Draft</Badge>;
    case 'submitted':
      return <Badge className="bg-blue-100 text-blue-800">Submitted</Badge>;
    case 'under_review':
      return <Badge className="bg-yellow-100 text-yellow-800">Under Review</Badge>;
    case 'approved':
      return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
    case 'declined':
      return <Badge className="bg-red-100 text-red-800">Declined</Badge>;
    case 'active':
      return <Badge className="bg-teal-100 text-teal-800">Active</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'approved':
    case 'active':
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case 'under_review':
      return <Clock className="h-5 w-5 text-yellow-500" />;
    case 'declined':
      return <AlertTriangle className="h-5 w-5 text-red-500" />;
    default:
      return <FileText className="h-5 w-5 text-gray-500" />;
  }
}

export function PortalPage() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();

  const handleLogout = async () => {
    await logout();
    setLocation('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-teal-600 to-teal-700 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">B</span>
                </div>
                <span className="text-xl font-bold text-gray-900">Boreal Financial</span>
              </Link>
              <Badge variant="secondary" className="ml-4">Portal</Badge>
            </div>
            
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/portal" className="flex items-center space-x-2 text-teal-600 font-medium">
                <Home className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
              <Link href="/applications" className="flex items-center space-x-2 text-gray-700 hover:text-teal-600">
                <FileText className="h-4 w-4" />
                <span>Applications</span>
              </Link>
              <Link href="/payments" className="flex items-center space-x-2 text-gray-700 hover:text-teal-600">
                <CreditCard className="h-4 w-4" />
                <span>Payments</span>
              </Link>
              <Link href="/messages" className="flex items-center space-x-2 text-gray-700 hover:text-teal-600">
                <MessageSquare className="h-4 w-4" />
                <span>Messages</span>
              </Link>
            </nav>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-teal-600" />
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {user?.name || 'User'}
                </span>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLogout}
                className="text-gray-500 hover:text-gray-700"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name || 'User'}!
          </h1>
          <p className="text-gray-600">
            Manage your applications, track funding, and explore new financing opportunities.
          </p>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {dashboardMetrics.map((metric, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                    <p className={`text-xs ${
                      metric.changeType === 'positive' ? 'text-green-600' : 
                      metric.changeType === 'negative' ? 'text-red-600' : 'text-gray-500'
                    }`}>
                      {metric.change}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-100 rounded-full">
                    {metric.icon}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                <Link href={action.href}>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center ${action.textColor}`}>
                        {action.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{action.title}</h3>
                        <p className="text-sm text-gray-600">{action.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        </div>

        {/* Main Dashboard Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Applications Overview */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Your Applications</span>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/applications">View All</Link>
                  </Button>
                </CardTitle>
                <CardDescription>
                  Track the status of your loan applications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {applicationStatuses.map((application) => (
                    <div 
                      key={application.id} 
                      className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-3">
                            {getStatusIcon(application.status)}
                            <h3 className="font-semibold text-gray-900">
                              {application.type}
                            </h3>
                            {getStatusBadge(application.status)}
                          </div>
                          <p className="text-sm text-gray-600">
                            Application ID: {application.id}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">{application.amount}</p>
                          <p className="text-sm text-gray-600">
                            Submitted {application.submittedDate}
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Progress</span>
                          <span className="font-medium">{application.progress}%</span>
                        </div>
                        <Progress value={application.progress} className="h-2" />
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">{application.nextAction}</span>
                          <span className="text-gray-600">
                            Decision: {application.estimatedDecision}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest account updates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {activity.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">{activity.message}</p>
                        <p className="text-xs text-gray-500">{activity.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Account Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Account Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Account Since</span>
                  <span className="text-sm font-medium">Dec 2024</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Applications</span>
                  <span className="text-sm font-medium">5</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Approved Funding</span>
                  <span className="text-sm font-medium text-green-600">$275,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Credit Score</span>
                  <span className="text-sm font-medium">Excellent</span>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-4">
                  View Full Profile
                </Button>
              </CardContent>
            </Card>

            {/* Support */}
            <Card>
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Contact Support
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Call
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Help Center
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}