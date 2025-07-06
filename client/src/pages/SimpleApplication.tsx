import React from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Building, CreditCard, FileText } from '@/lib/icons';

export default function SimpleApplication() {
  const [, setLocation] = useLocation();

  const handleStartApplication = () => {
    setLocation('/side-by-side-application');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-orange-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Boreal Financial Application
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Complete your business financing application in just a few simple steps
          </p>
        </div>

        {/* Application Overview */}
        <div className="max-w-4xl mx-auto">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl text-center">Application Process</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Building className="w-8 h-8 text-teal-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Business Details</h3>
                  <p className="text-sm text-gray-600">
                    Tell us about your business, funding needs, and financial profile
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-orange-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Documentation</h3>
                  <p className="text-sm text-gray-600">
                    Upload required documents and complete verification steps
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CreditCard className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Approval</h3>
                  <p className="text-sm text-gray-600">
                    Get matched with the best financing options for your business
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Start Application */}
          <div className="text-center">
            <Button
              onClick={handleStartApplication}
              size="lg"
              className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 text-lg"
            >
              Start Your Application
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            
            <p className="mt-4 text-sm text-gray-500">
              Application takes approximately 10-15 minutes to complete
            </p>
          </div>
        </div>

        {/* Benefits */}
        <div className="mt-16 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Why Choose Boreal Financial?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <h3 className="font-semibold mb-2">Fast Processing</h3>
                <p className="text-sm text-gray-600">
                  Get pre-approval decisions in as little as 24 hours
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <h3 className="font-semibold mb-2">Competitive Rates</h3>
                <p className="text-sm text-gray-600">
                  Access to multiple lenders for the best financing terms
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <h3 className="font-semibold mb-2">Expert Support</h3>
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