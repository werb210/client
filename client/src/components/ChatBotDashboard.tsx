import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface HandoffRequest {
  id: string;
  sessionId: string;
  userMessage: string;
  chatHistory: any[];
  sentiment: string;
  timestamp: string;
  status: 'pending' | 'assigned' | 'completed';
  assignedAgent?: string;
}

export function ChatBotDashboard() {
  const [handoffQueue, setHandoffQueue] = useState<HandoffRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [agentName, setAgentName] = useState('');
  const [analytics, setAnalytics] = useState({
    totalConversations: 0,
    handoffRate: 0,
    averageResolution: '5 min',
    topIssues: ['Document Upload', 'Product Selection', 'Eligibility Questions']
  });

  useEffect(() => {
    fetchHandoffQueue();
    const interval = setInterval(fetchHandoffQueue, 10000); // Poll every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchHandoffQueue = async () => {
    try {
      const response = await fetch('/api/handoff/queue');
      const data = await response.json();
      
      if (data.success) {
        setHandoffQueue(data.queue);
      }
    } catch (error) {
      console.error('Failed to fetch handoff queue:', error);
    }
  };

  const acceptHandoff = async (requestId: string) => {
    if (!agentName.trim()) {
      alert('Please enter your agent name first');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/handoff/${requestId}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentName })
      });

      const data = await response.json();
      
      if (data.success) {
        await fetchHandoffQueue(); // Refresh the queue
        alert(`Handoff request assigned to ${agentName}`);
      } else {
        alert('Failed to accept handoff request');
      }
    } catch (error) {
      console.error('Failed to accept handoff:', error);
      alert('Error accepting handoff request');
    } finally {
      setIsLoading(false);
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-100 text-green-800';
      case 'negative': case 'frustrated': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">ChatBot Management Dashboard</h1>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Your agent name"
            value={agentName}
            onChange={(e) => setAgentName(e.target.value)}
            className="px-3 py-2 border rounded-md"
          />
          <Button 
            onClick={fetchHandoffQueue}
            variant="outline"
          >
            Refresh Queue
          </Button>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Conversations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalConversations}</div>
            <p className="text-xs text-gray-600">Last 24 hours</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Handoff Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.handoffRate}%</div>
            <p className="text-xs text-gray-600">AI → Human escalation</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Resolution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.averageResolution}</div>
            <p className="text-xs text-gray-600">Per handoff request</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Queue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{handoffQueue.length}</div>
            <p className="text-xs text-gray-600">Pending requests</p>
          </CardContent>
        </Card>
      </div>

      {/* Handoff Queue */}
      <Card>
        <CardHeader>
          <CardTitle>Live Chat Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {handoffQueue.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No pending handoff requests
            </div>
          ) : (
            <div className="space-y-4">
              {handoffQueue.map((request) => (
                <div key={request.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={getSentimentColor(request.sentiment)}>
                          {request.sentiment}
                        </Badge>
                        <span className="text-sm text-gray-600">
                          Session: {request.sessionId.slice(-8)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {formatTimestamp(request.timestamp)}
                      </p>
                    </div>
                    <Button 
                      onClick={() => acceptHandoff(request.id)}
                      disabled={isLoading || !agentName.trim()}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Accept Request
                    </Button>
                  </div>
                  
                  <div className="bg-gray-50 rounded p-3 mb-3">
                    <p className="text-sm font-medium mb-1">User Message:</p>
                    <p className="text-sm">{request.userMessage}</p>
                  </div>
                  
                  {request.chatHistory.length > 0 && (
                    <details className="text-sm">
                      <summary className="cursor-pointer text-blue-600 hover:underline">
                        View Chat History ({request.chatHistory.length} messages)
                      </summary>
                      <div className="mt-2 max-h-40 overflow-y-auto">
                        {request.chatHistory.slice(-5).map((msg, idx) => (
                          <div key={idx} className="py-1">
                            <span className="font-medium">
                              {msg.role === 'user' ? 'User' : 'FinBot'}:
                            </span>
                            {' '}{msg.content}
                          </div>
                        ))}
                      </div>
                    </details>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Issues Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Top Issues & Handoff Triggers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {analytics.topIssues.map((issue, idx) => (
              <div key={idx} className="flex justify-between items-center py-2">
                <span className="text-sm">{issue}</span>
                <Badge variant="outline">{Math.floor(Math.random() * 30) + 10}%</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}