import { LenderRecommendation } from "@/components/LenderRecommendation";

export default function LenderTest() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Lender Products Test</h1>
          <p className="text-gray-600">Testing the lender products API integration with TanStack Query</p>
        </div>
        
        <LenderRecommendation />
      </div>
    </div>
  );
}