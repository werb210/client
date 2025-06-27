import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Building } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Card className="shadow-lg">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <div className="mx-auto w-16 h-16 bg-blue-500 rounded-lg flex items-center justify-center mb-4">
                <Building className="text-white text-2xl w-8 h-8" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Financial Application Portal
              </h1>
              <p className="text-gray-600">
                Secure access to your lending applications
              </p>
            </div>

            <Button 
              onClick={() => window.location.href = '/api/login'}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              <span>Continue with Replit</span>
            </Button>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                Secure authentication powered by Replit
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
