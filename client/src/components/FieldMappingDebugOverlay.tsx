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
  const [selectedTab, setSelectedTab] = useState<'overview' | 'products' | 'sanitization'>('overview');

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
      
      // Log summary
      const errorCount = productDiagnostics.filter(d => d.status === 'error').length;
      const warningCount = productDiagnostics.filter(d => d.status === 'warning').length;
      const healthyCount = productDiagnostics.filter(d => d.status === 'healthy').length;
      
      console.log(`[DEBUG_OVERLAY] Diagnostics complete:`, {
        total: products.length,
        healthy: healthyCount,
        warnings: warningCount,
        errors: errorCount,
        sanitizationFixes: allSanitizationLogs.length
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
              {(['overview', 'products', 'sanitization'] as const).map(tab => (
                <Button
                  key={tab}
                  onClick={() => setSelectedTab(tab)}
                  variant={selectedTab === tab ? 'default' : 'outline'}
                  size="sm"
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}