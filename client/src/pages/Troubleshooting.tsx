import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Wifi, FileX, Camera, Smartphone } from 'lucide-react';

const troubleshootingSteps = [
  {
    issue: "Application Won't Load",
    icon: <RefreshCw className="h-6 w-6" />,
    solutions: [
      "Clear your browser cache and cookies",
      "Try using an incognito/private browsing window",
      "Disable browser extensions temporarily",
      "Try a different browser (Chrome, Firefox, Safari)",
      "Check your internet connection"
    ]
  },
  {
    issue: "Document Upload Problems",
    icon: <FileX className="h-6 w-6" />,
    solutions: [
      "Ensure files are PDF, JPG, or PNG format",
      "Check file size is under 10MB per document",
      "Try compressing large files",
      "Rename files to remove special characters",
      "Use a stable internet connection"
    ]
  },
  {
    issue: "Mobile Camera Issues",
    icon: <Camera className="h-6 w-6" />,
    solutions: [
      "Allow camera permissions in your browser",
      "Ensure good lighting for document photos",
      "Hold device steady and focus clearly",
      "Try taking photos in landscape mode",
      "Clean your camera lens"
    ]
  },
  {
    issue: "Form Not Saving Progress",
    icon: <Smartphone className="h-6 w-6" />,
    solutions: [
      "Enable cookies in your browser settings",
      "Don't use private/incognito mode",
      "Stay on the same device and browser",
      "Complete each step before navigating away",
      "Check available storage space"
    ]
  },
  {
    issue: "Connection Problems",
    icon: <Wifi className="h-6 w-6" />,
    solutions: [
      "Check your internet connection stability",
      "Try switching from WiFi to mobile data (or vice versa)",
      "Restart your router/modem",
      "Move closer to your WiFi router",
      "Contact your internet service provider"
    ]
  }
];

const browserCompatibility = [
  { browser: "Chrome", version: "90+", status: "Recommended" },
  { browser: "Firefox", version: "88+", status: "Supported" },
  { browser: "Safari", version: "14+", status: "Supported" },
  { browser: "Edge", version: "90+", status: "Supported" },
  { browser: "Internet Explorer", version: "Any", status: "Not Supported" }
];

export default function Troubleshooting() {
  const runDiagnostics = () => {
    window.open('/pwa-diagnostics', '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <AlertTriangle className="h-12 w-12 text-orange-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Troubleshooting Guide</h1>
          <p className="text-gray-600">Solutions for common technical issues with the application portal</p>
        </div>

        {/* Quick Diagnostics */}
        <Card className="mb-8 border-orange-200">
          <CardHeader className="bg-orange-50">
            <CardTitle className="text-orange-800">Quick System Check</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <p className="text-gray-700 mb-4">
              Run our automated diagnostics to identify potential issues with your browser or connection.
            </p>
            <Button onClick={runDiagnostics} className="bg-orange-600 hover:bg-orange-700">
              Run Diagnostics
            </Button>
          </CardContent>
        </Card>

        {/* Common Issues */}
        <div className="space-y-6 mb-8">
          {troubleshootingSteps.map((item, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-lg">
                  <div className="text-teal-600">{item.icon}</div>
                  {item.issue}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-2">
                  {item.solutions.map((solution, solutionIndex) => (
                    <li key={solutionIndex} className="flex items-start gap-2">
                      <span className="bg-teal-100 text-teal-800 text-xs px-2 py-1 rounded-full font-medium min-w-[24px] text-center">
                        {solutionIndex + 1}
                      </span>
                      <span className="text-gray-700">{solution}</span>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Browser Compatibility */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Browser Compatibility</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Browser</th>
                    <th className="text-left py-2">Minimum Version</th>
                    <th className="text-left py-2">Status</th>
                  </tr>
                </thead>
                <tbody className="space-y-2">
                  {browserCompatibility.map((browser, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-2 font-medium">{browser.browser}</td>
                      <td className="py-2 text-gray-600">{browser.version}</td>
                      <td className="py-2">
                        <Badge 
                          className={
                            browser.status === 'Recommended' ? 'bg-green-500' :
                            browser.status === 'Supported' ? 'bg-blue-500' : 'bg-red-500'
                          }
                        >
                          {browser.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* System Requirements */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>System Requirements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2 text-gray-900">Desktop/Laptop</h4>
                <ul className="space-y-1 text-sm text-gray-700">
                  <li>• Stable internet connection (1 Mbps minimum)</li>
                  <li>• Modern browser with JavaScript enabled</li>
                  <li>• Cookies and local storage enabled</li>
                  <li>• Camera access for document capture (optional)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-gray-900">Mobile Device</h4>
                <ul className="space-y-1 text-sm text-gray-700">
                  <li>• iOS 14+ or Android 8.0+</li>
                  <li>• Camera access for document photos</li>
                  <li>• Sufficient storage space (50MB minimum)</li>
                  <li>• Mobile data or WiFi connection</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Support */}
        <Card className="bg-gradient-to-r from-teal-50 to-orange-50">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Still experiencing issues?</h3>
            <p className="text-gray-600 mb-4">Our technical support team is available to help resolve any problems</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-teal-600 hover:bg-teal-700">
                <a href="tel:+18254511768">Call Tech Support</a>
              </Button>
              <Button variant="outline" className="border-orange-600 text-orange-600 hover:bg-orange-50">
                <a href="mailto:info@boreal.financial">Email Tech Team</a>
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              Support hours: Monday-Friday 8AM-8PM EST, Saturday 9AM-5PM EST
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}