/**
 * Field Mapping Debug Overlay
 * Shows detailed field mapping diagnostics for Step 2 recommendations
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, XCircle, Eye, EyeOff } from 'lucide-react';
import { validateLenderProduct, type ProductDiagnostic, type FieldMismatch } from '@/lib/expectedLenderFields';
import { sanitizeLenderProduct, type SanitizationLog } from '@/lib/sanitizeLenderProduct';
import { validateAllProductsRequiredDocuments, type ValidationSummary } from '@/utils/requiredDocumentsValidator';

interface FieldMappingDebugOverlayProps {
  products: any[];
  formData: any;
  isVisible: boolean;
  onToggle: () => void;
}

export function FieldMappingDebugOverlay({ 
  products, 
  formData, 
  isVisible, 
  onToggle 
}: FieldMappingDebugOverlayProps) {
  const [diagnostics, setDiagnostics] = useState<ProductDiagnostic[]>([]);
  const [sanitizationLogs, setSanitizationLogs] = useState<SanitizationLog[]>([]);
  const [documentsValidation, setDocumentsValidation] = useState<ValidationSummary | null>(null);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'products' | 'sanitization' | 'documents'>('overview');

  useEffect(() => {
    if (products && products.length > 0) {
      console.log('[DEBUG_OVERLAY] Running field mapping diagnostics...');
      
      // Run diagnostics on all products
      const productDiagnostics = products.map(product => validateLenderProduct(product));
      setDiagnostics(productDiagnostics);
      
      // Run sanitization to see what would be fixed
      const allSanitizationLogs: SanitizationLog[] = [];
      products.forEach(product => {
        const { logs } = sanitizeLenderProduct(product);
        allSanitizationLogs.push(...logs);
      });
      setSanitizationLogs(allSanitizationLogs);
      
      // Run critical Step 5 document validation
      const docValidation = validateAllProductsRequiredDocuments(products);
      setDocumentsValidation(docValidation);
      
      // Log summary
      const errorCount = productDiagnostics.filter(d => d.status === 'error').length;
      const warningCount = productDiagnostics.filter(d => d.status === 'warning').length;
      const healthyCount = productDiagnostics.filter(d => d.status === 'healthy').length;
      
      console.log(`[DEBUG_OVERLAY] Diagnostics complete:`, {
        total: products.length,
        healthy: healthyCount,
        warnings: warningCount,
        errors: errorCount,
        sanitizationFixes: allSanitizationLogs.length,
        documentsValidation: docValidation
      });
    }
  }, [products]);

  if (!isVisible) {
    return (
      <Button
        onClick={onToggle}
        variant="outline"
        size="sm"
        className="fixed bottom-4 right-4 z-50 bg-white border-2 border-red-500 text-red-600 hover:bg-red-50"
      >
        <Eye className="w-4 h-4 mr-2" />
        Show Debug Overlay
      </Button>
    );
  }

  const errorProducts = diagnostics.filter(d => d.status === 'error');
  const warningProducts = diagnostics.filter(d => d.status === 'warning');
  const healthyProducts = diagnostics.filter(d => d.status === 'healthy');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-auto">
      <div className="min-h-screen p-4">
        <Card className="max-w-7xl mx-auto">
          <CardHeader className="bg-red-50 border-b">
            <div className="flex justify-between items-center">
              <CardTitle className="text-red-800 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Field Mapping Debug Overlay
              </CardTitle>
              <Button
                onClick={onToggle}
                variant="outline"
                size="sm"
                className="text-red-600 border-red-300"
              >
                <EyeOff className="w-4 h-4 mr-2" />
                Hide Debug
              </Button>
            </div>
            
            {/* Tab Navigation */}
            <div className="flex space-x-2 mt-4">
              {(['overview', 'products', 'sanitization', 'documents'] as const).map(tab => (
                <Button
                  key={tab}
                  onClick={() => setSelectedTab(tab)}
                  variant={selectedTab === tab ? 'default' : 'outline'}
                  size="sm"
                  className={tab === 'documents' && documentsValidation?.criticalIssues.length ? 'border-red-500 text-red-600' : ''}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  {tab === 'documents' && documentsValidation?.criticalIssues.length ? ` (${documentsValidation.criticalIssues.length})` : ''}
                </Button>
              ))}
            </div>
          </CardHeader>
          
          <CardContent className="max-h-[80vh] overflow-auto">
            {selectedTab === 'overview' && (
              <div className="space-y-6">
                {/* Summary Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-gray-800">{products.length}</div>
                    <div className="text-sm text-gray-600">Total Products</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-800">{healthyProducts.length}</div>
                    <div className="text-sm text-green-600">Healthy</div>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-800">{warningProducts.length}</div>
                    <div className="text-sm text-yellow-600">Warnings</div>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-red-800">{errorProducts.length}</div>
                    <div className="text-sm text-red-600">Errors</div>
                  </div>
                </div>

                {/* Form Data Analysis */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-2">Current Form Data</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-blue-600">Business Location:</span>
                      <div className="font-medium">{formData.businessLocation || 'Not set'}</div>
                    </div>
                    <div>
                      <span className="text-blue-600">Headquarters:</span>
                      <div className="font-medium">{formData.headquarters || 'Not set'}</div>
                    </div>
                    <div>
                      <span className="text-blue-600">Funding Amount:</span>
                      <div className="font-medium">${formData.fundingAmount?.toLocaleString() || 'Not set'}</div>
                    </div>
                    <div>
                      <span className="text-blue-600">Looking For:</span>
                      <div className="font-medium">{formData.lookingFor || 'Not set'}</div>
                    </div>
                  </div>
                </div>

                {/* Top Issues */}
                {errorProducts.length > 0 && (
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-red-800 mb-2">Critical Issues</h3>
                    <div className="space-y-2">
                      {errorProducts.slice(0, 5).map(product => (
                        <div key={product.productId} className="text-sm">
                          <span className="font-medium">{product.productName}</span>
                          <span className="text-red-600 ml-2">
                            {product.missingFields.length} missing fields, 
                            {product.mismatchedFields.filter(m => m.severity === 'error').length} errors
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {selectedTab === 'products' && (
              <div className="space-y-4">
                {diagnostics.map(diagnostic => (
                  <Card key={diagnostic.productId} className="border-l-4 border-l-gray-300">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{diagnostic.productName}</div>
                          <div className="text-sm text-gray-600">ID: {diagnostic.productId}</div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={
                            diagnostic.status === 'healthy' ? 'default' : 
                            diagnostic.status === 'warning' ? 'secondary' : 'destructive'
                          }>
                            {diagnostic.status === 'healthy' && <CheckCircle className="w-3 h-3 mr-1" />}
                            {diagnostic.status === 'error' && <XCircle className="w-3 h-3 mr-1" />}
                            {diagnostic.status === 'warning' && <AlertTriangle className="w-3 h-3 mr-1" />}
                            {diagnostic.score}%
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {diagnostic.missingFields.length > 0 && (
                        <div className="mb-2">
                          <div className="text-sm font-medium text-red-600">Missing Fields:</div>
                          <div className="text-sm text-red-500">
                            {diagnostic.missingFields.join(', ')}
                          </div>
                        </div>
                      )}
                      {diagnostic.mismatchedFields.length > 0 && (
                        <div>
                          <div className="text-sm font-medium text-yellow-600">Field Mismatches:</div>
                          <div className="space-y-1">
                            {diagnostic.mismatchedFields.map((mismatch, index) => (
                              <div key={index} className="text-sm">
                                <span className="font-medium">{mismatch.field}:</span>
                                <span className="text-gray-600 ml-1">
                                  {mismatch.actualType} (expected {mismatch.expectedType})
                                </span>
                                {mismatch.suggestion && (
                                  <div className="text-xs text-blue-600 ml-2">💡 {mismatch.suggestion}</div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {selectedTab === 'sanitization' && (
              <div className="space-y-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-2">Auto-Fix Summary</h3>
                  <div className="text-sm text-green-700">
                    {sanitizationLogs.length} automatic fixes would be applied across {products.length} products
                  </div>
                </div>
                
                <div className="space-y-3">
                  {sanitizationLogs.map((log, index) => (
                    <div key={index} className="bg-white border border-gray-200 p-3 rounded">
                      <div className="font-medium text-sm">{log.productName}</div>
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">{log.field}:</span> {log.action}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {JSON.stringify(log.originalValue)} → {JSON.stringify(log.sanitizedValue)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {selectedTab === 'documents' && (
              <div className="space-y-6">
                {/* Critical Step 5 Document Requirements Analysis */}
                <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
                  <h3 className="font-semibold text-orange-800 mb-2 flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2" />
                    Step 5 Document Upload Dependencies
                  </h3>
                  <p className="text-sm text-orange-700 mb-4">
                    Step 5 (Document Upload) <strong>completely depends</strong> on products having valid `requiredDocuments` arrays. 
                    Missing this field breaks the entire document collection workflow.
                  </p>
                  
                  {documentsValidation && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="bg-white p-3 rounded border">
                        <div className="text-lg font-bold text-gray-800">{documentsValidation.totalProducts}</div>
                        <div className="text-xs text-gray-600">Total Products</div>
                      </div>
                      <div className="bg-green-50 p-3 rounded border border-green-200">
                        <div className="text-lg font-bold text-green-800">{documentsValidation.productsWithDocuments}</div>
                        <div className="text-xs text-green-600">With requiredDocuments</div>
                      </div>
                      <div className="bg-red-50 p-3 rounded border border-red-200">
                        <div className="text-lg font-bold text-red-800">{documentsValidation.productsWithoutDocuments}</div>
                        <div className="text-xs text-red-600">Missing requiredDocuments</div>
                      </div>
                    </div>
                  )}
                  
                  {documentsValidation?.criticalIssues.length > 0 && (
                    <div className="bg-red-50 border border-red-200 p-3 rounded">
                      <h4 className="font-medium text-red-800 mb-2">Products That Will Break Step 5:</h4>
                      <div className="space-y-1 text-sm">
                        {documentsValidation.criticalIssues.slice(0, 10).map(issue => (
                          <div key={issue.productId} className="flex justify-between items-center">
                            <span className="text-red-700">{issue.productName}</span>
                            <Badge variant="destructive" className="text-xs">
                              No Documents Field
                            </Badge>
                          </div>
                        ))}
                        {documentsValidation.criticalIssues.length > 10 && (
                          <div className="text-red-600 text-xs mt-2">
                            +{documentsValidation.criticalIssues.length - 10} more products missing requiredDocuments
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {documentsValidation?.recommendations.length > 0 && (
                    <div className="bg-blue-50 border border-blue-200 p-3 rounded mt-4">
                      <h4 className="font-medium text-blue-800 mb-2">Immediate Actions Required:</h4>
                      <ul className="space-y-1 text-sm">
                        {documentsValidation.recommendations.map((rec, index) => (
                          <li key={index} className="text-blue-700 flex items-start">
                            <span className="text-blue-500 mr-2">•</span>
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                
                {/* Fallback Document Categories Reference */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-3">Default Document Requirements by Category</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    When products are missing requiredDocuments, the system can use these category-based defaults:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <div><strong>Term Loan:</strong> Bank Statements, Tax Returns, Financial Statements</div>
                      <div><strong>Business Line of Credit:</strong> Bank Statements, Tax Returns, Financial Statements</div>
                      <div><strong>Equipment Financing:</strong> Bank Statements, Tax Returns, Equipment Quote</div>
                      <div><strong>Working Capital:</strong> Bank Statements, Tax Returns, Cash Flow Statement</div>
                    </div>
                    <div className="space-y-2">
                      <div><strong>Invoice Factoring:</strong> Bank Statements, A/R Aging, Sample Invoices</div>
                      <div><strong>Purchase Order Financing:</strong> Bank Statements, Purchase Orders, Supplier Contracts</div>
                      <div><strong>Asset-Based Lending:</strong> Bank Statements, Tax Returns, Asset Appraisal, Financial Statements</div>
                      <div><strong>SBA Loan:</strong> Bank Statements, Tax Returns, Financial Statements, Business Plan</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}