import { LenderProductsList } from '@/components/LenderProductsList';

export default function LenderProductsListing() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Lender Products Database
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Complete listing of all available lending products organized by country and category
          </p>
        </div>
        
        <LenderProductsList />
      </div>
    </div>
  );
}