import { fetchProducts } from "../../api/products";
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, CheckCircle, Clock, MessageSquare } from 'lucide-react';

interface TestCase {
  id: string;
  question: string;
  expectedBehavior: string;
  actualResponse?: string;
  status: 'pending' | 'running' | 'pass' | 'fail' | 'critical_fail';
  isCanadaStartupTest?: boolean;
}

interface TestResult {
  testId: string;
  passed: boolean;
  response: string;
  analysis: string;
  timestamp: Date;
}

const PRIMARY_TEST_CASES: TestCase[] = [
  {
    id: 'canada-startup-1',
    question: 'Can you fund a startup in Canada?',
    expectedBehavior: 'Must NOT say "Yes" or imply it\'s easy. Should say: "Most Canadian lenders require 6+ months of revenue..."',
    status: 'pending',
    isCanadaStartupTest: true
  },
  {
    id: 'canada-startup-2', 
    question: 'Do you have funding for new Canadian businesses?',
    expectedBehavior: 'Should explain revenue requirements and not give false hope about easy startup funding',
    status: 'pending',
    isCanadaStartupTest: true
  },
  {
    id: 'loc-products',
    question: 'Do you offer lines of credit?',
    expectedBehavior: 'Show LOC products if amount fits, and explain eligibility (credit, revenue)',
    status: 'pending'
  },
  {
    id: 'equipment-financing',
    question: 'Do I qualify for equipment financing?',
    expectedBehavior: 'Respond with criteria: type of equipment, time in business, amount requested',
    status: 'pending'
  },
  {
    id: 'funding-speed',
    question: 'How fast can I get funded?',
    expectedBehavior: 'Answer: "2–5 business days after approval"',
    status: 'pending'
  },
  {
    id: 'bad-credit',
    question: 'Can I get funded with bad credit?',
    expectedBehavior: 'Say: "Some lenders accept lower credit, but stronger banking helps."',
    status: 'pending'
  },
  {
    id: 'seasonal-business',
    question: 'Which products are best for seasonal businesses?',
    expectedBehavior: 'Suggest LOCs, revenue-based loans, factoring',
    status: 'pending'
  },
  {
    id: 'real-estate',
    question: 'Do you do real estate loans?',
    expectedBehavior: 'Say: "We do not offer real estate-backed lending."',
    status: 'pending'
  },
  {
    id: 'financials-required',
    question: 'Do I need financials?',
    expectedBehavior: 'Answer based on loan type — "Some lenders require bank statements + financials"',
    status: 'pending'
  },
  {
    id: 'interest-rates',
    question: 'What\'s the interest rate?',
    expectedBehavior: 'Say: "Rates vary based on lender, credit, and business profile…"',
    status: 'pending'
  },
  {
    id: 'required-documents',
    question: 'What documents do I need?',
    expectedBehavior: 'Say: "Typically you\'ll need bank statements, business ID, and financials."',
    status: 'pending'
  }
];

