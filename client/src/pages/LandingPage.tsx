import React from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, ShieldCheck, DollarSign, FileText } from "lucide-react";
import { isFirstVisit } from "@/lib/visitFlags";

export default function LandingPage() {
  const [, setLocation] = useLocation();

  const handleSignIn = () => {
    setLocation('/login');
  };

  const handleGetStarted = () => {
    const target = isFirstVisit() ? '/register' : '/login';
    setLocation(target);
  };

  const handleStartApplication = () => {
    const target = isFirstVisit() ? '/register' : '/login';
    setLocation(target);
  };

  return (
    <>
      {/* ==== CONVERTED HTML FROM "Boreal Financial - landing page.html" ==== */}
      <div className="bg-gradient-to-b from-white to-blue-50 min-h-screen">
        <header className="w-full px-6 py-4 flex justify-between items-center border-b bg-white shadow-sm">
          <h1 className="text-xl font-semibold text-blue-800">Boreal Financial</h1>
          <div className="flex gap-4">
            <Button variant="ghost" onClick={handleSignIn}>Sign In</Button>
            <Button onClick={handleGetStarted}>Get Started</Button>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-4 py-12 text-center">
          <h2 className="text-4xl font-bold text-blue-900 leading-tight mb-4">
            Professional Business Financing Solutions
          </h2>
          <p className="text-lg text-gray-700 mb-6">
            Connecting Canadian and US businesses with tailored financing solutions. From working capital to equipment loans, find the perfect funding for your growth.
          </p>
          <Button size="lg" className="mb-12" onClick={handleStartApplication}>
            Start Your Application
          </Button>

          <div className="grid md:grid-cols-3 gap-6 mb-16">
            <Card>
              <CardContent className="p-6">
                <FileText className="text-blue-600 mb-2 w-6 h-6" />
                <h3 className="text-lg font-semibold mb-1">Streamlined Application</h3>
                <p className="text-sm text-gray-600">
                  Complete your business loan application in minutes with our intuitive, multi-step process designed for efficiency.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <DollarSign className="text-yellow-600 mb-2 w-6 h-6" />
                <h3 className="text-lg font-semibold mb-1">Competitive Rates</h3>
                <p className="text-sm text-gray-600">
                  Access competitive financing options tailored to your business needs and financial profile.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <ShieldCheck className="text-green-600 mb-2 w-6 h-6" />
                <h3 className="text-lg font-semibold mb-1">Secure & Compliant</h3>
                <p className="text-sm text-gray-600">
                  Bank-level security with full compliance to Canadian and US financial regulations and privacy laws.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-md text-left">
            <h4 className="text-xl font-semibold mb-6 text-center text-blue-800">
              Why Choose Boreal Financial?
            </h4>
            <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-700">
              <div className="flex items-start gap-2">
                <CheckCircle className="text-green-600 w-5 h-5 mt-0.5" />
                Fast Approval Process
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="text-green-600 w-5 h-5 mt-0.5" />
                No Hidden Fees
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="text-green-600 w-5 h-5 mt-0.5" />
                Flexible Terms
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="text-green-600 w-5 h-5 mt-0.5" />
                Expert Support
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}