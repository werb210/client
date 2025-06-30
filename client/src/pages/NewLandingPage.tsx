import React from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BorealLogo } from '@/components/BorealLogo';
import { 
  Building2, 
  DollarSign, 
  Clock, 
  Shield, 
  CheckCircle, 
  ArrowRight,
  TrendingUp,
  Users,
  FileText
} from 'lucide-react';
import { isFirstVisit } from '@/lib/visitFlags';

export function NewLandingPage() {
  const [, setLocation] = useLocation();

  const handleGetStarted = () => {
    if (isFirstVisit()) {
      setLocation('/register');
    } else {
      setLocation('/login');
    }
  };

  const handleStartApplication = () => {
    if (isFirstVisit()) {
      setLocation('/register');
    } else {
      setLocation('/login');
    }
  };

  return (
    <div className="min-h-screen gradient-modern-hero">
      {/* Header */}
      <header className="bg-modern-elevated shadow-modern-sm border-modern-light border-b">
        <div className="container-modern">
          <div className="flex justify-between items-center p-modern-xl">
            <BorealLogo size="default" />
            <div className="flex items-center gap-modern-lg">
              <Link href="/login">
                <button className="btn-modern btn-modern-secondary">
                  Sign In
                </button>
              </Link>
              <button className="btn-modern btn-modern-primary" onClick={handleStartApplication}>
                Apply Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="p-modern-4xl">
        <div className="container-modern text-center">
          <div className="badge-modern badge-modern-primary mb-4">
            Trusted by 1000+ Canadian Businesses
          </div>
          <h1 className="heading-modern-display mb-6">
            Business Loans
            <span className="text-modern-gradient"> Made Simple</span>
          </h1>
          <p className="body-modern-large text-modern-secondary mb-8 max-w-3xl mx-auto">
            Get fast approval for business loans from $10K to $10M. 
            Our intelligent platform connects you with the right lenders 
            based on your specific business needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-modern-lg justify-center">
            <button 
              className="btn-modern btn-modern-primary p-modern-lg text-lg"
              onClick={handleStartApplication}
            >
              Start Application
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
            <button className="btn-modern btn-modern-secondary p-modern-lg text-lg">
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="p-modern-4xl bg-modern-elevated">
        <div className="container-modern">
          <div className="text-center mb-12">
            <h2 className="heading-modern-h2 text-modern-primary mb-4">
              Why Choose Boreal Financial?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We've streamlined the business loan process to get you funded faster
            </p>
          </div>
          
          <div className="grid-modern-3 gap-modern-2xl">
            <div className="card-modern hover-modern-lift">
              <div className="p-modern-xl">
                <Clock className="h-12 w-12 text-brand-blue-600 mb-4" />
                <h3 className="heading-modern-h4 mb-2">Fast Approval</h3>
                <p className="body-modern-small text-modern-secondary mb-4">
                  Get pre-approved in minutes with our intelligent matching system
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-success-600 mr-2" />
                    <span className="body-modern-small">5-minute application</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-success-600 mr-2" />
                    <span className="body-modern-small">Same-day pre-approval</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-success-600 mr-2" />
                    <span className="body-modern-small">Digital signature process</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="card-modern hover-modern-lift">
              <div className="p-modern-xl">
                <TrendingUp className="h-12 w-12 text-brand-blue-600 mb-4" />
                <h3 className="heading-modern-h4 mb-2">Smart Matching</h3>
                <p className="body-modern-small text-modern-secondary mb-4">
                  Our AI matches you with the best lenders for your industry and needs
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-success-600 mr-2" />
                    <span className="body-modern-small">42+ lender products</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-success-600 mr-2" />
                    <span className="body-modern-small">Industry-specific rates</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-success-600 mr-2" />
                    <span className="body-modern-small">Real-time recommendations</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="h-12 w-12 text-blue-600 mb-4" />
                <CardTitle>Secure & Compliant</CardTitle>
                <CardDescription>
                  Bank-level security with full regulatory compliance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span className="text-sm">256-bit encryption</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span className="text-sm">PII protection</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span className="text-sm">Audit trails</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Loan Types */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Loan Products Available
            </h2>
            <p className="text-lg text-gray-600">
              Multiple financing options to match your business needs
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Term Loans",
                amount: "$25K - $5M",
                icon: DollarSign,
                description: "Traditional business loans with fixed terms"
              },
              {
                title: "Lines of Credit",
                amount: "$10K - $2M",
                icon: TrendingUp,
                description: "Flexible credit access when you need it"
              },
              {
                title: "Equipment Financing",
                amount: "$50K - $10M",
                icon: Building2,
                description: "Finance equipment purchases and upgrades"
              },
              {
                title: "Invoice Factoring",
                amount: "$1 - $1M",
                icon: FileText,
                description: "Convert invoices to immediate cash flow"
              }
            ].map((product, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <product.icon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <CardTitle className="text-lg">{product.title}</CardTitle>
                  <Badge variant="secondary">{product.amount}</Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 text-center">
                    {product.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Grow Your Business?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of businesses that have secured funding through our platform
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            className="text-lg px-8 py-6"
            onClick={handleStartApplication}
          >
            Start Your Application
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <Building2 className="h-6 w-6" />
                <span className="text-lg font-semibold">Boreal Financial</span>
              </div>
              <p className="text-gray-400 text-sm">
                Connecting Canadian businesses with the right financing solutions.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Products</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Term Loans</li>
                <li>Lines of Credit</li>
                <li>Equipment Financing</li>
                <li>Invoice Factoring</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>About Us</li>
                <li>How It Works</li>
                <li>FAQ</li>
                <li>Contact</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Help Center</li>
                <li>Terms of Service</li>
                <li>Privacy Policy</li>
                <li>Security</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2025 Boreal Financial. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}