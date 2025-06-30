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
    <div className="min-h-screen bg-background text-foreground font-sans">
      {showHeader && (
        <header className="py-4 px-6 border-b border-border bg-card shadow-sm">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <BorealLogo size="default" variant="full" />
            <nav className="hidden md:flex space-x-6">
              <a href="/portal" className="text-foreground hover:text-primary transition-colors">Dashboard</a>
              <a href="/application" className="text-foreground hover:text-primary transition-colors">Apply</a>
              <a href="/faq" className="text-foreground hover:text-primary transition-colors">Support</a>
            </nav>
          </div>
        </header>
      )}
      
      <main className="p-4 md:p-8">
        {children}
      </main>
      
      {showFooter && (
        <footer className="text-sm text-muted-foreground mt-8 text-center py-6 border-t border-border">
          <div className="max-w-7xl mx-auto">
            © 2025 Boreal Financial. All rights reserved.
          </div>
        </footer>
      )}
    </div>
  );
}