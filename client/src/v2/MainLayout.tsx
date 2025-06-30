import React from 'react';
import { Outlet } from 'react-router-dom';
import { BorealLogo } from '../components/BorealLogo';
import { Button } from '../components/ui/button';
import { useAuth } from '../context/AuthContext';

export default function MainLayout() {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <BorealLogo size="default" />
            
            <nav className="hidden md:flex space-x-8">
              <a href="/" className="text-gray-600 hover:text-blue-600 transition-colors">
                Home
              </a>
              <a href="/portal" className="text-gray-600 hover:text-blue-600 transition-colors">
                Portal
              </a>
              <a href="/faq" className="text-gray-600 hover:text-blue-600 transition-colors">
                Support
              </a>
            </nav>

            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <span className="text-sm text-gray-600">
                    Welcome, {user?.firstName || 'User'}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={logout}
                  >
                    Sign Out
                  </Button>
                </>
              ) : (
                <div className="flex space-x-2">
                  <Button variant="ghost" size="sm" asChild>
                    <a href="/login">Sign In</a>
                  </Button>
                  <Button size="sm" asChild>
                    <a href="/register">Get Started</a>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <BorealLogo size="default" />
              <p className="mt-4 text-gray-300 max-w-md">
                Empowering Canadian businesses with innovative financing solutions. 
                Fast approvals, competitive rates, and expert support.
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-100 tracking-wider uppercase">
                Products
              </h3>
              <ul className="mt-4 space-y-2">
                <li><a href="#" className="text-gray-300 hover:text-white">Term Loans</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">Lines of Credit</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">Equipment Financing</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">Invoice Factoring</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-100 tracking-wider uppercase">
                Support
              </h3>
              <ul className="mt-4 space-y-2">
                <li><a href="/faq" className="text-gray-300 hover:text-white">FAQ</a></li>
                <li><a href="/troubleshooting" className="text-gray-300 hover:text-white">Help Center</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">Contact Us</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-800">
            <p className="text-center text-gray-400">
              © 2025 Boreal Financial. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}