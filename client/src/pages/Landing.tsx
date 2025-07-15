import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { NavBar } from '@/components/NavBar';
import CheckCircle from 'lucide-react/dist/esm/icons/check-circle';
import TrendingUp from 'lucide-react/dist/esm/icons/trending-up';
import Shield from 'lucide-react/dist/esm/icons/shield';
import { useLocation } from 'wouter';

export default function Landing() {
  const [, setLocation] = useLocation();

  const handleApplyNow = () => {
    setLocation("/apply/step-1");
  };

  return (
    <div className="min-h-screen bg-white">
      <NavBar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-teal-50 to-orange-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Professional Business Financing Solutions
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Connecting Canadian and US businesses with tailored funding solutions. 
              Streamlined applications, competitive rates, and expert support.
            </p>
            <Button 
              size="lg" 
              className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-4 text-lg rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              onClick={handleApplyNow}
            >
              Start Your Application
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-6 h-6 text-teal-600" />
                </div>
                <CardTitle className="text-xl">Streamlined Application</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Complete your funding application in minutes with our intuitive multi-step process. 
                  Upload documents, e-sign agreements, and track progress in real-time.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-6 h-6 text-orange-600" />
                </div>
                <CardTitle className="text-xl">Competitive Rates</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Access competitive financing rates tailored to your business needs and credit profile. 
                  Multiple lender network ensures optimal terms for your situation.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-6 h-6 text-teal-600" />
                </div>
                <CardTitle className="text-xl">Secure & Compliant</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Bank-level security with full regulatory compliance for your peace of mind. 
                  Your sensitive financial data is protected with industry-leading encryption.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Boreal Financial?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We understand the unique challenges facing modern businesses and provide solutions that work.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-6">For Your Business</h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-teal-600 mt-1 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">Fast approval process - decisions in 24-48 hours</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-teal-600 mt-1 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">Flexible terms designed for your cash flow</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-teal-600 mt-1 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">No hidden fees or prepayment penalties</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-teal-600 mt-1 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">Dedicated relationship manager for ongoing support</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Our Commitment</h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-teal-600 mt-1 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">Transparent pricing with clear terms and conditions</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-teal-600 mt-1 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">Expert guidance throughout the application process</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-teal-600 mt-1 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">Industry-leading security and data protection</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-teal-600 mt-1 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">Ongoing relationship beyond just the initial funding</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="text-center mt-12">
            <Button 
              size="lg" 
              className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-4 text-lg rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              onClick={handleApplyNow}
            >
              Get Started Today
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-teal-400 mb-4">Boreal Financial</h3>
            <p className="text-gray-400 mb-6">
              Professional business financing solutions for the modern economy.
            </p>
            <Button 
              variant="outline" 
              className="border-teal-500 text-teal-400 hover:bg-teal-500 hover:text-white"
              onClick={handleApplyNow}
            >
              Start Your Application
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}
