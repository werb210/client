import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Building2, DollarSign, FileText, CheckCircle } from 'lucide-react';
import { fetchLenderProducts, type LenderProduct } from '@/api/lenderProducts';

interface MatchedProduct extends LenderProduct {
  matchScore: number;
  matchReasons: string[];
}

export default function LenderProductMatcher() {
  const [userScenario, setUserScenario] = useState({
    fundingAmount: 40000,
    lookingFor: 'capital', // term_loan or working_capital
    country: 'US',
    hasAccountsReceivable: false
  });

  const { data: allProducts = [], isLoading } = useQuery({
    queryKey: ['lender-products'],
    queryFn: fetchLenderProducts,
  });

  // Filter and score products based on user scenario
  const getMatchingProducts = (): MatchedProduct[] => {
    if (!allProducts.length) return [];

    const filtered = allProducts.filter(product => {
      // Geography match
      const geoMatch = product.geography.includes(userScenario.country as 'US' | 'CA');
      
      // Amount range match
      const amountMatch = userScenario.fundingAmount >= product.minAmount && 
                         userScenario.fundingAmount <= product.maxAmount;
      
      // Product type match for capital/working capital
      const typeMatch = userScenario.lookingFor === 'capital' && 
                       (product.category === 'term_loan' || 
                        product.category === 'working_capital' ||
                        product.category === 'line_of_credit');

      return geoMatch && amountMatch && typeMatch;
    });

    // Add match scoring
    return filtered.map(product => {
      const matchReasons: string[] = [];
      let matchScore = 0;

      // Geography scoring
      if (product.geography.includes(userScenario.country as 'US' | 'CA')) {
        matchReasons.push(`Available in ${userScenario.country}`);
        matchScore += 20;
      }

      // Amount scoring (closer to minimum = higher score)
      const amountRatio = userScenario.fundingAmount / product.minAmount;
      if (amountRatio >= 1 && amountRatio <= 2) {
        matchReasons.push('Optimal funding amount range');
        matchScore += 30;
      } else if (amountRatio > 2) {
        matchReasons.push('Within funding range');
        matchScore += 20;
      }

      // Product type scoring
      if (product.productType === 'term_loan') {
        matchReasons.push('Term loan for business growth');
        matchScore += 25;
      } else if (product.productType === 'working_capital') {
        matchReasons.push('Working capital for operations');
        matchScore += 25;
      } else if (product.productType === 'line_of_credit') {
        matchReasons.push('Flexible line of credit');
        matchScore += 20;
      }

      // Lender reputation (major banks get bonus)
      const majorBanks = ['Bank of America', 'Wells Fargo', 'JPMorgan Chase', 'Capital One', 'TD Bank', 'BMO', 'RBC'];
      if (majorBanks.some(bank => product.lenderName.includes(bank))) {
        matchReasons.push('Major financial institution');
        matchScore += 15;
      }

      return {
        ...product,
        matchScore,
        matchReasons
      };
    }).sort((a, b) => b.matchScore - a.matchScore);
  };

  const matchingProducts = getMatchingProducts();

  // Get expected documents for this type of loan
  const getExpectedDocuments = (productType: string) => {
    const baseDocuments = [
      'Bank Statements (6 months)',
      'Business Tax Returns (2-3 years)',
      'Financial Statements (P&L, Balance Sheet)',
      'Business License',
      'Articles of Incorporation'
    ];

    const additionalDocs: Record<string, string[]> = {
      'term_loan': [
        'Business Plan or Use of Funds Statement',
        'Personal Financial Statement',
        'Personal Tax Returns (2 years)'
      ],
      'working_capital': [
        'Accounts Receivable Aging Report',
        'Inventory Reports',
        'Recent Invoice Samples'
      ],
      'line_of_credit': [
        'Accounts Receivable Aging Report',
        'Cash Flow Projections',
        'Equipment/Asset List (if applicable)'
      ]
    };

    return [...baseDocuments, ...(additionalDocs[productType] || [])];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Lender Product Matcher</h1>
          <p className="text-gray-600">
            Find which real lender products match your scenario and their document requirements
          </p>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Real-time matching using {allProducts.length}+ product database
          </Badge>
        </div>

        {/* Scenario Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-600" />
              User Scenario
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4 text-center">
              <div className="p-3 bg-blue-50 rounded-lg">
                <DollarSign className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                <div className="font-medium">$40,000</div>
                <div className="text-sm text-gray-600">Funding Amount</div>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <Building2 className="h-8 w-8 mx-auto text-green-600 mb-2" />
                <div className="font-medium">Term/Working Capital</div>
                <div className="text-sm text-gray-600">Loan Type</div>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <div className="font-medium">United States</div>
                <div className="text-sm text-gray-600">Location</div>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <div className="font-medium">No AR Balance</div>
                <div className="text-sm text-gray-600">Account Receivables</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
            <p className="text-gray-600 mt-2">Loading lender products...</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Matching Products */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Matching Lender Products ({matchingProducts.length})
                </CardTitle>
                <CardDescription>
                  Real products from the database that match your $40,000 capital loan scenario
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {matchingProducts.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No matching products found</p>
                    </div>
                  ) : (
                    matchingProducts.slice(0, 10).map((product) => (
                      <div key={product.id} className="border rounded-lg p-4 bg-white">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="font-medium text-gray-900">{product.productName}</div>
                            <div className="text-sm text-gray-600">{product.lenderName}</div>
                          </div>
                          <Badge variant="secondary" className="ml-2">
                            {product.matchScore}% match
                          </Badge>
                        </div>
                        
                        <div className="text-sm space-y-1 mb-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Amount Range:</span>
                            <span className="font-medium">
                              ${product.minAmount.toLocaleString()} - ${product.maxAmount.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Product Type:</span>
                            <span className="font-medium">{product.productType.replace('_', ' ')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Geography:</span>
                            <span className="font-medium">{product.geography.join(', ')}</span>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="text-xs text-gray-600 font-medium">Why this matches:</div>
                          {product.matchReasons.map((reason, idx) => (
                            <div key={idx} className="text-xs text-green-700 flex items-center gap-1">
                              <CheckCircle className="h-3 w-3" />
                              {reason}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Expected Documents */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  Expected Document Requirements
                </CardTitle>
                <CardDescription>
                  Documents typically required for this type of financing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['term_loan', 'working_capital', 'line_of_credit'].map(productType => (
                    <div key={productType} className="border rounded-lg p-4">
                      <h4 className="font-medium mb-3 capitalize">
                        {productType.replace('_', ' ')} Documents
                      </h4>
                      <div className="space-y-2">
                        {getExpectedDocuments(productType).map((doc, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                            <span>{doc}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <div className="font-medium text-blue-900">Document Requirements Summary</div>
                      <div className="text-sm text-blue-700 mt-1">
                        For a $40,000 term or working capital loan, you'll typically need 5-8 core documents 
                        plus 2-4 additional documents specific to the product type. The exact requirements 
                        depend on the specific lender and their underwriting criteria.
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Database Status */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-sm text-gray-600">
              {isLoading ? (
                'Loading from staff database...'
              ) : (
                `Found ${matchingProducts.length} matching products out of ${allProducts.length} total products in database`
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}