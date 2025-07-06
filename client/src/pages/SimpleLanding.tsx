import React from 'react';

const SimpleLanding: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg"></div>
              <span className="text-xl font-bold text-gray-900">Boreal Financial</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <span className="text-gray-600 hover:text-gray-900">Business Financing</span>
              <span className="text-gray-600 hover:text-gray-900">Industries</span>
              <span className="text-gray-600 hover:text-gray-900">About</span>
              <span className="text-gray-600 hover:text-gray-900">Contact</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
              Professional Business
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-orange-500">
                Financing Solutions
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Access funding from 41+ trusted lenders with approval decisions in as little as 24 hours. 
              Maximum funding available: <strong className="text-blue-600">$30M+</strong>
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-4 rounded-lg font-semibold text-lg shadow-lg transition-all duration-200 transform hover:scale-105">
                Start Your Application
              </button>
              <button className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 text-2xl">💰</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Competitive Rates</h3>
              <p className="text-gray-600">Access to 41+ lenders means competitive rates and terms for your business.</p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 text-2xl">⚡</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Fast Approval</h3>
              <p className="text-gray-600">Get approved in as little as 24 hours with our streamlined application process.</p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-orange-600 text-2xl">🎯</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Expert Support</h3>
              <p className="text-gray-600">Dedicated support team to guide you through every step of the financing process.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SimpleLanding;