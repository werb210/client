import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Step2Recommendations() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Product Recommendations</h1>
          <p className="text-gray-600 mt-2">
            Based on your financial profile, here are our recommended financing options
          </p>
          <div className="mt-4">
            <div className="text-sm text-gray-500">Step 2 of 2</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div className="bg-blue-600 h-2 rounded-full w-full"></div>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recommendations Coming Soon</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              This step will be implemented in the next phase to show AI-powered product recommendations.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}