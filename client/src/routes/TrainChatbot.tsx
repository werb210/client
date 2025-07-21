/**
 * Training Page Component for Chatbot Training System
 * Allows users to generate, view, and manage training data
 */

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, AlertCircle, Zap, BookOpen, MessageSquare, Settings } from 'lucide-react';

interface TrainingExample {
  user: string;
  bot: string;
  metadata: {
    category: string;
    country: string;
    context: string;
  };
}

interface TrainingData {
  version: string;
  generated: string;
  totalExamples: number;
  categories: string[];
  examples: TrainingExample[];
}

export default function TrainChatbot() {
  const [trainingData, setTrainingData] = useState<TrainingData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [generating, setGenerating] = useState(false);

  // Load existing training data on component mount
  useEffect(() => {
    loadTrainingData();
  }, []);

  const loadTrainingData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch('/api/training-data');
      if (response.ok) {
        const data = await response.json();
        setTrainingData(data);
        console.log('🤖 [TRAINING PAGE] Loaded training data:', data);
      } else if (response.status === 404) {
        console.log('🤖 [TRAINING PAGE] No training data found - needs generation');
        setError('No training data found. Generate training data to get started.');
      } else {
        throw new Error(`Failed to load training data: ${response.status}`);
      }
    } catch (err) {
      console.error('🤖 [TRAINING PAGE] Error loading training data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load training data');
    } finally {
      setLoading(false);
    }
  };

  const generateTrainingData = async () => {
    try {
      setGenerating(true);
      setError('');
      
      console.log('🤖 [TRAINING PAGE] Starting training data generation...');
      
      const response = await fetch('/api/generate-training', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Generation failed: ${response.status}`);
      }

      const result = await response.json();
      setTrainingData(result.data);
      
      console.log('🤖 [TRAINING PAGE] Training data generated successfully:', result);
      
    } catch (err) {
      console.error('🤖 [TRAINING PAGE] Generation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate training data');
    } finally {
      setGenerating(false);
    }
  };

  const categoryStats = trainingData?.categories.reduce((acc, category) => {
    const count = trainingData.examples.filter(ex => ex.metadata.category === category).length;
    acc[category] = count;
    return acc;
  }, {} as Record<string, number>) || {};

  const contextStats = trainingData?.examples.reduce((acc, ex) => {
    const context = ex.metadata.context;
    acc[context] = (acc[context] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🤖 Chatbot Training Center
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Generate and manage AI training data from your lender product database. 
            Train your chatbot to answer questions about equipment financing, working capital, and more.
          </p>
        </div>

        {/* Status Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Training Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {trainingData ? trainingData.totalExamples : 0}
                </div>
                <div className="text-sm text-gray-600">Training Examples</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {trainingData ? trainingData.categories.length : 0}
                </div>
                <div className="text-sm text-gray-600">Product Categories</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {trainingData ? 'Active' : 'Not Generated'}
                </div>
                <div className="text-sm text-gray-600">Training Status</div>
              </div>
            </div>

            <div className="mt-6 flex gap-3 justify-center">
              <Button 
                onClick={generateTrainingData} 
                disabled={generating}
                className="bg-green-600 hover:bg-green-700"
              >
                <Zap className="w-4 h-4 mr-2" />
                {generating ? 'Generating...' : 'Generate Training Data'}
              </Button>
              
              <Button 
                onClick={loadTrainingData} 
                disabled={loading}
                variant="outline"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                {loading ? 'Loading...' : 'Reload Data'}
              </Button>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Training Data Details */}
        {trainingData && (
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="categories">Categories</TabsTrigger>
              <TabsTrigger value="examples">Examples</TabsTrigger>
              <TabsTrigger value="contexts">Contexts</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <Card>
                <CardHeader>
                  <CardTitle>Training Data Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold mb-2">Generation Info</h3>
                      <div className="space-y-2 text-sm">
                        <div><span className="font-medium">Version:</span> {trainingData.version}</div>
                        <div><span className="font-medium">Generated:</span> {new Date(trainingData.generated).toLocaleString()}</div>
                        <div><span className="font-medium">Total Examples:</span> {trainingData.totalExamples}</div>
                        <div><span className="font-medium">Categories:</span> {trainingData.categories.length}</div>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Quality Metrics</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                          Schema-based generation from live product data
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                          Geographic and category context awareness
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                          Natural language conversation patterns
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                          Document requirement mappings
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="categories">
              <Card>
                <CardHeader>
                  <CardTitle>Product Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {Object.entries(categoryStats).map(([category, count]) => (
                      <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium">{category}</div>
                          <div className="text-sm text-gray-600">{count} training examples</div>
                        </div>
                        <Badge variant="secondary">{count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="examples">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Training Examples
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96">
                    <div className="space-y-4">
                      {trainingData.examples.slice(0, 20).map((example, index) => (
                        <div key={index} className="border rounded-lg p-4 space-y-2">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">{example.metadata.category}</Badge>
                            <Badge variant="secondary">{example.metadata.country}</Badge>
                            <Badge className="text-xs">{example.metadata.context}</Badge>
                          </div>
                          <div className="space-y-2">
                            <div>
                              <span className="font-medium text-blue-600">User:</span>
                              <span className="ml-2 text-gray-700">{example.user}</span>
                            </div>
                            <div>
                              <span className="font-medium text-green-600">Bot:</span>
                              <span className="ml-2 text-gray-700">{example.bot}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                      {trainingData.examples.length > 20 && (
                        <div className="text-center text-gray-500 text-sm">
                          Showing 20 of {trainingData.examples.length} examples
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="contexts">
              <Card>
                <CardHeader>
                  <CardTitle>Context Types</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {Object.entries(contextStats).map(([context, count]) => (
                      <div key={context} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium capitalize">{context.replace(/_/g, ' ')}</div>
                          <div className="text-sm text-gray-600">{count} examples</div>
                        </div>
                        <Badge variant="secondary">{count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        {/* Instructions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>How Training Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Data Generation Process</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                  <li>Fetches live lender product data from your database</li>
                  <li>Analyzes product categories, geography, and requirements</li>
                  <li>Generates natural language Q&A pairs for each product type</li>
                  <li>Creates context-aware responses with specific details</li>
                  <li>Saves training data for chatbot context enhancement</li>
                </ol>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Training Categories</h3>
                <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
                  <li><strong>Amount Inquiries:</strong> Minimum/maximum funding amounts</li>
                  <li><strong>Geography Questions:</strong> Country/region availability</li>
                  <li><strong>Document Requirements:</strong> Required paperwork</li>
                  <li><strong>Qualification Criteria:</strong> Eligibility requirements</li>
                  <li><strong>General Information:</strong> Product overviews and timing</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}