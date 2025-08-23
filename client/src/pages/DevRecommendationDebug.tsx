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
import { CheckCircle, XCircle, AlertTriangle, Search, Filter, Clock, Target, Settings, BarChart3, FileText } from 'lucide-react';
import { 
  debugRecommendationFiltering, 
  getCommonTestScenarios,
  type DebugInput,
  type RecommendationDebugResult 
} from '@/lib/recommendationDebugger';
import { type FilteringOptions, type RecommendationInput } from '@/lib/recommendationEngine';
import mockLenderProducts from '@/data/mockLenderProducts';
import { ENHANCED_DOCUMENT_REQUIREMENTS } from '../../../shared/documentMapping';
import { DOCUMENT_TYPE_LABELS } from '../../../shared/documentTypes';

interface TestInput {
  country: string;
  amountRequested: number;
  whatAreYouLookingFor: string;
  purposeOfFunds: string;
  hasStrongFinancials: boolean;
}

// Purpose of Funds options matching Step 1 exactly
const fundsPurposeOptions = [
  { value: 'equipment', label: 'Equipment Purchase' },
  { value: 'inventory', label: 'Inventory Purchase' },
  { value: 'expansion', label: 'Business Expansion' },
  { value: 'working_capital', label: 'Working Capital' },
];

// Helper function to get required documents by category
const getRequiredDocumentsByCategory = (category: string): string[] => {
  // Normalize category name for mapping
  const normalizedCategory = category.toLowerCase().replace(/\s+/g, '_');
  
  // Category mappings
  const categoryMappings: Record<string, string> = {
    'term_loan': 'term_loan',
    'business_line_of_credit': 'line_of_credit',
    'line_of_credit': 'line_of_credit',
    'equipment_financing': 'equipment_financing',
    'working_capital': 'working_capital',
    'invoice_factoring': 'invoice_factoring',
    'purchase_order_financing': 'purchase_order_financing',
    'asset-based_lending': 'asset_based_lending',
    'asset_based_lending': 'asset_based_lending',
    
    // Alternative naming patterns
    'equipment': 'equipment_financing',
    'factoring': 'invoice_factoring',
    'capital': 'working_capital',
    'loan': 'term_loan',
    'credit': 'line_of_credit',
  };

  const mappedCategory = categoryMappings[normalizedCategory] || normalizedCategory;
  const documentTypes = ENHANCED_DOCUMENT_REQUIREMENTS[mappedCategory] || [];
  
  // Convert document types to display labels
  return documentTypes.map(docType => 
    DOCUMENT_TYPE_LABELS[docType] || docType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  );
};