export default function ChatbotAISuiteTest() {
  const [testCases, setTestCases] = useState<TestCase[]>(PRIMARY_TEST_CASES);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTestIndex, setCurrentTestIndex] = useState<number>(-1);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [sessionId] = useState(() => `test_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [customTest, setCustomTest] = useState('');
  const [overallStatus, setOverallStatus] = useState<'pending' | 'running' | 'complete'>('pending');

  const analyzeResponse = (testCase: TestCase, response: string): { passed: boolean; analysis: string } => {
    const responseText = response.toLowerCase();
    const expectedText = testCase.expectedBehavior.toLowerCase();

    // Special analysis for Canada startup tests
    if (testCase.isCanadaStartupTest) {
      const problematicPhrases = [
        'yes we can',
        'yes, we can',
        'absolutely',
        'of course',
        'definitely',
        'sure, we',
        'easy to get',
        'simple process',
        'no problem'
      ];
      
      const foundProblematic = problematicPhrases.some(phrase => responseText.includes(phrase));
      const mentionsRevenue = responseText.includes('revenue') || responseText.includes('6 month');
      const mentionsRequirements = responseText.includes('requirement') || responseText.includes('established');
      
      if (foundProblematic && !mentionsRevenue) {
        return {
          passed: false,
          analysis: `❌ CRITICAL: Contains problematic phrases suggesting easy startup funding without mentioning revenue requirements. Found: ${problematicPhrases.filter(p => responseText.includes(p)).join(', ')}`
        };
      }
      
      if (!mentionsRevenue && !mentionsRequirements) {
        return {
          passed: false,
          analysis: '❌ FAIL: Does not mention revenue requirements or established business criteria for Canadian startups'
        };
      }
      
      return {
        passed: true,
        analysis: '✅ PASS: Correctly explains requirements without false promises'
      };
    }

    // Standard analysis for other test cases
    if (testCase.id === 'loc-products') {
      const mentionsLOC = responseText.includes('line of credit') || responseText.includes('loc');
      const mentionsEligibility = responseText.includes('credit') || responseText.includes('revenue') || responseText.includes('eligib');
      return {
        passed: mentionsLOC && mentionsEligibility,
        analysis: mentionsLOC && mentionsEligibility ? '✅ PASS: Mentions LOC and eligibility criteria' : '❌ FAIL: Missing LOC mention or eligibility criteria'
      };
    }

    if (testCase.id === 'equipment-financing') {
      const mentionsCriteria = responseText.includes('equipment') && (responseText.includes('time in business') || responseText.includes('criteria') || responseText.includes('amount'));
      return {
        passed: mentionsCriteria,
        analysis: mentionsCriteria ? '✅ PASS: Explains equipment financing criteria' : '❌ FAIL: Missing equipment financing criteria'
      };
    }

    if (testCase.id === 'funding-speed') {
      const mentionsTimeframe = responseText.includes('day') || responseText.includes('business days') || responseText.includes('2-5') || responseText.includes('approval');
      return {
        passed: mentionsTimeframe,
        analysis: mentionsTimeframe ? '✅ PASS: Provides timing information' : '❌ FAIL: Missing funding timeframe'
      };
    }

    if (testCase.id === 'real-estate') {
      const deniesRealEstate = responseText.includes('do not offer') || responseText.includes('don\'t offer') || responseText.includes('not available') || responseText.includes('don\'t do');
      return {
        passed: deniesRealEstate,
        analysis: deniesRealEstate ? '✅ PASS: Correctly states no real estate lending' : '❌ FAIL: Does not clearly deny real estate lending'
      };
    }

    // Generic analysis for other cases
    const hasRelevantKeywords = expectedText.split(' ').slice(0, 3).some(keyword => 
      keyword.length > 3 && responseText.includes(keyword)
    );

    return {
      passed: hasRelevantKeywords,
      analysis: hasRelevantKeywords ? '✅ PASS: Contains relevant keywords' : '❌ FAIL: Missing expected content'
    };
  };

  const runSingleTest = async (testCase: TestCase): Promise<TestResult> => {
    console.log(`🧪 Running test: ${testCase.id} - "${testCase.question}"`);
    
    try {
      // Send message to chatbot API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: testCase.question,
          sessionId: `${sessionId}_${testCase.id}`,
          context: {
            isTest: true,
            testId: testCase.id
          },
          messages: [] // Fresh conversation for each test
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const botResponse = data.reply || 'No response received';
      
      // Analyze the response
      const { passed, analysis } = analyzeResponse(testCase, botResponse);
      
      const result: TestResult = {
        testId: testCase.id,
        passed,
        response: botResponse,
        analysis,
        timestamp: new Date()
      };

      console.log(`📊 Test ${testCase.id}: ${passed ? 'PASS' : 'FAIL'}`);
      console.log(`📝 Response: ${botResponse.substring(0, 100)}...`);
      console.log(`🔍 Analysis: ${analysis}`);

      return result;
    } catch (error) {
      console.error(`❌ Test ${testCase.id} failed:`, error);
      return {
        testId: testCase.id,
        passed: false,
        response: `ERROR: ${error}`,
        analysis: '❌ FAIL: Test execution error',
        timestamp: new Date()
      };
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setOverallStatus('running');
    setTestResults([]);
    
    const results: TestResult[] = [];
    
    for (let i = 0; i < testCases.length; i++) {
      setCurrentTestIndex(i);
      
      // Update test status to running
      setTestCases(prev => prev.map(tc => 
        tc.id === testCases[i].id 
          ? { ...tc, status: 'running' }
          : tc
      ));
      
      const result = await runSingleTest(testCases[i]);
      results.push(result);
      
      // Update test status based on result
      setTestCases(prev => prev.map(tc => 
        tc.id === testCases[i].id 
          ? { 
              ...tc, 
              status: testCases[i].isCanadaStartupTest && !result.passed ? 'critical_fail' : (result.passed ? 'pass' : 'fail'),
              actualResponse: result.response
            }
          : tc
      ));

      // Small delay between tests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    setTestResults(results);
    setCurrentTestIndex(-1);
    setIsRunning(false);
    setOverallStatus('complete');
    
    // Generate final report
    generateFinalReport(results);
  };

  const generateFinalReport = (results: TestResult[]) => {
    const passedTests = results.filter(r => r.passed).length;
    const totalTests = results.length;
    const canadaStartupFails = results.filter(r => 
      testCases.find(tc => tc.id === r.testId)?.isCanadaStartupTest && !r.passed
    );
    
    console.log('\n🎯 AI CHATBOT BEHAVIOR TEST RESULTS:');
    console.log(`✅ Tests Passed: ${passedTests}/${totalTests}`);
    console.log(`❌ Tests Failed: ${totalTests - passedTests}/${totalTests}`);
    
    if (canadaStartupFails.length > 0) {
      console.log('\n🔴 CRITICAL ISSUE: Canada Startup False Positive Detected!');
      canadaStartupFails.forEach(fail => {
        const testCase = testCases.find(tc => tc.id === fail.testId);
        console.log(`❌ ${testCase?.question}`);
        console.log(`📝 Response: ${fail.response}`);
        console.log(`🔍 Analysis: ${fail.analysis}`);
      });
    }
    
    console.log(`\n✅ AI Chatbot Behavior: ${canadaStartupFails.length === 0 && passedTests === totalTests ? '100% Compliant and Contextual' : 'Needs Improvement'}`);
  };

  const runCustomTest = async () => {
    if (!customTest.trim()) return;
    
    const customTestCase: TestCase = {
      id: 'custom',
      question: customTest,
      expectedBehavior: 'Custom test - manual review required',
      status: 'running'
    };
    
    const result = await runSingleTest(customTestCase);
    setTestResults(prev => [...prev, result]);
  };

  const getStatusBadge = (status: TestCase['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'running':
        return <Badge variant="default"><MessageSquare className="w-3 h-3 mr-1" />Running</Badge>;
      case 'pass':
        return <Badge variant="default" className="bg-green-600"><CheckCircle className="w-3 h-3 mr-1" />Pass</Badge>;
      case 'fail':
        return <Badge variant="destructive">❌ Fail</Badge>;
      case 'critical_fail':
        return <Badge variant="destructive" className="bg-red-800"><AlertTriangle className="w-3 h-3 mr-1" />Critical Fail</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const criticalFailures = testCases.filter(tc => tc.status === 'critical_fail').length;
  const passedTests = testCases.filter(tc => tc.status === 'pass').length;
  const totalTests = testCases.length;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🤖 AI Chatbot Test Suite - Canada Startup Funding Focus
              {criticalFailures > 0 && (
                <Badge variant="destructive" className="ml-2">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Critical Issues: {criticalFailures}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">
                🎯 Test Suite Status
              </h3>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <strong>Overall Progress:</strong> {overallStatus === 'complete' ? '✅ Complete' : overallStatus === 'running' ? '🔄 Running' : '⏳ Pending'}
                </div>
                <div>
                  <strong>Tests Passed:</strong> {passedTests}/{totalTests} ({totalTests > 0 ? Math.round((passedTests/totalTests) * 100) : 0}%)
                </div>
                <div>
                  <strong>Critical Failures:</strong> {criticalFailures} (Canada Startup Issues)
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={runAllTests}
                disabled={isRunning}
                className="bg-green-600 hover:bg-green-700"
              >
                {isRunning ? 'Running Tests...' : 'Run All Tests'}
              </Button>
              
              {overallStatus === 'complete' && (
                <Button 
                  variant="outline"
                  onClick={() => {
                    setTestCases(PRIMARY_TEST_CASES.map(tc => ({ ...tc, status: 'pending', actualResponse: undefined })));
                    setTestResults([]);
                    setOverallStatus('pending');
                  }}
                >
                  Reset Tests
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          {testCases.map((testCase, index) => (
            <Card key={testCase.id} className={`${testCase.isCanadaStartupTest ? 'border-red-200 bg-red-50' : ''} ${currentTestIndex === index ? 'ring-2 ring-blue-400' : ''}`}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">
                    {testCase.isCanadaStartupTest && '🔴 '}
                    Test {index + 1}: {testCase.id}
                  </CardTitle>
                  {getStatusBadge(testCase.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <strong>Question:</strong>
                  <div className="text-sm font-mono bg-gray-100 p-2 rounded mt-1">
                    💬 "{testCase.question}"
                  </div>
                </div>
                
                <div>
                  <strong>Expected Behavior:</strong>
                  <div className="text-xs text-gray-600 mt-1">
                    {testCase.expectedBehavior}
                  </div>
                </div>

                {testCase.actualResponse && (
                  <div>
                    <strong>Actual Response:</strong>
                    <div className="text-sm bg-gray-100 p-2 rounded mt-1 max-h-32 overflow-y-auto">
                      {testCase.actualResponse}
                    </div>
                  </div>
                )}

                {testResults.find(r => r.testId === testCase.id) && (
                  <div>
                    <strong>Analysis:</strong>
                    <div className="text-sm mt-1">
                      {testResults.find(r => r.testId === testCase.id)?.analysis}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Custom Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea 
              value={customTest}
              onChange={(e) => setCustomTest(e.target.value)}
              placeholder="Enter a custom question to test the chatbot behavior..."
              className="min-h-20"
            />
            <Button 
              onClick={runCustomTest}
              disabled={!customTest.trim() || isRunning}
              variant="outline"
            >
              Test Custom Question
            </Button>
          </CardContent>
        </Card>

        {overallStatus === 'complete' && (
          <Card>
            <CardHeader>
              <CardTitle>📊 Final Test Report</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className={`p-4 rounded-lg border ${criticalFailures > 0 ? 'bg-red-50 border-red-200' : passedTests === totalTests ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
                  <h3 className="font-semibold mb-2">
                    {criticalFailures > 0 ? '🔴 Critical Issues Found' : passedTests === totalTests ? '✅ All Tests Passed' : '⚠️ Some Tests Failed'}
                  </h3>
                  <p className="text-sm">
                    {criticalFailures > 0 
                      ? `The chatbot is giving incorrect answers about Canadian startup funding. This needs immediate attention to prevent false expectations.`
                      : passedTests === totalTests 
                        ? `All chatbot responses are compliant and provide accurate information.`
                        : `Some responses need improvement to ensure accuracy and compliance.`
                    }
                  </p>
                  
                  {criticalFailures > 0 && (
                    <div className="mt-3 p-3 bg-white rounded border">
                      <h4 className="font-medium text-red-800">Recommended Actions:</h4>
                      <ul className="text-sm text-red-700 mt-1 list-disc list-inside">
                        <li>Update AI training to explicitly handle Canadian startup questions</li>
                        <li>Add guardrails for "Canada + startup" keyword combinations</li>
                        <li>Implement fallback responses that mention revenue requirements</li>
                        <li>Test the bot again after implementing fixes</li>
                      </ul>
                    </div>
                  )}
                </div>
                
                <div className="text-xs text-gray-500">
                  Test completed at: {new Date().toLocaleString()}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}