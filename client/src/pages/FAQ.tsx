import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, HelpCircle } from 'lucide-react';

const faqData = [
  {
    category: "Application Process",
    questions: [
      {
        question: "How long does the application process take?",
        answer: "The complete application typically takes 10-15 minutes to fill out. Review and approval usually takes 1-3 business days."
      },
      {
        question: "What documents do I need to prepare?",
        answer: "You'll need recent financial statements, tax returns, bank statements, and business registration documents. The exact requirements depend on your chosen financing product."
      },
      {
        question: "Can I save my application and return later?",
        answer: "Yes! Your progress is automatically saved. You can return anytime to complete your application from where you left off."
      }
    ]
  },
  {
    category: "Eligibility",
    questions: [
      {
        question: "What is the minimum credit score required?",
        answer: "Credit score requirements vary by lender and product type. We work with lenders who accept scores from 550+ to 700+. Our system will match you with suitable options."
      },
      {
        question: "How long does my business need to be operating?",
        answer: "Most lenders require at least 6 months in business, though some accept newer businesses. Startups may qualify for certain products with strong personal credit."
      },
      {
        question: "What industries do you serve?",
        answer: "We serve most industries including retail, manufacturing, professional services, restaurants, construction, and more. Some restricted industries include adult entertainment and gambling."
      }
    ]
  },
  {
    category: "Financing Products",
    questions: [
      {
        question: "What types of financing are available?",
        answer: "We offer equipment financing, working capital loans, business lines of credit, SBA loans, merchant cash advances, and specialized industry financing."
      },
      {
        question: "What are the typical interest rates?",
        answer: "Rates vary based on creditworthiness, business performance, and product type. Equipment financing typically ranges from 6-20%, while working capital may range from 8-35%."
      },
      {
        question: "How much can I borrow?",
        answer: "Loan amounts range from $10,000 to $5 million depending on your business qualifications and the financing product. Equipment financing can go up to 100% of equipment value."
      }
    ]
  },
  {
    category: "Technical Support",
    questions: [
      {
        question: "I'm having trouble uploading documents. What should I do?",
        answer: "Ensure your files are in PDF, JPG, or PNG format and under 10MB each. Try refreshing the page or using a different browser. Contact support if issues persist."
      },
      {
        question: "Can I use this application on my mobile device?",
        answer: "Yes! Our application is fully mobile-responsive and works on all devices. You can even install it as an app on your phone for easier access."
      },
      {
        question: "Is my information secure?",
        answer: "Absolutely. We use bank-level encryption and security measures. Your data is protected and never shared without your consent."
      }
    ]
  }
];

export default function FAQ() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <HelpCircle className="h-12 w-12 text-teal-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Frequently Asked Questions</h1>
          <p className="text-gray-600">Find answers to common questions about our financing application process</p>
        </div>

        <div className="space-y-6">
          {faqData.map((category, categoryIndex) => (
            <Card key={categoryIndex} className="overflow-hidden">
              <CardHeader className="bg-teal-50">
                <CardTitle className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-teal-600 text-white">
                    {category.category}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {category.questions.map((qa, qaIndex) => (
                  <Collapsible key={qaIndex}>
                    <CollapsibleTrigger className="w-full p-4 text-left border-b border-gray-200 hover:bg-gray-50 flex items-center justify-between group">
                      <span className="font-medium text-gray-900">{qa.question}</span>
                      <ChevronDown className="h-4 w-4 text-gray-500 group-data-[state=open]:rotate-180 transition-transform" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="p-4 pt-2 bg-white">
                      <p className="text-gray-700 leading-relaxed">{qa.answer}</p>
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-8 bg-gradient-to-r from-teal-50 to-orange-50">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Still have questions?</h3>
            <p className="text-gray-600 mb-4">Our support team is here to help you through the application process</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="tel:+18254511768" className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition-colors">
                Call (825) 451‑1768
              </a>
              <a href="mailto:support@boreal.financial" className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors">
                Email Support
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}