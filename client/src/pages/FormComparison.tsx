import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { ArrowLeft, FileText, List } from 'lucide-react';

export default function FormComparison() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => setLocation('/')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Application Form Comparison</h1>
          <p className="text-gray-600">Compare the two different application form approaches</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Original V1 Form (Simple) */}
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-teal-600 to-teal-700 text-white">
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Original V1 Form (Simple)
              </CardTitle>
              <p className="text-teal-100">Current working form - 6 fields</p>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-2">Form Fields (6 total):</h3>
                  <ul className="space-y-2 text-sm text-blue-700">
                    <li>• <strong>Funding Amount</strong> - Text input</li>
                    <li>• <strong>Use of Funds</strong> - Select dropdown</li>
                    <li>• <strong>Business Location</strong> - Select (US/Canada)</li>
                    <li>• <strong>Industry</strong> - Select dropdown</li>
                    <li>• <strong>Sales History</strong> - Select dropdown</li>
                    <li>• <strong>Last Year Revenue</strong> - Text input</li>
                  </ul>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-2">Features:</h3>
                  <ul className="space-y-1 text-sm text-green-700">
                    <li>✓ Side-by-side layout (2 columns on desktop)</li>
                    <li>✓ Mobile responsive (stacks to 1 column)</li>
                    <li>✓ Simple validation with Zod</li>
                    <li>✓ Quick completion (2-3 minutes)</li>
                    <li>✓ Routes to Step 2 Recommendations</li>
                  </ul>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">Current Route:</h3>
                  <code className="text-sm bg-white px-2 py-1 rounded">
                    /apply/step-1 → Step1_FinancialProfile_Simple.tsx
                  </code>
                </div>

                <Button 
                  onClick={() => setLocation('/apply/step-1')}
                  className="w-full bg-teal-600 hover:bg-teal-700"
                >
                  View Original V1 Form
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Comprehensive Application */}
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-orange-600 to-orange-700 text-white">
              <CardTitle className="flex items-center gap-2">
                <List className="w-5 h-5" />
                Comprehensive Application
              </CardTitle>
              <p className="text-orange-100">Detailed multi-step form - 42+ fields</p>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-purple-800 mb-2">Step 1 Fields (11 total):</h3>
                  <ul className="space-y-2 text-sm text-purple-700">
                    <li>• <strong>Business Headquarters</strong> - US/CA select</li>
                    <li>• <strong>State/Province</strong> - Conditional dropdown</li>
                    <li>• <strong>Industry</strong> - Select dropdown</li>
                    <li>• <strong>Looking For</strong> - Capital/Equipment/Both</li>
                    <li>• <strong>Funding Amount</strong> - Number input</li>
                    <li>• <strong>Purpose of Funds</strong> - Text input</li>
                    <li>• <strong>Sales History</strong> - &lt;1yr/1-2yr/2+yr</li>
                    <li>• <strong>Revenue Last Year</strong> - Number input</li>
                    <li>• <strong>Average Monthly Revenue</strong> - Number input</li>
                    <li>• <strong>Accounts Receivable Balance</strong> - Number input</li>
                    <li>• <strong>Fixed Assets Value</strong> - Number input</li>
                  </ul>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-yellow-800 mb-2">Complete Workflow:</h3>
                  <ul className="space-y-1 text-sm text-yellow-700">
                    <li>• Step 1: Business Basics (11 fields)</li>
                    <li>• Step 2: AI Product Selection</li>
                    <li>• Step 3: Business Details (12 fields)</li>
                    <li>• Step 4: Applicant Info (17 fields)</li>
                    <li>• Step 5: Document Upload</li>
                    <li>• Step 6: Consents & Agreements</li>
                    <li>• Step 7: Electronic Signature</li>
                  </ul>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">Archive Location:</h3>
                  <code className="text-sm bg-white px-2 py-1 rounded">
                    /v2-legacy-archive/ComprehensiveApplication.tsx
                  </code>
                </div>

                <Button 
                  onClick={() => setLocation('/comprehensive-application')}
                  variant="outline"
                  className="w-full border-orange-600 text-orange-600 hover:bg-orange-50"
                  disabled
                >
                  Comprehensive Form (Archived)
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Key Differences</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold text-teal-800 mb-2">Complexity</h3>
              <p className="text-sm text-gray-600">
                <strong>V1 Simple:</strong> 6 fields, single step<br/>
                <strong>Comprehensive:</strong> 42+ fields, 7 steps
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-teal-800 mb-2">User Experience</h3>
              <p className="text-sm text-gray-600">
                <strong>V1 Simple:</strong> Quick, focused<br/>
                <strong>Comprehensive:</strong> Detailed, progressive
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-teal-800 mb-2">Current Status</h3>
              <p className="text-sm text-gray-600">
                <strong>V1 Simple:</strong> Active, working<br/>
                <strong>Comprehensive:</strong> Archived, complete
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}