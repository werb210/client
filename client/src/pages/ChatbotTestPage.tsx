import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ChatbotInterface } from '@/components/ChatbotInterface';
import { Bot, Settings, TestTube, MessageSquare } from 'lucide-react';

export default function ChatbotTestPage() {
  const [minimized, setMinimized] = useState(false);
  const [testContext, setTestContext] = useState({
    currentStep: 3,
    applicationId: 'test-app-123',
    userId: 'test-user-456'
  });

  const initializeAssistant = async () => {
    try {
      const response = await fetch('/api/chat/initialize-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert(`OpenAI Assistant initialized successfully!\nAssistant ID: ${data.assistantId}`);
      } else {
        alert(`Failed to initialize assistant: ${data.error}`);
      }
    } catch (error) {
      alert(`Error initializing assistant: ${error}`);
    }
  };

  const testNotification = async () => {
    try {
      const response = await fetch('/api/notifications/agent-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId: testContext.applicationId,
          message: 'Your AI assistant has been upgraded with new features!'
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('Push notification sent! Check your notifications.');
      } else {
        alert(`Failed to send notification: ${data.error}`);
      }
    } catch (error) {
      alert(`Error sending notification: ${error}`);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          AI Chatbot Test Page
        </h1>
        <p className="text-gray-600">
          Test the OpenAI-powered chatbot with lender product training and chat transcript storage
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chatbot Interface */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-teal-600" />
                Live Chatbot Interface
              </CardTitle>
              <CardDescription>
                Interact with the AI assistant trained on Boreal Financial's lending products
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-4">
                <Button
                  variant={minimized ? "default" : "outline"}
                  size="sm"
                  onClick={() => setMinimized(!minimized)}
                >
                  {minimized ? "Show Chat" : "Minimize Chat"}
                </Button>
                <Badge variant="secondary">
                  Step {testContext.currentStep}
                </Badge>
              </div>
              
              {!minimized && (
                <ChatbotInterface
                  applicationId={testContext.applicationId}
                  userId={testContext.userId}
                  context={testContext}
                  className="mx-auto"
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Test Controls */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-600" />
                Test Context Settings
              </CardTitle>
              <CardDescription>
                Modify the application context for testing different scenarios
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Current Step
                </label>
                <Input
                  type="number"
                  min="1"
                  max="7"
                  value={testContext.currentStep}
                  onChange={(e) => setTestContext(prev => ({
                    ...prev,
                    currentStep: parseInt(e.target.value) || 1
                  }))}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  Application ID
                </label>
                <Input
                  value={testContext.applicationId}
                  onChange={(e) => setTestContext(prev => ({
                    ...prev,
                    applicationId: e.target.value
                  }))}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  User ID
                </label>
                <Input
                  value={testContext.userId}
                  onChange={(e) => setTestContext(prev => ({
                    ...prev,
                    userId: e.target.value
                  }))}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="w-5 h-5 text-green-600" />
                System Tests
              </CardTitle>
              <CardDescription>
                Test backend services and integrations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={initializeAssistant}
                className="w-full"
                variant="outline"
              >
                <Bot className="w-4 h-4 mr-2" />
                Initialize OpenAI Assistant
              </Button>
              
              <Button
                onClick={testNotification}
                className="w-full"
                variant="outline"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Test Push Notification
              </Button>
              
              <Separator />
              
              <div className="text-sm text-muted-foreground">
                <p className="font-medium mb-2">Available Test Scenarios:</p>
                <ul className="space-y-1 text-xs">
                  <li>• Ask about document requirements</li>
                  <li>• Request help with application steps</li>
                  <li>• Inquire about lender products</li>
                  <li>• Express frustration (tests escalation)</li>
                  <li>• Ask for human agent assistance</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Features Tested</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span>OpenAI Integration</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span>Chat Sessions</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span>Message History</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span>Sentiment Analysis</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span>Auto Escalation</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span>Context Awareness</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span>Push Notifications</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span>Human Handoff</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}