import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Plus from 'lucide-react/dist/esm/icons/plus';
import TrendingUp from 'lucide-react/dist/esm/icons/trending-up';
import FileText from 'lucide-react/dist/esm/icons/file-text';
import Building from 'lucide-react/dist/esm/icons/building';

export default function SimpleDashboard() {
  const [, setLocation] = useLocation();

  const handleStartApplication = () => {
    setLocation('/apply/step-1');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-orange-50">
      {/* Header */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-teal-700">Boreal Financial</h1>
            </div>
            <Button 
              onClick={() => setLocation('/')}
              variant="ghost"
              className="text-gray-600 hover:text-gray-900"
            >
              Home
            </Button>
          </div>
        </div>
      </nav>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Business Financing Dashboard
          </h2>
          <p className="text-gray-600">
            Choose the application process that works best for your business
          </p>
        </div>

        {/* Application Options */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 max-w-5xl mx-auto">
          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={handleStartApplication}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Plus className="text-blue-500 text-xl w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Quick Application</h3>
                  <p className="text-sm text-gray-500">Streamlined 6-step process</p>
                </div>
              </div>
              <Button className="w-full bg-blue-500 hover:bg-blue-600">
                Start Application
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setLocation('/apply/step-1')}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Building className="text-purple-600 text-xl w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Multi-Step View</h3>
                  <p className="text-sm text-gray-500">View all steps simultaneously</p>
                </div>
              </div>
              <Button className="w-full bg-purple-600 hover:bg-purple-700">
                Side-by-Side Application
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
                  <h3 className="font-semibold text-gray-900">Process Overview</h3>
                  <p className="text-sm text-gray-500">Learn about our application process</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setLocation('/apply/step-1')}
              >
                Learn More
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Benefits Section */}
        <div className="max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-center mb-8">Why Choose Boreal Financial?</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <h4 className="font-semibold mb-2">Fast Processing</h4>
                <p className="text-sm text-gray-600">
                  Get pre-approval decisions in as little as 24 hours
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <h4 className="font-semibold mb-2">Multiple Options</h4>
                <p className="text-sm text-gray-600">
                  Access to multiple lenders for the best financing terms
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <h4 className="font-semibold mb-2">Expert Support</h4>
                <p className="text-sm text-gray-600">
                  Dedicated support team to guide you through the process
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}