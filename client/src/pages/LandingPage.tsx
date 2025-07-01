import React from "react";
import { useLocation } from "wouter";
import { isFirstVisit } from "@/lib/visitFlags";

export default function LandingPage() {
  const [, setLocation] = useLocation();

  const handleGetStarted = () => {
    setLocation("/application");
  };

  const handleLogin = () => {
    setLocation("/application");
  };

  const handleApplyNow = () => {
    setLocation("/application");
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between">
      <header className="p-4 bg-blue-900 text-white">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Boreal Financial</h1>
          <nav>
            <ul className="flex space-x-4">
              <li>
                <button 
                  onClick={handleGetStarted}
                  className="hover:underline bg-transparent border-none text-white cursor-pointer"
                >
                  Start Application
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </header>
      
      <main className="flex-grow">
        <section className="text-center py-20 px-4">
          <h2 className="text-4xl font-bold mb-4">Finance That Grows With You</h2>
          <p className="text-lg text-gray-700 mb-8">
            Simple. Transparent. Tailored financing for Canadian and US businesses.
          </p>
          <button 
            onClick={handleApplyNow}
            className="bg-blue-900 text-white px-6 py-3 rounded-md hover:bg-blue-800 border-none cursor-pointer"
          >
            Start Application
          </button>
        </section>

        <section className="py-16 px-4 bg-gray-50">
          <div className="container mx-auto">
            <h3 className="text-3xl font-bold text-center mb-12">Why Choose Boreal Financial?</h3>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <h4 className="text-xl font-semibold mb-2">Fast Approval</h4>
                <p className="text-gray-600">
                  Get pre-qualified in minutes with our streamlined digital application process.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                    <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <h4 className="text-xl font-semibold mb-2">Competitive Rates</h4>
                <p className="text-gray-600">
                  Access competitive financing options with transparent pricing and no hidden fees.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v1H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <h4 className="text-xl font-semibold mb-2">Expert Support</h4>
                <p className="text-gray-600">
                  Our dedicated team provides personalized guidance throughout your application journey.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 px-4">
          <div className="container mx-auto text-center">
            <h3 className="text-3xl font-bold mb-8">Ready to Get Started?</h3>
            <p className="text-lg text-gray-700 mb-8">
              Join thousands of businesses that have successfully funded their growth with Boreal Financial.
            </p>
            <button 
              onClick={handleApplyNow}
              className="bg-blue-900 text-white px-8 py-4 rounded-md hover:bg-blue-800 text-lg border-none cursor-pointer"
            >
              Start Your Application
            </button>
          </div>
        </section>
      </main>

      <footer className="bg-gray-800 text-white py-8 px-4">
        <div className="container mx-auto text-center">
          <h4 className="text-lg font-semibold mb-4">Boreal Financial</h4>
          <p className="text-gray-400 mb-4">
            Professional business financing solutions for Canadian and US businesses.
          </p>
          <div className="flex justify-center space-x-6">
            <a href="#" className="text-gray-400 hover:text-white">Privacy Policy</a>
            <a href="#" className="text-gray-400 hover:text-white">Terms of Service</a>
            <a href="#" className="text-gray-400 hover:text-white">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}