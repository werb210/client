import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';

export function NavBar() {
  const [, setLocation] = useLocation();

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/">
              <h1 className="text-xl font-bold text-teal-700 hover:text-teal-800 transition-colors">
                Boreal Financial
              </h1>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-4">
            <Button 
              className="bg-teal-600 hover:bg-teal-700 text-white"
              onClick={() => setLocation('/apply/step-1')}
            >
              Start Application
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}