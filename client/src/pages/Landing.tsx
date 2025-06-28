import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Building2, ArrowRight, CheckCircle, Clock, Shield } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-cbf-teal rounded-lg flex items-center justify-center">
              <Building2 className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-cbf-primary">Boreal</h1>
              <p className="text-sm text-cbf-secondary">Financial</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-cbf-secondary">Business Financing</span>
            <Button 
              onClick={() => window.location.href = '/api/login'}
              className="bg-cbf-orange hover:bg-cbf-orange-dark text-white px-6 py-2 rounded-lg font-medium"
            >
              Apply Now
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-gradient text-white py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                Financing For Big
                <br />
                Moments Like Now
              </h1>
              <p className="text-xl mb-8 text-blue-100">
                Get the funding your business needs to grow, expand, and seize opportunities with our fast and secure application process.
              </p>
              <Button 
                onClick={() => window.location.href = '/api/login'}
                className="bg-white text-cbf-teal hover:bg-gray-50 px-8 py-4 text-lg font-semibold rounded-lg inline-flex items-center space-x-2"
              >
                <span>Start Your Application</span>
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
            <div className="hidden lg:block">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold">98% Approval Rate</h3>
                      <p className="text-blue-100">Fast decisions within 24 hours</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Quick Process</h3>
                      <p className="text-blue-100">Complete application in minutes</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold">100% Secure</h3>
                      <p className="text-blue-100">Bank-level security & encryption</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-8 bg-cbf-teal text-white border-0">
              <div className="mb-6">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4">
                  <Building2 className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold mb-4">Apply Online</h2>
                <p className="text-blue-100 mb-6">
                  Fill out our secure application within 24 hours and we'll get you a decision on payment and funding details.
                </p>
                <Button 
                  onClick={() => window.location.href = '/api/login'}
                  className="bg-white text-cbf-teal hover:bg-gray-50 font-semibold px-6 py-3 rounded-lg"
                >
                  Start Application
                </Button>
              </div>
            </Card>

            <Card className="p-8 bg-cbf-orange text-white border-0">
              <div className="mb-6">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold mb-4">Get Funding</h2>
                <p className="text-orange-100 mb-6">
                  98% of applications are approved. Businesses see up to 120% increase in sales. We have 100% transparency.
                </p>
                <Button 
                  onClick={() => window.location.href = '/api/login'}
                  className="bg-white text-cbf-orange hover:bg-gray-50 font-semibold px-6 py-3 rounded-lg"
                >
                  Learn More
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Get Up To Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-cbf-primary mb-16">Get up to $30 Million</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-cbf-teal-light rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-cbf-teal" />
              </div>
              <h3 className="text-xl font-semibold text-cbf-primary mb-2">98% of applications are approved</h3>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-cbf-orange-light rounded-full flex items-center justify-center mx-auto mb-6">
                <ArrowRight className="w-10 h-10 text-cbf-orange" />
              </div>
              <h3 className="text-xl font-semibold text-cbf-primary mb-2">Up to 120% increase in sales</h3>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-cbf-teal-light rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-10 h-10 text-cbf-teal" />
              </div>
              <h3 className="text-xl font-semibold text-cbf-primary mb-2">100% Transparency</h3>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-cbf-teal text-white py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of Canadian businesses that have secured funding through our platform.
          </p>
          <Button 
            onClick={() => window.location.href = '/api/login'}
            className="bg-cbf-orange hover:bg-cbf-orange-dark text-white px-8 py-4 text-lg font-semibold rounded-lg inline-flex items-center space-x-2"
          >
            <span>Apply for Funding Now</span>
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </section>
    </div>
  );
}
