import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle, XCircle, AlertTriangle, Search, Filter, Clock, Target, Settings, BarChart3 } from 'lucide-react';
import { 
  debugRecommendationFiltering, 
  getCommonTestScenarios,
  type DebugInput,
  type RecommendationDebugResult 
} from '@/lib/recommendationDebugger';
import { getAdvancedRecommendations, type FilteringOptions, type RecommendationInput } from '@/lib/recommendationEngine';
import mockLenderProducts from '@/data/mockLenderProducts';

interface TestInput {
  country: string;
  amountRequested: number;
  whatAreYouLookingFor: string;
  purposeOfFunds: string;
  hasStrongFinancials: boolean;
}

export default function DevRecommendationDebug() {
  const [testInput, setTestInput] = useState<TestInput>({
    country: 'Canada',
    amountRequested: 100000,
    whatAreYouLookingFor: 'Term Loan',
    purposeOfFunds: 'Working Capital',
    hasStrongFinancials: false
  });
  
  const [debugResults, setDebugResults] = useState<RecommendationDebugResult | null>(null);
  const [advancedResults, setAdvancedResults] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);
  
  // Advanced scoring options
  const [filteringOptions, setFilteringOptions] = useState<FilteringOptions>({
    showFilteredOut: true,
    applyOverrideBoosts: true,
    logInternalScoring: true
  });

  // Fetch all lender products for analysis
  const { data: allProducts = [], isLoading, error } = useQuery({
    queryKey: ['/api/public/lender-products'],
  });

  // Type guard for products array - use mock data if API unavailable
  const products = Array.isArray(allProducts) && allProducts.length > 0 
    ? allProducts 
    : mockLenderProducts;

  const runDebugTest = async () => {
    setIsRunning(true);
    
    const debugInput: DebugInput = {
      country: testInput.country,
      amountRequested: testInput.amountRequested,
      category: testInput.whatAreYouLookingFor,
      purposeOfFunds: testInput.purposeOfFunds
    };
    
    const advancedInput: RecommendationInput = {
      country: testInput.country,
      amountRequested: testInput.amountRequested,
      category: testInput.whatAreYouLookingFor,
      purposeOfFunds: testInput.purposeOfFunds,
      hasStrongFinancials: testInput.hasStrongFinancials
    };
    
    try {
      // Run both original and advanced analysis
      const [originalResults, advancedResults] = await Promise.all([
        debugRecommendationFiltering(products, debugInput),
        Promise.resolve(getAdvancedRecommendations(products, advancedInput, filteringOptions))
      ]);
      
      setDebugResults(originalResults);
      setAdvancedResults(advancedResults);
    } catch (error) {
      console.error('Debug test failed:', error);
    } finally {
      setIsRunning(false);
    }
  };



  const presetTests = getCommonTestScenarios().map(scenario => ({
    name: scenario.name,
    input: {
      country: scenario.input.country,
      amountRequested: scenario.input.amountRequested,
      whatAreYouLookingFor: scenario.input.category,
      purposeOfFunds: scenario.input.purposeOfFunds || 'General Business'
    }
  }));

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading lender products...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center space-x-3">
        <Search className="w-6 h-6 text-blue-600" />
        <h1 className="text-2xl font-bold">Step 2 Recommendation Debug</h1>
        <Badge variant="outline">Dev Tool</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Test Input Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="w-5 h-5" />
              <span>Test Input Configuration</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Country</label>
              <Select 
                value={testInput.country} 
                onValueChange={(value) => setTestInput(prev => ({ ...prev, country: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Canada">Canada</SelectItem>
                  <SelectItem value="USA">United States</SelectItem>
                  <SelectItem value="Both">Both Countries</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Amount Requested</label>
              <Input
                type="number"
                value={testInput.amountRequested}
                onChange={(e) => setTestInput(prev => ({ ...prev, amountRequested: parseInt(e.target.value) || 0 }))}
                placeholder="100000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Looking For</label>
              <Select 
                value={testInput.whatAreYouLookingFor} 
                onValueChange={(value) => setTestInput(prev => ({ ...prev, whatAreYouLookingFor: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Term Loan">Term Loan</SelectItem>
                  <SelectItem value="Equipment Financing">Equipment Financing</SelectItem>
                  <SelectItem value="Business Line of Credit">Business Line of Credit</SelectItem>
                  <SelectItem value="Working Capital">Working Capital</SelectItem>
                  <SelectItem value="Invoice Factoring">Invoice Factoring</SelectItem>
                  <SelectItem value="Asset-Based Lending">Asset-Based Lending</SelectItem>
                  <SelectItem value="Purchase Order Financing">Purchase Order Financing</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Purpose of Funds</label>
              <Input
                value={testInput.purposeOfFunds}
                onChange={(e) => setTestInput(prev => ({ ...prev, purposeOfFunds: e.target.value }))}
                placeholder="Working Capital"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={testInput.hasStrongFinancials}
                onCheckedChange={(checked) => setTestInput(prev => ({ ...prev, hasStrongFinancials: checked }))}
              />
              <label className="text-sm font-medium">Strong Financials</label>
            </div>

            {/* Advanced Options */}
            <div className="pt-4 border-t">
              <h3 className="font-medium mb-3 flex items-center space-x-2">
                <Settings className="w-4 h-4" />
                <span>Advanced Options</span>
              </h3>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={filteringOptions.showFilteredOut}
                    onCheckedChange={(checked) => setFilteringOptions(prev => ({ ...prev, showFilteredOut: checked }))}
                  />
                  <label className="text-sm">Show filtered-out lenders</label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={filteringOptions.applyOverrideBoosts}
                    onCheckedChange={(checked) => setFilteringOptions(prev => ({ ...prev, applyOverrideBoosts: checked }))}
                  />
                  <label className="text-sm">Apply override boosts</label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={filteringOptions.logInternalScoring}
                    onCheckedChange={(checked) => setFilteringOptions(prev => ({ ...prev, logInternalScoring: checked }))}
                  />
                  <label className="text-sm">Log internal scoring</label>
                </div>
              </div>
            </div>

            <Button 
              onClick={runDebugTest} 
              disabled={isRunning}
              className="w-full"
            >
              {isRunning ? 'Running Analysis...' : 'Run Debug Test'}
            </Button>

            {/* Preset Tests */}
            <div className="pt-4 border-t">
              <h3 className="font-medium mb-2">Quick Tests</h3>
              <div className="grid grid-cols-1 gap-2">
                {presetTests.map((preset, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => setTestInput(preset.input)}
                    className="text-left justify-start"
                  >
                    {preset.name}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Debug Results Summary</CardTitle>
          </CardHeader>
          <CardContent>
            {debugResults ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {debugResults.passedProducts.length}
                    </div>
                    <div className="text-sm text-green-800">Passed Products</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      {debugResults.failedProducts.length}
                    </div>
                    <div className="text-sm text-red-800">Failed Products</div>
                  </div>
                </div>

                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-lg font-semibold text-blue-600">
                    {debugResults.totalProducts} Total Products
                  </div>
                  <div className="text-sm text-blue-800">
                    Analysis completed in {debugResults.executionTimeMs.toFixed(2)}ms
                  </div>
                </div>

                {Object.keys(debugResults.categoryBreakdown).length > 0 && (
                  <div>
                    <h3 className="font-medium mb-2">Categories Found</h3>
                    <div className="space-y-1">
                      {Object.entries(debugResults.categoryBreakdown).map(([category, count]) => (
                        <div key={category} className="flex justify-between items-center">
                          <span className="text-sm">{category}</span>
                          <Badge variant="secondary">{count}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {Object.keys(debugResults.countryBreakdown).length > 0 && (
                  <div>
                    <h3 className="font-medium mb-2">Countries Found</h3>
                    <div className="space-y-1">
                      {Object.entries(debugResults.countryBreakdown).map(([country, count]) => (
                        <div key={country} className="flex justify-between items-center">
                          <span className="text-sm">{country}</span>
                          <Badge variant="outline">{count}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <Filter className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Run a debug test to see results</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Results */}
      {debugResults && (
        <Card>
          <CardHeader>
            <CardTitle>Detailed Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="matched">
              <TabsList>
                <TabsTrigger value="matched" className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Passed ({debugResults.passedProducts.length})</span>
                </TabsTrigger>
                <TabsTrigger value="skipped" className="flex items-center space-x-2">
                  <XCircle className="w-4 h-4" />
                  <span>Failed ({debugResults.failedProducts.length})</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="matched" className="space-y-3">
                {debugResults.passedProducts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
                    <p>No products passed the criteria</p>
                    <p className="text-sm">Check the "Failed" tab to see why products were excluded</p>
                  </div>
                ) : (
                  debugResults.passedProducts.map((item, index) => (
                    <div key={index} className="p-4 border rounded-lg bg-green-50">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-green-900">
                          {item.productName} ({item.lenderName})
                        </h3>
                        <Badge className="bg-green-200 text-green-800">
                          Score: {item.score}
                        </Badge>
                      </div>
                      <div className="text-sm text-green-800 space-y-1">
                        <p><strong>Category:</strong> {item.category}</p>
                        <p><strong>Country:</strong> {item.country}</p>
                        <p><strong>Amount Range:</strong> ${item.amountRange.min?.toLocaleString() || 'N/A'} - ${item.amountRange.max?.toLocaleString() || 'N/A'}</p>
                        <div>
                          <strong>Analysis:</strong>
                          <ul className="list-disc list-inside mt-1">
                            {item.failureReasons.map((reason, idx) => (
                              <li key={idx} className="text-xs">{reason}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </TabsContent>

              <TabsContent value="skipped" className="space-y-3">
                {debugResults.failedProducts.map((item, index) => (
                  <div key={index} className="p-4 border rounded-lg bg-red-50">
                    <h3 className="font-medium text-red-900 mb-2">
                      {item.productName} ({item.lenderName})
                    </h3>
                    <div className="text-sm text-red-800 space-y-1">
                      <p><strong>Category:</strong> {item.category}</p>
                      <p><strong>Country:</strong> {item.country}</p>
                      <p><strong>Amount Range:</strong> ${item.amountRange.min?.toLocaleString() || 'N/A'} - ${item.amountRange.max?.toLocaleString() || 'N/A'}</p>
                      <div>
                        <strong>Exclusion Reasons:</strong>
                        <ul className="list-disc list-inside mt-1">
                          {item.failureReasons.map((reason, idx) => (
                            <li key={idx} className="text-xs">{reason}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}