import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { useInitialAuthRedirect } from '@/hooks/useInitialAuthRedirect';

export function NavBar() {
  const { handleAuthRedirect } = useInitialAuthRedirect();

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
              variant="ghost" 
              className="text-gray-600 hover:text-gray-900"
              onClick={handleAuthRedirect}
            >
              Sign In
            </Button>
            <Button 
              className="bg-teal-600 hover:bg-teal-700 text-white"
              onClick={handleAuthRedirect}
            >
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}