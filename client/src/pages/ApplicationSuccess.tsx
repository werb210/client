import React from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import CheckCircle from 'lucide-react/dist/esm/icons/check-circle';
import Clock from 'lucide-react/dist/esm/icons/clock';
import Mail from 'lucide-react/dist/esm/icons/mail';
import Phone from 'lucide-react/dist/esm/icons/phone';
import FileText from 'lucide-react/dist/esm/icons/file-text';
import Home from 'lucide-react/dist/esm/icons/home';
import Calendar from 'lucide-react/dist/esm/icons/calendar';

/**
 * Application Success Page
 * 
 * Displayed after successful application submission with next steps
 * and contact information for applicants.
 */
export default function ApplicationSuccess() {
  const [, setLocation] = useLocation();

  const nextSteps = [
    {
      step: 1,
      title: "Application Review",
      description: "Our underwriting team will review your complete application and documents",
      timeframe: "1-2 business days"
    },
    {
      step: 2,
      title: "Initial Assessment",
      description: "We'll conduct preliminary credit and business verification checks",
      timeframe: "2-3 business days"
    },
    {
      step: 3,
      title: "Decision & Terms",
      description: "You'll receive our decision with detailed terms and conditions",
      timeframe: "3-5 business days"
    },
    {
      step: 4,
      title: "Funding",
      description: "Upon acceptance, funds are typically disbursed within 24-48 hours",
      timeframe: "1-2 business days"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Success Header */}
        <Card className="mb-8 text-center">
          <CardContent className="pt-8 pb-8">
            <CheckCircle className="h-20 w-20 text-green-600 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Application Submitted Successfully!
            </h1>
            <p className="text-lg text-gray-600 mb-4">
              Thank you for choosing Boreal Financial. Your complete application with all supporting documents has been received.
            </p>
            <Badge variant="default" className="text-base px-4 py-2">
              <Clock className="h-4 w-4 mr-2" />
              Total Processing Time: 5-7 Business Days
            </Badge>
          </CardContent>
        </Card>

        {/* Application Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5" />
                Application ID
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-mono font-bold text-teal-600">
                BF-{new Date().getFullYear()}-{Math.random().toString(36).substring(2, 8).toUpperCase()}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Reference this ID in all communications
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="h-5 w-5" />
                Submission Date
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-semibold text-gray-900">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long',
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {new Date().toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  timeZoneName: 'short'
                })}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Mail className="h-5 w-5" />
                Status Updates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold text-gray-900">Email & SMS</p>
              <p className="text-sm text-gray-600 mt-1">
                You'll receive updates at each stage
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Next Steps Timeline */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl">What Happens Next?</CardTitle>
            <p className="text-gray-600">
              Here's what you can expect during the review process:
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {nextSteps.map((step, index) => (
                <div key={step.step} className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-teal-600 text-white rounded-full flex items-center justify-center font-semibold">
                      {step.step}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{step.title}</h3>
                    <p className="text-gray-600 text-sm mb-2">{step.description}</p>
                    <Badge variant="secondary" className="text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      {step.timeframe}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl">Need Help?</CardTitle>
            <p className="text-gray-600">
              Our team is here to assist you throughout the process
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone Support
                </h4>
                <div className="space-y-2 text-sm">
                  <p><strong>Main Line:</strong> 1-800-BOREAL-1</p>
                  <p><strong>Direct:</strong> (555) 123-4567</p>
                  <p><strong>Hours:</strong> Mon-Fri 8AM-6PM EST</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Support
                </h4>
                <div className="space-y-2 text-sm">
                  <p><strong>General:</strong> support@borealfinance.com</p>
                  <p><strong>Applications:</strong> applications@borealfinance.com</p>
                  <p><strong>Response Time:</strong> Within 4 hours</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Important Notes */}
        <Card className="mb-8 border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="text-amber-800">Important Notes</CardTitle>
          </CardHeader>
          <CardContent className="text-amber-700">
            <ul className="space-y-2 text-sm">
              <li>• <strong>No Action Required:</strong> Your application is complete and being processed</li>
              <li>• <strong>Document Security:</strong> All uploaded documents are encrypted and secure</li>
              <li>• <strong>Credit Impact:</strong> Our initial review uses a soft credit check that won't affect your score</li>
              <li>• <strong>Additional Information:</strong> We may contact you if additional documentation is needed</li>
            </ul>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="text-center">
          <Button 
            onClick={() => setLocation('/')}
            className="bg-teal-600 hover:bg-teal-700 text-white"
          >
            <Home className="mr-2 h-4 w-4" />
            Return to Home
          </Button>
        </div>
      </div>
    </div>
  );
}