import React, { useState, useEffect } from 'react';
import { mapToBackendDocumentType } from '@/lib/docNormalization';
import { SUPPORTED_DOCUMENT_TYPES } from '../../../shared/documentTypes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle, XCircle, Search, Database, Code } from 'lucide-react';

interface MappingResult {
  clientType: string;
  mappedType: string;
  isValidBackend: boolean;
  error?: string;
  notes?: string;
}

export default function DevDocumentMapping() {
  const [mappings, setMappings] = useState<MappingResult[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [testInput, setTestInput] = useState('');
  const [testResult, setTestResult] = useState<MappingResult | null>(null);
  const [apiReference, setApiReference] = useState<any>(null);

  // All client-side document types to test
  const CLIENT_DOCUMENT_TYPES = [
    // Official backend types
    ...SUPPORTED_DOCUMENT_TYPES,
    // Client-side variations
    'bank_statement',
    'banking_statements',
    'bank_account_statements',
    'account_prepared_financials',
    'accountant_prepared_financials', 
    'accountant_prepared_statements',
    'accountant_prepared_financial_statements',
    'audited_financial_statements',
    'audited_financials',
    'compiled_financial_statements',
    'pnl_statement',
    'p&l_statement',
    'income_statement',
    'profit_and_loss_statement',
    'tax_return',
    'business_tax_returns',
    'corporate_tax_returns',
    'void_cheque',
    'void_check',
    'voided_check',
    'cancelled_check',
    'banking_info',
    'bank_verification',
    'driver_license',
    'drivers_license',
    'driving_license',
    'id_verification',
    'government_id',
    'invoice_summary',
    'invoices',
    'sample_invoices',
    'customer_invoices',
    'ar_report',
    'receivables',
    'ar_aging',
    'accounts_receivable_aging',
    'ap_report',
    'payables',
    'ap_aging',
    'accounts_payable_aging',
    'equipment_invoice',
    'equipment_specifications',
    'operating_license',
    'professional_license',
    'incorporation_documents',
    'corporate_formation_documents',
    'personal_financial_statements',
    'personal_balance_sheet',
    'collateral_documents',
    'security_documents',
    'identity_verification',
    'id_documents',
    'supplier_contracts',
    'vendor_agreements',
    'business_plans',
    'financial_projections',
    'personal_guarantees',
    'guarantee_documents',
    'completed_application',
    'loan_application',
  ];

  useEffect(() => {
    generateMappings();
    fetchApiReference();
  }, []);

  const generateMappings = () => {
    const results: MappingResult[] = [];
    
    CLIENT_DOCUMENT_TYPES.forEach(clientType => {
      try {
        const mappedType = mapToBackendDocumentType(clientType);
        const isValidBackend = SUPPORTED_DOCUMENT_TYPES.includes(mappedType as any);
        
        results.push({
          clientType,
          mappedType,
          isValidBackend,
          notes: clientType === mappedType ? 'Direct match' : 'Mapped'
        });
      } catch (error) {
        results.push({
          clientType,
          mappedType: 'ERROR',
          isValidBackend: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          notes: 'Unmapped type'
        });
      }
    });

    setMappings(results);
  };

  const fetchApiReference = async () => {
    try {
      const response = await fetch('/api/internal/document-types/map-reference');
      if (response.ok) {
        const data = await response.json();
        setApiReference(data);
      }
    } catch (error) {
      console.log('API reference endpoint not available');
    }
  };

  const testMapping = () => {
    if (!testInput.trim()) return;

    try {
      const mappedType = mapToBackendDocumentType(testInput.trim());
      const isValidBackend = SUPPORTED_DOCUMENT_TYPES.includes(mappedType as any);
      
      setTestResult({
        clientType: testInput.trim(),
        mappedType,
        isValidBackend,
        notes: testInput.trim() === mappedType ? 'Direct match' : 'Mapped'
      });
    } catch (error) {
      setTestResult({
        clientType: testInput.trim(),
        mappedType: 'ERROR',
        isValidBackend: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        notes: 'Unmapped type'
      });
    }
  };

  const filteredMappings = mappings.filter(mapping =>
    mapping.clientType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mapping.mappedType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: mappings.length,
    valid: mappings.filter(m => m.isValidBackend).length,
    errors: mappings.filter(m => !m.isValidBackend).length,
    directMatches: mappings.filter(m => m.clientType === m.mappedType).length,
    mappedTypes: mappings.filter(m => m.clientType !== m.mappedType && m.isValidBackend).length
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Database className="h-8 w-8" />
          Document Type Mapping Reference
        </h1>
        <p className="text-muted-foreground">
          Live reference of all client-side document types and their backend mappings
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total Types</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.valid}</div>
            <div className="text-sm text-muted-foreground">Valid Mappings</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{stats.errors}</div>
            <div className="text-sm text-muted-foreground">Errors</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.directMatches}</div>
            <div className="text-sm text-muted-foreground">Direct Matches</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.mappedTypes}</div>
            <div className="text-sm text-muted-foreground">Mapped Types</div>
          </CardContent>
        </Card>
      </div>

      {/* Test Input */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Test Document Type Mapping
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Input
              placeholder="Enter document type to test..."
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && testMapping()}
            />
            <Button onClick={testMapping}>
              Test Mapping
            </Button>
          </div>
          
          {testResult && (
            <div className="p-4 border rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 mb-2">
                {testResult.isValidBackend ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                <strong>Test Result</strong>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Input Type</div>
                  <div className="font-mono">{testResult.clientType}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Mapped Type</div>
                  <div className="font-mono">{testResult.mappedType}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Status</div>
                  <Badge variant={testResult.isValidBackend ? "default" : "destructive"}>
                    {testResult.error || testResult.notes}
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Search and Filter */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            <Input
              placeholder="Search document types..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Mapping Table */}
      <Card>
        <CardHeader>
          <CardTitle>Document Type Mappings ({filteredMappings.length} of {mappings.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Client Type</th>
                  <th className="text-left p-2">Mapped Type</th>
                  <th className="text-left p-2">Valid Backend Enum</th>
                  <th className="text-left p-2">Notes</th>
                </tr>
              </thead>
              <tbody>
                {filteredMappings.map((mapping, index) => (
                  <tr key={index} className="border-b hover:bg-muted/50">
                    <td className="p-2 font-mono text-sm">{mapping.clientType}</td>
                    <td className="p-2 font-mono text-sm">{mapping.mappedType}</td>
                    <td className="p-2">
                      {mapping.isValidBackend ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                    </td>
                    <td className="p-2">
                      <Badge 
                        variant={mapping.error ? "destructive" : mapping.notes === "Direct match" ? "default" : "secondary"}
                      >
                        {mapping.error || mapping.notes}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* API Reference */}
      {apiReference && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>API Reference Data</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
              {JSON.stringify(apiReference, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}