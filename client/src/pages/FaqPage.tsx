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
          <div className="mb-modern-2xl">
            <div className="flex flex-wrap gap-modern-sm">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`btn-modern ${
                  selectedCategory === 'all'
                    ? 'bg-brand-blue-600 text-white'
                    : 'btn-modern-outline'
                }`}
              >
                All Categories
              </button>
              {faqCategories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`btn-modern ${
                    selectedCategory === category
                      ? 'bg-brand-blue-600 text-white'
                      : 'btn-modern-outline'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* FAQ Content */}
          <div className="space-y-modern-2xl">
            {filteredContent.map((section) => (
              <div key={section.category} className="card-modern">
                <div className="p-modern-xl">
                  <h2 className="heading-modern-h3 mb-modern-lg flex items-center">
                    <span className="w-3 h-3 bg-brand-blue-600 rounded-full mr-modern-sm"></span>
                    {section.category}
                  </h2>
                  
                  <div className="space-y-modern-lg">
                    {section.questions.map((item, index) => {
                      const key = `${section.category}-${index}`;
                      const isExpanded = expandedItems.has(key);
                      
                      return (
                        <div key={key} className="border border-modern-border rounded-lg">
                          <button
                            onClick={() => toggleExpanded(key)}
                            className="w-full p-modern-lg text-left hover:bg-modern-accent transition-colors flex items-center justify-between"
                          >
                            <span className="body-modern font-medium text-modern-foreground pr-modern-lg">
                              {item.question}
                            </span>
                            {isExpanded ? (
                              <ChevronUpIcon className="w-5 h-5 text-modern-muted flex-shrink-0" />
                            ) : (
                              <ChevronDownIcon className="w-5 h-5 text-modern-muted flex-shrink-0" />
                            )}
                          </button>
                          
                          {isExpanded && (
                            <div className="px-modern-lg pb-modern-lg border-t border-modern-border">
                              <div className="pt-modern-sm body-modern text-modern-secondary leading-relaxed whitespace-pre-line">
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
          <div className="mt-modern-3xl bg-brand-blue-50 rounded-lg p-modern-xl border border-brand-blue-200 card-modern">
            <h3 className="heading-modern-h4 text-brand-blue-900 mb-modern-sm">
              Still have questions?
            </h3>
            <p className="body-modern text-brand-blue-700 mb-modern-lg">
              If you can't find the answer you're looking for, our support team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-modern-sm">
              <a
                href="/troubleshooting"
                className="btn-modern bg-brand-blue-600 text-white hover:bg-brand-blue-700"
              >
                View Troubleshooting Guide
              </a>
              <a
                href="mailto:support@borealfinance.app"
                className="btn-modern btn-modern-outline text-brand-blue-600 border-brand-blue-300 hover:bg-brand-blue-50"
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