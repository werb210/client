import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Database, MessageSquare, FileText, Settings } from "lucide-react";

export default function SearchDemo() {
  const [contactId, setContactId] = useState("SEARCH_DEMO_USER");
  const [searchQuery, setSearchQuery] = useState("");

  const openSearch = () => {
    const url = `/client/search?contactId=${encodeURIComponent(contactId)}${searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : ''}`;
    window.open(url, '_blank');
  };

  const testSearch = async (query: string) => {
    try {
      const response = await fetch(`/api/client/search?contactId=${encodeURIComponent(contactId)}&q=${encodeURIComponent(query)}`);
      const results = await response.json();
      console.log(`Search results for "${query}":`, results);
      return results;
    } catch (error) {
      console.error("Search test error:", error);
      return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-orange-50 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Client Search System Demo
          </h1>
          <p className="text-gray-600">
            Full-text search across messages, documents, and applications with advanced indexing
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Search Interface Demo */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Search className="w-6 h-6 text-teal-600" />
                <CardTitle>Search Interface</CardTitle>
              </div>
              <p className="text-sm text-gray-600">
                Test the search functionality with live backend integration
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <Label htmlFor="contact-id">Contact ID</Label>
                  <Input
                    id="contact-id"
                    value={contactId}
                    onChange={(e) => setContactId(e.target.value)}
                    placeholder="Enter contact ID"
                  />
                </div>
                
                <div>
                  <Label htmlFor="search-query">Pre-fill Search Query (Optional)</Label>
                  <Input
                    id="search-query"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="e.g., invoice, application, bank statement"
                  />
                </div>
              </div>

              <Button
                onClick={openSearch}
                className="w-full bg-teal-600 hover:bg-teal-700"
                disabled={!contactId}
              >
                <Search className="w-4 h-4 mr-2" />
                Open Search Interface
              </Button>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-blue-800 text-sm">
                  Opens the full search interface in a new tab with PostgreSQL full-text search capabilities.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Search API Testing */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Database className="w-6 h-6 text-teal-600" />
                <CardTitle>Search API Testing</CardTitle>
              </div>
              <p className="text-sm text-gray-600">
                Test search API endpoints directly
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Quick Tests</h4>
                <div className="space-y-2">
                  <Button
                    onClick={() => testSearch("application")}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                  >
                    Test: "application"
                  </Button>
                  <Button
                    onClick={() => testSearch("invoice")}
                    variant="outline" 
                    size="sm"
                    className="w-full justify-start"
                  >
                    Test: "invoice"
                  </Button>
                  <Button
                    onClick={() => testSearch("bank statement")}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                  >
                    Test: "bank statement"
                  </Button>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-amber-800 text-sm">
                  Test results will appear in the browser console. Check developer tools.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search Features */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Settings className="w-6 h-6 text-gray-600" />
              Search System Features
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Full-Text Search
                </h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• PostgreSQL tsvector indexing</li>
                  <li>• Relevance ranking with ts_rank</li>
                  <li>• Snippet highlighting</li>
                  <li>• Multi-language support</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Content Types
                </h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Messages and communications</li>
                  <li>• Document metadata and notes</li>
                  <li>• Application details</li>
                  <li>• Contact information</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  Search Features
                </h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Auto-complete suggestions</li>
                  <li>• Contact-scoped security</li>
                  <li>• Real-time search results</li>
                  <li>• Result type filtering</li>
                </ul>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-800 mb-2">Database Implementation</h4>
              <div className="space-y-1 text-green-700 text-sm">
                <p>• Full-text search vectors automatically updated via triggers</p>
                <p>• GIN indexes for optimal search performance</p>
                <p>• Contact-based security isolation at the database level</p>
                <p>• Search suggestions based on existing content categories</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* API Endpoints */}
        <Card>
          <CardHeader>
            <CardTitle>Search API Endpoints</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="font-mono text-sm text-gray-800">
                  <strong>GET</strong> /api/client/search
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Main search endpoint with query and contact ID parameters
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Parameters: q (query), contactId (required), limit (optional)
                </p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="font-mono text-sm text-gray-800">
                  <strong>GET</strong> /api/client/search/suggestions
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Auto-complete suggestions based on existing content
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Parameters: q (partial query), contactId (required)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}