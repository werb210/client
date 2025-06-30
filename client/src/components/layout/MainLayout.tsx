import { ReactNode } from 'react';
import { BorealLogo } from '@/components/BorealLogo';

interface MainLayoutProps {
  children: ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
}

export default function MainLayout({ 
  children, 
  showHeader = true, 
  showFooter = true 
}: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-surface text-onSurface font-sans">
      {showHeader && (
        <header className="py-4 px-6 border-b border-gray-200 bg-white shadow-sm">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <BorealLogo size="default" variant="full" />
            <nav className="hidden md:flex space-x-6">
              <a href="/portal" className="text-onSurface hover:text-primary transition">Dashboard</a>
              <a href="/application" className="text-onSurface hover:text-primary transition">Apply</a>
              <a href="/faq" className="text-onSurface hover:text-primary transition">Support</a>
            </nav>
          </div>
        </header>
      )}
      
      <main className="p-4 md:p-8">
        {children}
      </main>
      
      {showFooter && (
        <footer className="text-sm text-gray-400 mt-8 text-center py-6 border-t border-gray-200">
          <div className="max-w-7xl mx-auto">
            © 2025 Boreal Financial. All rights reserved.
          </div>
        </footer>
      )}
    </div>
  );
}