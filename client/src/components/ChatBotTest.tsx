import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function ChatBotTest() {
  const [testResults, setTestResults] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);

  const testAdvancedFeatures = async () => {
    setIsLoading(true);
    const results: any = {};

    try {
      // Test sentiment analysis
      console.log('Testing sentiment analysis...');
      const sentimentResponse = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: 'I am very frustrated with this application process!',
          sessionId: 'test_session'
        }),
        credentials: 'include'
      });
      results.sentiment = await sentimentResponse.json();

      // Test translation
      console.log('Testing translation...');
      const translateResponse = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: 'Hello, I need help with business financing',
          fromLang: 'en',
          toLang: 'es',
          sessionId: 'test_session'
        }),
        credentials: 'include'
      });
      results.translation = await translateResponse.json();

      // Test status check
      console.log('Testing status check...');
      const statusResponse = await fetch('/api/status/test-app-123', { credentials: 'include' });
      results.status = await statusResponse.json();

      // Test enhanced chat with context
      console.log('Testing enhanced chat...');
      const chatResponse = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'What is DSCR and how does it affect my loan approval?',
          sessionId: 'test_session',
          context: {
            currentStep: 2,
            applicationData: { requestedAmount: 50000, businessType: 'retail' },
            sentiment: 'curious',
            intent: 'question'
          },
          messages: []
        })
      });
      results.chat = await chatResponse.json();

      setTestResults(results);
      console.log('✅ All tests completed:', results);

    } catch (error) {
      console.error('❌ Test failed:', error);
      results.error = error.message;
      setTestResults(results);
    } finally {
      setIsLoading(false);
    }
  };

  const testGlossaryTerms = () => {
    const glossaryTerms = ['DSCR', 'Working Capital', 'Equipment Financing', 'Line of Credit', 'Invoice Factoring'];
    
    console.log('📚 Testing Glossary Terms:');
    glossaryTerms.forEach(term => {
      console.log(`- Test query: "What is ${term}?"`);
    });
    
    console.log('📱 Proactive Messaging Tests:');
    console.log('- 30-second timeout message');
    console.log('- Mouse leave detection');
    console.log('- Exit intent messaging');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Advanced ChatBot Features Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button 
              onClick={testAdvancedFeatures}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              {isLoading ? 'Testing...' : 'Test All Features'}
            </Button>
            <Button 
              onClick={testGlossaryTerms}
              variant="outline"
            >
              Test Glossary & Proactive
            </Button>
          </div>

          {Object.keys(testResults).length > 0 && (
            <div className="space-y-4 mt-6">
              <h3 className="text-lg font-semibold">Test Results:</h3>
              
              {testResults.sentiment && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Sentiment Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                      {JSON.stringify(testResults.sentiment, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              )}

              {testResults.translation && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Translation Service</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                      {JSON.stringify(testResults.translation, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              )}

              {testResults.status && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Status Check</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                      {JSON.stringify(testResults.status, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              )}

              {testResults.chat && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Enhanced Chat Response</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                      {JSON.stringify(testResults.chat, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              )}

              {testResults.error && (
                <Card className="border-red-200">
                  <CardHeader>
                    <CardTitle className="text-sm text-red-600">Error</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-red-600">{testResults.error}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold mb-2">Manual Tests:</h4>
            <ul className="text-sm space-y-1">
              <li>• Open chatbot and wait 30 seconds for proactive message</li>
              <li>• Try moving mouse to top of browser window</li>
              <li>• Ask "What is DSCR?" to test glossary</li>
              <li>• Ask "What's my status?" to test application status</li>
              <li>• Type in different languages to test translation</li>
              <li>• Express frustration to test sentiment analysis</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}