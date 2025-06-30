import React, { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
import { faqContent, faqCategories } from '@/content/faq';
import { BorealLogo } from '@/components/BorealLogo';
import MainLayout from '@/components/layout/MainLayout';

export default function FaqPage() {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const toggleExpanded = (key: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedItems(newExpanded);
  };

  const filteredContent = selectedCategory === 'all' 
    ? faqContent 
    : faqContent.filter(section => section.category === selectedCategory);

  return (
    <MainLayout>
      <div className="min-h-screen bg-modern-primary">
        {/* Main Content */}
        <main className="container-modern py-modern-2xl">
          <div className="mb-modern-2xl">
            <h1 className="heading-modern-display">Frequently Asked Questions</h1>
            <p className="body-modern-large text-modern-secondary mt-modern-lg">
              Find answers to common questions about Boreal Financial's services, application process, and platform features.
            </p>
          </div>

        {/* Category Filter */}
        <div className="mb-8">
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
            {faqCategories.map(category => (
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

        {/* FAQ Content */}
        <div className="space-y-8">
          {filteredContent.map((section) => (
            <div key={section.category} className="bg-white rounded-lg shadow-sm border">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="w-3 h-3 bg-blue-600 rounded-full mr-3"></span>
                  {section.category}
                </h2>
                
                <div className="space-y-4">
                  {section.questions.map((item, index) => {
                    const key = `${section.category}-${index}`;
                    const isExpanded = expandedItems.has(key);
                    
                    return (
                      <div key={key} className="border border-gray-200 rounded-lg">
                        <button
                          onClick={() => toggleExpanded(key)}
                          className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center justify-between"
                        >
                          <span className="font-medium text-gray-900 pr-4">
                            {item.question}
                          </span>
                          {isExpanded ? (
                            <ChevronUpIcon className="w-5 h-5 text-gray-500 flex-shrink-0" />
                          ) : (
                            <ChevronDownIcon className="w-5 h-5 text-gray-500 flex-shrink-0" />
                          )}
                        </button>
                        
                        {isExpanded && (
                          <div className="px-4 pb-4 border-t border-gray-100">
                            <div className="pt-3 text-gray-600 leading-relaxed whitespace-pre-line">
                              {item.answer}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div className="mt-12 bg-blue-50 rounded-lg p-6 border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            Still have questions?
          </h3>
          <p className="text-blue-700 mb-4">
            If you can't find the answer you're looking for, our support team is here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="/troubleshooting"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              View Troubleshooting Guide
            </a>
            <a
              href="mailto:support@borealfinance.app"
              className="inline-flex items-center px-4 py-2 bg-white text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
            >
              Contact Support
            </a>
          </div>
        </div>
      </main>
      </div>
    </MainLayout>
  );
}