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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Navigation Bar */}
      <nav className="bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="font-bold text-xl text-teal-600">
            Boreal Financial
          </div>
          <div className="flex items-center space-x-3">
            <Button 
              variant="ghost" 
              onClick={handleGetStarted}
              className="text-teal-600 hover:text-teal-700"
            >
              Start Application
            </Button>
            <Button 
              onClick={handleGetStarted}
              className="bg-teal-600 hover:bg-teal-700 text-white"
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
          <h1 className="text-4xl md:text-6xl font-bold text-teal-600 mb-6">
            Professional Business Financing Solutions
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Connecting Canadian and US businesses with tailored financing solutions. 
            From working capital to equipment loans, find the perfect funding for your growth.
          </p>
          <Button 
            size="lg" 
            className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 text-lg font-semibold"
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
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-teal-600" />
              </div>
              <CardTitle className="text-teal-600">Streamlined Application</CardTitle>
              <CardDescription className="text-gray-600">
                Complete your business loan application in minutes with our intuitive, multi-step process.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-none shadow-lg hover:shadow-xl transition-shadow bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <DollarSign className="w-6 h-6 text-orange-500" />
              </div>
              <CardTitle className="text-teal-600">Competitive Rates</CardTitle>
              <CardDescription className="text-gray-600">
                Access competitive financing options tailored to your business needs and industry.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-none shadow-lg hover:shadow-xl transition-shadow bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <CardTitle className="text-teal-600">Secure & Compliant</CardTitle>
              <CardDescription className="text-gray-600">
                Bank-level security with full compliance to financial regulations and data protection.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Benefits Section */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 mb-16 border border-white/20">
          <h2 className="text-3xl font-bold text-teal-600 mb-8 text-center">
            Why Choose Boreal Financial?
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-teal-600 mb-1">Fast Approval</h3>
                <p className="text-gray-600 text-sm">Get decisions within 24-48 hours with our streamlined process.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-teal-600 mb-1">Flexible Terms</h3>
                <p className="text-gray-600 text-sm">6 months to 10 years repayment options to match your cash flow.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-teal-600 mb-1">No Hidden Fees</h3>
                <p className="text-gray-600 text-sm">Transparent pricing with clear terms and no surprise charges.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-teal-600 mb-1">Expert Support</h3>
                <p className="text-gray-600 text-sm">Dedicated financing specialists available throughout the process.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Application Process */}
        <div className="bg-teal-50 rounded-2xl p-8 mb-16">
          <h2 className="text-3xl font-bold text-teal-600 mb-8 text-center">
            Simple 7-Step Process
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-teal-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
                1
              </div>
              <h4 className="font-semibold text-teal-600 mb-2">Business Profile</h4>
              <p className="text-gray-600 text-sm">Basic business information and funding needs</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-teal-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
                2
              </div>
              <h4 className="font-semibold text-teal-600 mb-2">Product Matching</h4>
              <p className="text-gray-600 text-sm">AI-powered recommendations from 43+ lenders</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-500 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
                3-5
              </div>
              <h4 className="font-semibold text-teal-600 mb-2">Details & Documents</h4>
              <p className="text-gray-600 text-sm">Complete application with secure document upload</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
                6-7
              </div>
              <h4 className="font-semibold text-teal-600 mb-2">Sign & Submit</h4>
              <p className="text-gray-600 text-sm">E-signature and final submission to lenders</p>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-16 text-center">
          <div>
            <div className="text-4xl font-bold text-teal-600 mb-2">43+</div>
            <div className="text-gray-600">Active Lenders</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-orange-500 mb-2">5-7</div>
            <div className="text-gray-600">Day Processing</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-green-600 mb-2">$1M+</div>
            <div className="text-gray-600">Maximum Funding</div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-teal-600 mb-4">
            Ready to Grow Your Business?
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of businesses that have secured funding through our platform. 
            Start your application today and get matched with the best financing options.
          </p>
          <Button 
            size="lg" 
            className="bg-teal-600 hover:bg-teal-700 text-white px-12 py-4 text-lg font-semibold"
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