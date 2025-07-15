import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useFormDataContext } from '@/context/FormDataContext';
import Play from 'lucide-react/dist/esm/icons/play';
import CheckCircle from 'lucide-react/dist/esm/icons/check-circle';
import AlertTriangle from 'lucide-react/dist/esm/icons/alert-triangle';
import X from 'lucide-react/dist/esm/icons/x';

interface ValidationResult {
  test: string;
  passed: boolean;
  details: string;
  critical: boolean;
}

export function BusinessLogicValidationTest() {
  const { state } = useFormDataContext();
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<ValidationResult[]>([]);

  const runValidationTests = async () => {
    setIsRunning(true);
    setResults([]);

    const tests: ValidationResult[] = [];

    // Test 1: Minimum funding amount validation
    const fundingAmount = state.step1?.fundingAmount || 0;
    tests.push({
      test: "Minimum Funding Amount",
      passed: fundingAmount >= 10000,
      details: `Funding amount: $${fundingAmount.toLocaleString()}. Minimum required: $10,000`,
      critical: true
    });

    // Test 2: Business information completeness
    const businessName = state.step3?.operatingName || state.step3?.legalName;
    tests.push({
      test: "Business Name Required",
      passed: !!businessName,
      details: businessName ? `Business name: ${businessName}` : "Business name is missing",
      critical: true
    });

    // Test 3: Applicant information completeness
    const hasApplicantInfo = !!(state.step4?.firstName && state.step4?.lastName && state.step4?.email);
    tests.push({
      test: "Applicant Information",
      passed: hasApplicantInfo,
      details: hasApplicantInfo ? "All required applicant fields present" : "Missing applicant information",
      critical: true
    });

    // Test 4: Product category selection
    const hasProductCategory = !!state.step2?.selectedCategory;
    tests.push({
      test: "Product Category Selection",
      passed: hasProductCategory,
      details: hasProductCategory ? `Selected: ${state.step2?.selectedCategory}` : "No product category selected",
      critical: true
    });

    // Test 5: Invoice factoring business logic
    const purposeOfFunds = state.step1?.purposeOfFunds;
    const accountsReceivable = state.step1?.accountsReceivableBalance;
    const factoringShouldBeAvailable = purposeOfFunds !== 'equipment_purchase' && accountsReceivable !== 'no_account_receivables';
    
    tests.push({
      test: "Invoice Factoring Logic",
      passed: factoringShouldBeAvailable ? true : accountsReceivable === 'no_account_receivables',
      details: `Purpose: ${purposeOfFunds}, AR: ${accountsReceivable}. Factoring ${factoringShouldBeAvailable ? 'should be' : 'should NOT be'} available`,
      critical: false
    });

    // Test 6: Geographic eligibility
    const businessState = state.step3?.businessState;
    const validStates = ['CA', 'US', 'AB', 'BC', 'ON', 'QC', 'MB', 'SK', 'NS', 'NB', 'PE', 'NL', 'YT', 'NT', 'NU'];
    tests.push({
      test: "Geographic Eligibility",
      passed: validStates.includes(businessState || ''),
      details: businessState ? `Business state: ${businessState}` : "Business state not specified",
      critical: true
    });

    // Test 7: Application ID presence
    const applicationId = state.applicationId || localStorage.getItem('applicationId');
    tests.push({
      test: "Application ID Present",
      passed: !!applicationId,
      details: applicationId ? `Application ID: ${applicationId}` : "No application ID found",
      critical: true
    });

    // Test 8: Form data structure compliance
    const hasStepStructure = !!(state.step1 && state.step3 && state.step4);
    tests.push({
      test: "Step-Based Structure",
      passed: hasStepStructure,
      details: hasStepStructure ? "All required step objects present" : "Missing step structure",
      critical: true
    });

    // Simulate async validation
    await new Promise(resolve => setTimeout(resolve, 1000));

    setResults(tests);
    setIsRunning(false);

    // Log results for debugging
    console.log("🔍 Business Logic Validation Results:");
    tests.forEach(test => {
      console.log(`${test.passed ? '✅' : '❌'} ${test.test}: ${test.details}`);
    });
  };

  const criticalFailures = results.filter(r => !r.passed && r.critical);
  const warnings = results.filter(r => !r.passed && !r.critical);
  const passed = results.filter(r => r.passed);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Play className="w-5 h-5" />
          Business Logic Validation Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <Button
            onClick={runValidationTests}
            disabled={isRunning}
            className="flex items-center gap-2"
          >
            <Play className="w-4 h-4" />
            {isRunning ? 'Running Tests...' : 'Run Validation Tests'}
          </Button>
          
          {results.length > 0 && (
            <div className="flex gap-2">
              <Badge variant="default" className="bg-green-600">
                {passed.length} Passed
              </Badge>
              {criticalFailures.length > 0 && (
                <Badge variant="destructive">
                  {criticalFailures.length} Critical
                </Badge>
              )}
              {warnings.length > 0 && (
                <Badge variant="outline" className="border-yellow-500 text-yellow-600">
                  {warnings.length} Warnings
                </Badge>
              )}
            </div>
          )}
        </div>

        {results.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Test Results:</h4>
            {results.map((result, index) => (
              <Alert
                key={index}
                variant={result.passed ? 'default' : (result.critical ? 'destructive' : 'default')}
                className={result.passed ? 'border-green-200 bg-green-50' : (result.critical ? '' : 'border-yellow-200 bg-yellow-50')}
              >
                <div className="flex items-start gap-2">
                  {result.passed ? (
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                  ) : result.critical ? (
                    <X className="w-4 h-4 text-red-600 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <div className="font-medium text-sm">{result.test}</div>
                    <AlertDescription className="text-xs mt-1">
                      {result.details}
                    </AlertDescription>
                  </div>
                </div>
              </Alert>
            ))}
          </div>
        )}

        {criticalFailures.length > 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription>
              <div className="font-medium">Critical validation failures detected</div>
              <div className="text-sm mt-1">
                Please address these issues before proceeding with submission.
              </div>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}