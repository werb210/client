import { LenderRecommendation } from "@/components/LenderRecommendation";
import { ApiEndpointTester } from "@/components/ApiEndpointTester";

export default function LenderTest() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Lender Products Test</h1>
          <p className="text-gray-600">Testing the lender products API integration with TanStack Query</p>
        </div>
        
        <ApiEndpointTester />
        
        <div className="border-t pt-8">
          <LenderRecommendation />
        </div>
      </div>
    </div>
  );
}