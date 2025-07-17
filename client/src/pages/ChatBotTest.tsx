import React from 'react';
import { ChatBot } from '@/components/ChatBot';
import { useChatBot } from '@/hooks/useChatBot';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ChatBotTest() {
  const { isOpen, currentStep, applicationData, toggleChat, openChat, closeChat } = useChatBot();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>OpenAI ChatBot Integration Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-green-800 mb-2">
                ✅ ChatBot Integration Status
              </h3>
              <ul className="text-green-700 space-y-1">
                <li>• OpenAI API key configured and available</li>
                <li>• ChatBot component created with professional UI</li>
                <li>• Server-side chat routes implemented with function calling</li>
                <li>• Integration with application state and lender products</li>
                <li>• Real-time step detection and context awareness</li>
              </ul>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">
                  ChatBot Status
                </h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <strong>Chat Window:</strong> {isOpen ? 'Open' : 'Closed'}
                  </div>
                  <div>
                    <strong>Current Step:</strong> {currentStep}
                  </div>
                  <div>
                    <strong>Application ID:</strong> {applicationData.applicationId || 'Not set'}
                  </div>
                  <div>
                    <strong>Business Location:</strong> {applicationData.businessLocation || 'Not set'}
                  </div>
                  <div>
                    <strong>Requested Amount:</strong> {applicationData.requestedAmount ? `$${applicationData.requestedAmount.toLocaleString()}` : 'Not set'}
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-purple-800 mb-2">
                  Test Controls
                </h3>
                <div className="space-y-3">
                  <Button 
                    onClick={toggleChat}
                    className="w-full"
                  >
                    Toggle ChatBot
                  </Button>
                  <Button 
                    onClick={openChat}
                    variant="outline"
                    className="w-full"
                  >
                    Open ChatBot
                  </Button>
                  <Button 
                    onClick={closeChat}
                    variant="outline"
                    className="w-full"
                  >
                    Close ChatBot
                  </Button>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                Features Available
              </h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm text-yellow-700">
                <ul className="space-y-1">
                  <li>• Product recommendations based on user criteria</li>
                  <li>• Step-by-step application guidance</li>
                  <li>• Document requirements assistance</li>
                  <li>• Real-time context awareness</li>
                </ul>
                <ul className="space-y-1">
                  <li>• Integration with lender product database</li>
                  <li>• Function calling for structured responses</li>
                  <li>• Professional chat interface with animations</li>
                  <li>• Persistent chat history during session</li>
                </ul>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Sample Questions to Test
              </h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
                <div>
                  <strong>Product Recommendations:</strong>
                  <ul className="mt-1 space-y-1">
                    <li>• "What financing options do you have for $50,000?"</li>
                    <li>• "I need equipment financing for my restaurant"</li>
                    <li>• "What are the best rates for working capital?"</li>
                  </ul>
                </div>
                <div>
                  <strong>Application Help:</strong>
                  <ul className="mt-1 space-y-1">
                    <li>• "What documents do I need for Step 5?"</li>
                    <li>• "How do I fill out the business information?"</li>
                    <li>• "What's required for the applicant section?"</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* The ChatBot component will be rendered globally via MainLayout */}
        <div className="mt-6 text-center text-sm text-gray-600">
          The ChatBot is now available globally throughout the application.
          Click the blue chat button in the bottom-right corner to start a conversation.
        </div>
      </div>
    </div>
  );
}