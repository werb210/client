import React from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, FileText, DollarSign, Shield, ArrowRight, Clock, TrendingUp } from "lucide-react";

export default function LandingPage() {
  const [, setLocation] = useLocation();

  const handleGetStarted = () => {
    setLocation("/apply/step-1");
  };

  const handleApplyNow = () => {
    setLocation("/apply/step-1");
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(to bottom right, #F8FAFC, #EFF6FF)' }}>
      {/* Navigation Bar */}
      <nav className="bg-white/95 backdrop-blur-sm border-b shadow-sm" style={{ borderColor: '#DDE6ED' }}>
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="font-bold text-xl" style={{ color: '#003D7A' }}>
            Boreal Financial
          </div>
          <div className="flex items-center space-x-3">
            <Button 
              onClick={handleGetStarted}
              className="text-white hover:opacity-90"
              style={{ backgroundColor: '#003D7A' }}
            >
              <span className="flex items-center">
                Get Started
                <ArrowRight className="w-4 h-4 ml-2" />
              </span>
            </Button>
          </div>
        </div>
      </nav>
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-6" style={{ color: '#003D7A' }}>
            Professional Business Financing Solutions
          </h1>
          <p className="text-xl mb-8 max-w-3xl mx-auto" style={{ color: '#64748B' }}>
            Connecting Canadian and US businesses with tailored financing solutions. 
            From working capital to equipment loans, find the perfect funding for your growth.
          </p>
          <Button 
            size="lg" 
            className="text-white px-8 py-3 text-lg font-semibold hover:opacity-90"
            style={{ backgroundColor: '#FF8C00' }}
            onClick={handleApplyNow}
          >
            <span className="flex items-center">
              Start Your Application
              <ArrowRight className="w-5 h-5 ml-2" />
            </span>
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="border-none shadow-lg hover:shadow-xl transition-shadow bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: '#F7F9FC' }}>
                <FileText className="w-6 h-6" style={{ color: '#003D7A' }} />
              </div>
              <CardTitle style={{ color: '#003D7A' }}>Streamlined Application</CardTitle>
              <CardDescription style={{ color: '#64748B' }}>
                Complete your business loan application in minutes with our intuitive, multi-step process.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-none shadow-lg hover:shadow-xl transition-shadow bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: '#FFF7E6' }}>
                <DollarSign className="w-6 h-6" style={{ color: '#FF8C00' }} />
              </div>
              <CardTitle style={{ color: '#003D7A' }}>Competitive Rates</CardTitle>
              <CardDescription style={{ color: '#64748B' }}>
                Access competitive financing options tailored to your business needs and industry.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-none shadow-lg hover:shadow-xl transition-shadow bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: '#F0F9F4' }}>
                <Shield className="w-6 h-6" style={{ color: '#16A34A' }} />
              </div>
              <CardTitle style={{ color: '#003D7A' }}>Secure & Compliant</CardTitle>
              <CardDescription style={{ color: '#64748B' }}>
                Bank-level security with full compliance to financial regulations and data protection.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Benefits Section */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 mb-16" style={{ border: '1px solid #DDE6ED' }}>
          <h2 className="text-3xl font-bold mb-8 text-center" style={{ color: '#003D7A' }}>
            Why Choose Boreal Financial?
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-6 h-6 mt-1 flex-shrink-0" style={{ color: '#16A34A' }} />
              <div>
                <h3 className="font-semibold mb-1" style={{ color: '#003D7A' }}>Fast Approval</h3>
                <p className="text-sm" style={{ color: '#64748B' }}>Get decisions within 24-48 hours with our streamlined process.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-6 h-6 mt-1 flex-shrink-0" style={{ color: '#16A34A' }} />
              <div>
                <h3 className="font-semibold mb-1" style={{ color: '#003D7A' }}>Flexible Terms</h3>
                <p className="text-sm" style={{ color: '#64748B' }}>6 months to 10 years repayment options to match your cash flow.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-6 h-6 mt-1 flex-shrink-0" style={{ color: '#16A34A' }} />
              <div>
                <h3 className="font-semibold mb-1" style={{ color: '#003D7A' }}>No Hidden Fees</h3>
                <p className="text-sm" style={{ color: '#64748B' }}>Transparent pricing with clear terms and no surprise charges.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-6 h-6 mt-1 flex-shrink-0" style={{ color: '#16A34A' }} />
              <div>
                <h3 className="font-semibold mb-1" style={{ color: '#003D7A' }}>Expert Support</h3>
                <p className="text-sm" style={{ color: '#64748B' }}>Dedicated financing specialists available throughout the process.</p>
              </div>
            </div>
          </div>
        </div>

        

        {/* Stats Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-16 text-center">
          <div>
            <div className="text-4xl font-bold mb-2" style={{ color: '#003D7A' }}>83+</div>
            <div style={{ color: '#64748B' }}>Active Lenders</div>
          </div>
          <div>
            <div className="text-4xl font-bold mb-2" style={{ color: '#FF8C00' }}>5-7</div>
            <div style={{ color: '#64748B' }}>Day Processing</div>
          </div>
          <div>
            <div className="text-4xl font-bold mb-2" style={{ color: '#16A34A' }}>$1M+</div>
            <div style={{ color: '#64748B' }}>Maximum Funding</div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4" style={{ color: '#003D7A' }}>
            Ready to Grow Your Business?
          </h2>
          <p className="mb-8 max-w-2xl mx-auto" style={{ color: '#64748B' }}>
            Join thousands of businesses that have secured funding through our platform. 
            Start your application today and get matched with the best financing options.
          </p>
          <Button 
            size="lg" 
            className="text-white px-12 py-4 text-lg font-semibold hover:opacity-90"
            style={{ backgroundColor: '#003D7A' }}
            onClick={handleApplyNow}
          >
            <span className="flex items-center">
              Apply Now
              <ArrowRight className="w-5 h-5 ml-2" />
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
}