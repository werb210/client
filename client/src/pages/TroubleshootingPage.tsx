import React, { useState } from 'react';
import { AlertTriangleIcon, CheckCircleIcon, XCircleIcon, InfoIcon } from 'lucide-react';
import { troubleshootingContent, troubleshootingCategories, getSeverityColor } from '@/content/troubleshooting';
import { BorealLogo } from '@/components/BorealLogo';

export default function TroubleshootingPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');

  const filteredContent = troubleshootingContent.filter(section => {
    if (selectedCategory !== 'all' && section.category !== selectedCategory) {
      return false;
    }
    if (selectedSeverity !== 'all') {
      return section.issues.some(issue => issue.severity === selectedSeverity);
    }
    return true;
  }).map(section => ({
    ...section,
    issues: selectedSeverity === 'all' 
      ? section.issues 
      : section.issues.filter(issue => issue.severity === selectedSeverity)
  })).filter(section => section.issues.length > 0);

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return <XCircleIcon className="w-5 h-5 text-red-500" />;
      case 'medium': return <AlertTriangleIcon className="w-5 h-5 text-yellow-500" />;
      case 'low': return <InfoIcon className="w-5 h-5 text-green-500" />;
      default: return <InfoIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <BorealLogo size="default" />
            <nav className="flex space-x-6">
              <a href="/" className="text-gray-600 hover:text-blue-600 transition-colors">
                Home
              </a>
              <a href="/portal" className="text-gray-600 hover:text-blue-600 transition-colors">
                Portal
              </a>
              <a href="/faq" className="text-gray-600 hover:text-blue-600 transition-colors">
                FAQ
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Troubleshooting Guide</h1>
          <p className="text-lg text-gray-600">
            Step-by-step solutions for common issues with the Boreal Financial platform.
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 space-y-4">
          {/* Category Filter */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Filter by Category</label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                All Categories
              </button>
              {troubleshootingCategories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-300'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Severity Filter */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Filter by Severity</label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedSeverity('all')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedSeverity === 'all'
                    ? 'bg-gray-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                All Severities
              </button>
              <button
                onClick={() => setSelectedSeverity('high')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${
                  selectedSeverity === 'high'
                    ? 'bg-red-600 text-white'
                    : 'bg-white text-red-600 hover:bg-red-50 border border-red-300'
                }`}
              >
                <XCircleIcon className="w-4 h-4" />
                High Priority
              </button>
              <button
                onClick={() => setSelectedSeverity('medium')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${
                  selectedSeverity === 'medium'
                    ? 'bg-yellow-600 text-white'
                    : 'bg-white text-yellow-600 hover:bg-yellow-50 border border-yellow-300'
                }`}
              >
                <AlertTriangleIcon className="w-4 h-4" />
                Medium Priority
              </button>
              <button
                onClick={() => setSelectedSeverity('low')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${
                  selectedSeverity === 'low'
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-green-600 hover:bg-green-50 border border-green-300'
                }`}
              >
                <InfoIcon className="w-4 h-4" />
                Low Priority
              </button>
            </div>
          </div>
        </div>

        {/* Troubleshooting Content */}
        <div className="space-y-8">
          {filteredContent.length === 0 ? (
            <div className="text-center py-12">
              <InfoIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No issues found</h3>
              <p className="text-gray-600">Try adjusting your filters to see more troubleshooting guides.</p>
            </div>
          ) : (
            filteredContent.map((section) => (
              <div key={section.category} className="bg-white rounded-lg shadow-sm border">
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <span className="w-3 h-3 bg-blue-600 rounded-full mr-3"></span>
                    {section.category}
                  </h2>
                  
                  <div className="space-y-6">
                    {section.issues.map((issue, index) => (
                      <div key={index} className={`border rounded-lg p-4 ${getSeverityColor(issue.severity)}`}>
                        <div className="flex items-start gap-3 mb-3">
                          {getSeverityIcon(issue.severity)}
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-1">
                              {issue.problem}
                            </h3>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize ${getSeverityColor(issue.severity)}`}>
                              {issue.severity} Priority
                            </span>
                          </div>
                        </div>
                        
                        <div className="ml-8">
                          <h4 className="font-medium text-gray-900 mb-2">Solution:</h4>
                          <div className="text-gray-700 whitespace-pre-line leading-relaxed">
                            {issue.solution}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Emergency Contact Section */}
        <div className="mt-12 bg-red-50 rounded-lg p-6 border border-red-200">
          <div className="flex items-start gap-3">
            <AlertTriangleIcon className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-red-900 mb-2">
                Need immediate assistance?
              </h3>
              <p className="text-red-700 mb-4">
                If you're experiencing a critical issue that prevents you from accessing your account or submitting time-sensitive applications, contact our emergency support.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="mailto:emergency@borealfinance.app"
                  className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Emergency Support
                </a>
                <a
                  href="/faq"
                  className="inline-flex items-center px-4 py-2 bg-white text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                >
                  View FAQ
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}