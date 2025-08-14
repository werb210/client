import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, FileText, MessageSquare, Briefcase, Clock, TrendingUp, ArrowLeft } from "lucide-react";

type SearchResult = { 
  type: string; 
  id: string; 
  title: string; 
  snippet?: string; 
  rank?: number 
};

export default function MySearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  
  const contactId = new URLSearchParams(location.search).get("contactId") || "";

  const performSearch = async (searchQuery: string = query) => {
    if (!contactId) return;
    
    setIsLoading(true);
    setHasSearched(true);
    
    try {
      const response = await fetch(
        `/api/client/search?q=${encodeURIComponent(searchQuery)}&contactId=${encodeURIComponent(contactId)}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setResults(data);
      } else {
        console.error("Search failed:", response.status);
        setResults([]);
      }
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSuggestions = async (searchQuery: string) => {
    if (!contactId || !searchQuery || searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }
    
    try {
      const response = await fetch(
        `/api/client/search/suggestions?q=${encodeURIComponent(searchQuery)}&contactId=${encodeURIComponent(contactId)}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data);
      }
    } catch (error) {
      console.error("Suggestions error:", error);
      setSuggestions([]);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch();
  };

  const handleQueryChange = (value: string) => {
    setQuery(value);
    if (value.length >= 2) {
      fetchSuggestions(value);
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setSuggestions([]);
    performSearch(suggestion);
  };

  const openResult = (result: SearchResult) => {
    if (result.type === "messages") {
      window.location.href = `/client/messages/${result.id}?contactId=${encodeURIComponent(contactId)}`;
    } else if (result.type === "documents") {
      window.location.href = `/client/documents/${result.id}?contactId=${encodeURIComponent(contactId)}`;
    } else if (result.type === "applications") {
      window.location.href = `/client/applications/${result.id}?contactId=${encodeURIComponent(contactId)}`;
    }
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case "messages":
        return <MessageSquare className="w-4 h-4 text-blue-600" />;
      case "documents":
        return <FileText className="w-4 h-4 text-green-600" />;
      case "applications":
        return <Briefcase className="w-4 h-4 text-orange-600" />;
      default:
        return <Search className="w-4 h-4 text-gray-600" />;
    }
  };

  const getResultBadgeColor = (type: string) => {
    switch (type) {
      case "messages":
        return "bg-blue-100 text-blue-800";
      case "documents":
        return "bg-green-100 text-green-800";
      case "applications":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Load recent items on component mount
  useEffect(() => {
    if (contactId && !hasSearched) {
      performSearch("");
    }
  }, [contactId]);

  if (!contactId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-orange-50 p-6">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <Search className="w-12 h-12 text-amber-600 mx-auto mb-4" />
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Contact ID Required</h2>
                <p className="text-gray-600">Please provide a contact ID to search your content.</p>
                <Button 
                  onClick={() => window.history.back()} 
                  className="mt-4"
                  variant="outline"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Go Back
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-orange-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button 
              onClick={() => window.history.back()}
              variant="ghost"
              size="sm"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Search className="w-6 h-6" />
                Search My Content
              </h1>
              <p className="text-gray-600 text-sm">Contact: {contactId}</p>
            </div>
          </div>
        </div>

        {/* Search Form */}
        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSearchSubmit} className="space-y-4">
              <div className="relative">
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      type="text"
                      placeholder="Search messages, documents, and applications..."
                      value={query}
                      onChange={(e) => handleQueryChange(e.target.value)}
                      className="pl-10"
                    />
                    
                    {/* Suggestions dropdown */}
                    {suggestions.length > 0 && (
                      <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-10 mt-1">
                        {suggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="w-full text-left px-3 py-2 hover:bg-gray-50 first:rounded-t-md last:rounded-b-md"
                          >
                            <div className="flex items-center gap-2">
                              <TrendingUp className="w-3 h-3 text-gray-400" />
                              <span className="text-sm">{suggestion}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <Button type="submit" disabled={isLoading} className="bg-teal-600 hover:bg-teal-700">
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Search className="w-4 h-4" />
                    )}
                    Search
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Results */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Search Results
              {results.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {results.length} result{results.length !== 1 ? 's' : ''}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Searching your content...</p>
              </div>
            ) : results.length > 0 ? (
              <div className="space-y-3">
                {results.map((result, index) => (
                  <div
                    key={index}
                    onClick={() => openResult(result)}
                    className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      {getResultIcon(result.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-gray-900 truncate">{result.title}</h3>
                          <Badge 
                            variant="secondary" 
                            className={`text-xs ${getResultBadgeColor(result.type)}`}
                          >
                            {result.type}
                          </Badge>
                          {result.rank && result.rank > 0 && (
                            <Badge variant="outline" className="text-xs">
                              Score: {result.rank.toFixed(3)}
                            </Badge>
                          )}
                        </div>
                        {result.snippet && (
                          <div 
                            className="text-sm text-gray-600 line-clamp-2"
                            dangerouslySetInnerHTML={{ __html: result.snippet }}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : hasSearched ? (
              <div className="text-center py-8">
                <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Results Found</h3>
                <p className="text-gray-600">
                  {query ? `No content found matching "${query}"` : "No content available for this contact"}
                </p>
                {query && (
                  <p className="text-sm text-gray-500 mt-2">
                    Try different keywords or check your spelling
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Search Your Content</h3>
                <p className="text-gray-600">
                  Search through your messages, documents, and applications
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Search Tips */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Search Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Search Types</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• Messages and communications</li>
                  <li>• Uploaded documents</li>
                  <li>• Application details</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Search Tips</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• Use specific keywords</li>
                  <li>• Try document categories</li>
                  <li>• Search by status or type</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Examples</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• "invoice"</li>
                  <li>• "bank statement"</li>
                  <li>• "approved"</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}