export default function DevRecommendationDebug() {
  const [testInput, setTestInput] = useState<TestInput>({
    country: 'Canada',
    amountRequested: 100000,
    whatAreYouLookingFor: 'Term Loan',
    purposeOfFunds: 'working_capital',
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
    
    // Run advanced recommendation engine
    const recommendationInput: RecommendationInput = {
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
        Promise.resolve(getAdvancedRecommendations(products, recommendationInput, filteringOptions))
      ]);
      
      setDebugResults(originalResults);
      setAdvancedResults(advancedResults);
      
      // Send recommendation log to analytics if we have results (non-blocking)
      if (advancedResults.qualifiedProducts.length > 0) {
        // Don't await - run analytics in background without blocking UI
        setTimeout(async () => {
          try {
            const response = await fetch('/api/analytics/recommendation-log', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${import.meta.env.VITE_CLIENT_APP_SHARED_TOKEN || ''}`
              },
              body: JSON.stringify({
                applicantId: localStorage.getItem('applicationId') || 'debug-test-session',
                recommendedLenders: advancedResults.qualifiedProducts.map(p => ({
                  productId: p.productId,
                  productName: p.name,
                  lenderName: p.lenderName,
                  category: p.category,
                  country: p.country,
                  score: p.matchScore
                })),
                rejectedLenders: advancedResults.filteredOutProducts.map(p => ({
                  productId: p.productId,
                  productName: p.name,
                  lenderName: p.lenderName,
                  category: p.category,
                  country: p.country,
                  failureReasons: p.rejectionReasons
                })),
                filtersApplied: [
                  `Country: ${testInput.country}`,
                  `Amount: ${testInput.amountRequested.toLocaleString()}`,
                  `Category: ${testInput.whatAreYouLookingFor}`,
                  `Purpose: ${testInput.purposeOfFunds}`
                ],
                timestamp: new Date().toISOString(),
                source: 'debug-panel'
              })
            });
            
            if (response.ok) {
              console.log('✅ [ANALYTICS] Advanced scoring log sent successfully');
            } else {
              console.warn('⚠️ [ANALYTICS] Advanced scoring log failed:', response.status);
            }
          } catch (analyticsError) {
            console.warn('⚠️ [ANALYTICS] Advanced scoring log failed (non-critical):', analyticsError instanceof Error ? analyticsError.message : analyticsError);
          }
        }, 100);
      }
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
      purposeOfFunds: scenario.input.purposeOfFunds || 'working_capital'
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
              <Select 
                value={testInput.purposeOfFunds} 
                onValueChange={(value) => setTestInput(prev => ({ ...prev, purposeOfFunds: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select purpose of funds" />
                </SelectTrigger>
                <SelectContent>
                  {fundsPurposeOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                {advancedResults && (
                  <TabsTrigger value="scoring" className="flex items-center space-x-2">
                    <BarChart3 className="w-4 h-4" />
                    <span>Advanced Scoring ({advancedResults.qualifiedProducts.length})</span>
                  </TabsTrigger>
                )}
                {debugResults && debugResults.passedProducts.length > 0 && (
                  <TabsTrigger value="documents" className="flex items-center space-x-2">
                    <FileText className="w-4 h-4" />
                    <span>Required Documents</span>
                  </TabsTrigger>
                )}
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

              {/* Advanced Scoring Tab */}
              {advancedResults && (
                <TabsContent value="scoring" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {advancedResults.qualifiedProducts.length}
                      </div>
                      <div className="text-sm text-blue-800">Qualified Products</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-600">
                        {advancedResults.executionTime.toFixed(2)}ms
                      </div>
                      <div className="text-sm text-gray-800">Execution Time</div>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse border border-gray-200">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="border border-gray-200 px-2 py-1 text-left">Product</th>
                          <th className="border border-gray-200 px-2 py-1 text-center">Score</th>
                          <th className="border border-gray-200 px-2 py-1 text-center">Confidence</th>
                          <th className="border border-gray-200 px-2 py-1 text-center">Category</th>
                          <th className="border border-gray-200 px-2 py-1 text-center">Amount</th>
                          <th className="border border-gray-200 px-2 py-1 text-center">Country</th>
                          <th className="border border-gray-200 px-2 py-1 text-center">Interest</th>
                          <th className="border border-gray-200 px-2 py-1 text-center">Top Lender</th>
                        </tr>
                      </thead>
                      <tbody>
                        {advancedResults.qualifiedProducts.map((product: any, index: number) => (
                          <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="border border-gray-200 px-2 py-1">
                              <div className="font-medium">{product.name}</div>
                              <div className="text-xs text-gray-500">{product.lenderName}</div>
                            </td>
                            <td className="border border-gray-200 px-2 py-1 text-center">
                              <Badge 
                                className={
                                  product.matchScore >= 70 ? 'bg-green-100 text-green-800' :
                                  product.matchScore >= 50 ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }
                              >
                                {product.matchScore}
                              </Badge>
                            </td>
                            <td className="border border-gray-200 px-2 py-1 text-center">
                              <Badge 
                                variant={
                                  product.confidenceLevel === 'high' ? 'default' :
                                  product.confidenceLevel === 'medium' ? 'secondary' : 'outline'
                                }
                              >
                                {product.confidenceLevel}
                              </Badge>
                            </td>
                            <td className="border border-gray-200 px-2 py-1 text-center">
                              <span className="text-xs">
                                {product.scoreBreakdown.categoryMatch}pts
                              </span>
                            </td>
                            <td className="border border-gray-200 px-2 py-1 text-center">
                              <span className="text-xs">
                                {product.scoreBreakdown.amountFit}pts
                              </span>
                            </td>
                            <td className="border border-gray-200 px-2 py-1 text-center">
                              <span className="text-xs">
                                {product.scoreBreakdown.countryPreference}pts
                              </span>
                            </td>
                            <td className="border border-gray-200 px-2 py-1 text-center">
                              <span className="text-xs">
                                {product.scoreBreakdown.interestRateBonus}pts
                              </span>
                            </td>
                            <td className="border border-gray-200 px-2 py-1 text-center">
                              <span className="text-xs">
                                {product.scoreBreakdown.topLenderBonus}pts
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {advancedResults.filteredOutProducts.length > 0 && (
                    <div>
                      <h3 className="font-medium mb-2 text-red-600">Filtered Out Products</h3>
                      <div className="space-y-2">
                        {advancedResults.filteredOutProducts.slice(0, 5).map((product: any, index: number) => (
                          <div key={index} className="p-2 border rounded bg-red-50 text-sm">
                            <div className="font-medium">{product.name} ({product.lenderName})</div>
                            <div className="text-xs text-red-600">
                              Rejected: {product.rejectionReasons.join(', ')}
                            </div>
                          </div>
                        ))}
                        {advancedResults.filteredOutProducts.length > 5 && (
                          <div className="text-xs text-gray-500 text-center">
                            ... and {advancedResults.filteredOutProducts.length - 5} more
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </TabsContent>
              )}

              {/* Required Documents Tab */}
              {debugResults && debugResults.passedProducts.length > 0 && (
                <TabsContent value="documents" className="space-y-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg mb-4">
                    <div className="text-lg font-semibold text-blue-600">
                      Document Requirements by Category
                    </div>
                    <div className="text-sm text-blue-800">
                      Shows required documents for each qualified product category
                    </div>
                  </div>

                  {/* Group products by category and show document requirements */}
                  {(() => {
                    const categoriesWithDocs = new Map<string, { products: any[], documents: string[] }>();
                    
                    // Group products by category
                    debugResults.passedProducts.forEach(product => {
                      const category = product.category;
                      if (!categoriesWithDocs.has(category)) {
                        categoriesWithDocs.set(category, {
                          products: [],
                          documents: getRequiredDocumentsByCategory(category)
                        });
                      }
                      categoriesWithDocs.get(category)!.products.push(product);
                    });

                    return Array.from(categoriesWithDocs.entries()).map(([category, data]) => (
                      <div key={category} className="border rounded-lg p-4 bg-white">
                        <div className="flex justify-between items-center mb-3">
                          <h3 className="font-medium text-lg">{category}</h3>
                          <Badge variant="outline">
                            {data.products.length} product{data.products.length !== 1 ? 's' : ''}
                          </Badge>
                        </div>
                        
                        <div className="mb-3">
                          <h4 className="text-sm font-medium text-gray-600 mb-2">Products in this category:</h4>
                          <div className="flex flex-wrap gap-2">
                            {data.products.map((product, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {product.lenderName}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-gray-600 mb-2">Required Documents:</h4>
                          {data.documents.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {data.documents.map((doc, idx) => (
                                <div key={idx} className="flex items-center space-x-2 p-2 bg-gray-50 rounded text-sm">
                                  <FileText className="w-4 h-4 text-gray-500" />
                                  <span>{doc}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-sm text-gray-500 italic">
                              No specific document requirements found for this category
                            </div>
                          )}
                        </div>
                      </div>
                    ));
                  })()}
                </TabsContent>
              )}
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}