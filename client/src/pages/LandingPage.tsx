import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Shield, Clock, Users, TrendingUp, Award, Phone, Mail, MapPin } from 'lucide-react';
import { isFirstVisit } from '@/lib/visitFlags';

const features = [
  {
    icon: <Clock className="h-8 w-8 text-teal-600" />,
    title: "Fast Approval",
    description: "Get pre-approved in as little as 24 hours with our streamlined application process.",
    highlight: "24-hour pre-approval"
  },
  {
    icon: <TrendingUp className="h-8 w-8 text-teal-600" />,
    title: "Competitive Rates",
    description: "Access competitive interest rates starting from 4.5% for qualified borrowers.",
    highlight: "Rates from 4.5%"
  },
  {
    icon: <Users className="h-8 w-8 text-teal-600" />,
    title: "Expert Support",
    description: "Dedicated loan specialists guide you through every step of the financing process.",
    highlight: "Dedicated specialists"
  }
];

const loanProducts = [
  {
    title: "Working Capital Loans",
    description: "Flexible financing for day-to-day operations and growth opportunities",
    amount: "$10K - $500K",
    term: "3-60 months",
    features: ["Quick approval", "Flexible terms", "No collateral required"]
  },
  {
    title: "Equipment Financing",
    description: "Finance new or used equipment to expand your business capabilities",
    amount: "$5K - $1M",
    term: "12-84 months",
    features: ["100% financing", "Tax benefits", "Equipment as collateral"]
  },
  {
    title: "Line of Credit",
    description: "Access funds when you need them with a revolving credit facility",
    amount: "$25K - $250K",
    term: "12-36 months",
    features: ["Only pay for what you use", "Renewable", "Instant access"]
  }
];

const testimonials = [
  {
    name: "Sarah Mitchell",
    company: "Mitchell Manufacturing",
    content: "Boreal Financial helped us secure the equipment financing we needed to expand our production capacity. The process was smooth and professional.",
    amount: "$150K Equipment Loan"
  },
  {
    name: "David Chen",
    company: "Chen Digital Solutions",
    content: "The working capital loan gave us the flexibility to take on larger projects and grow our team. Highly recommend their services.",
    amount: "$75K Working Capital"
  }
];

export function LandingPage() {
  const handleGetStarted = () => {
    if (isFirstVisit()) {
      window.location.href = '/register';
    } else {
      window.location.href = '/login';
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-teal-600 to-teal-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">B</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">Boreal Financial</span>
            </div>
            
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/loans" className="text-gray-700 hover:text-teal-600 font-medium">Loan Products</Link>
              <Link href="/about" className="text-gray-700 hover:text-teal-600 font-medium">About Us</Link>
              <Link href="/contact" className="text-gray-700 hover:text-teal-600 font-medium">Contact</Link>
              <Link href="/login" className="text-gray-700 hover:text-teal-600 font-medium">Sign In</Link>
              <Button onClick={handleGetStarted} className="bg-teal-600 hover:bg-teal-700 text-white">
                Get Started
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-teal-50 via-white to-orange-50 py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-600/5 to-orange-400/5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge className="bg-teal-100 text-teal-800 hover:bg-teal-100">
                  <Award className="h-4 w-4 mr-1" />
                  Trusted by 10,000+ Businesses
                </Badge>
                <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Finance That
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-orange-500">
                    Grows With You
                  </span>
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Access flexible business financing solutions designed to fuel your growth. 
                  From working capital to equipment loans, we provide the funding you need 
                  with competitive rates and expert support.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  onClick={handleGetStarted}
                  className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-4 text-lg"
                >
                  Start Your Application
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-teal-600 text-teal-600 hover:bg-teal-50 px-8 py-4 text-lg"
                >
                  View Loan Options
                </Button>
              </div>

              <div className="flex items-center space-x-8 pt-4">
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-green-600" />
                  <span className="text-sm text-gray-600">Secure & Encrypted</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-sm text-gray-600">No Hidden Fees</span>
                </div>
              </div>
            </div>

            <div className="lg:flex justify-center hidden">
              <div className="relative">
                <div className="w-96 h-96 bg-gradient-to-br from-teal-100 to-orange-100 rounded-3xl shadow-2xl"></div>
                <div className="absolute inset-4 bg-white rounded-2xl shadow-lg p-8 space-y-6">
                  <div className="space-y-2">
                    <div className="h-4 bg-teal-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                      <div className="h-3 bg-teal-200 rounded w-1/4"></div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-3 bg-orange-200 rounded w-1/3"></div>
                    </div>
                  </div>
                  <div className="h-8 bg-teal-600 rounded w-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold text-gray-900">Why Choose Boreal Financial?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We combine cutting-edge technology with personalized service to deliver 
              financing solutions that work for your business.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow border-0 shadow-md">
                <CardHeader className="space-y-4">
                  <div className="flex justify-center">
                    <div className="p-3 bg-teal-50 rounded-2xl">
                      {feature.icon}
                    </div>
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <CardDescription className="text-gray-600">
                    {feature.description}
                  </CardDescription>
                  <Badge variant="secondary" className="bg-teal-100 text-teal-800">
                    {feature.highlight}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Loan Products Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold text-gray-900">Our Loan Products</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Flexible financing solutions tailored to your business needs and growth stage.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {loanProducts.map((product, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-xl text-teal-700">{product.title}</CardTitle>
                  <CardDescription>{product.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">Amount:</span>
                      <span className="text-teal-600 font-semibold">{product.amount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Term:</span>
                      <span className="text-gray-600">{product.term}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">Key Features:</h4>
                    <ul className="space-y-1">
                      {product.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center text-sm text-gray-600">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Button 
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white mt-4"
                    onClick={handleGetStarted}
                  >
                    Apply Now
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-r from-teal-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold text-gray-900">Success Stories</h2>
            <p className="text-xl text-gray-600">
              See how we've helped businesses like yours achieve their goals.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-white shadow-lg">
                <CardContent className="p-8">
                  <div className="space-y-4">
                    <p className="text-gray-700 italic text-lg leading-relaxed">
                      "{testimonial.content}"
                    </p>
                    <div className="flex justify-between items-end">
                      <div>
                        <div className="font-semibold text-gray-900">{testimonial.name}</div>
                        <div className="text-gray-600">{testimonial.company}</div>
                      </div>
                      <Badge className="bg-teal-100 text-teal-800">
                        {testimonial.amount}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-teal-600 to-teal-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-8">
            <h2 className="text-4xl font-bold text-white">
              Ready to Grow Your Business?
            </h2>
            <p className="text-xl text-teal-100 max-w-2xl mx-auto">
              Join thousands of businesses that trust Boreal Financial for their funding needs. 
              Start your application today and get the capital you need to succeed.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={handleGetStarted}
                className="bg-white text-teal-600 hover:bg-gray-50 px-8 py-4 text-lg font-semibold"
              >
                Start Your Application
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white hover:text-teal-600 px-8 py-4 text-lg"
              >
                Schedule Consultation
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-teal-600 to-teal-700 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">B</span>
                </div>
                <span className="text-xl font-bold">Boreal Financial</span>
              </div>
              <p className="text-gray-400">
                Empowering businesses with flexible financing solutions since 2010.
              </p>
              <div className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-teal-400" />
                  <span className="text-sm text-gray-400">FDIC Insured</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Loan Products</h3>
              <div className="space-y-2 text-gray-400">
                <div>Working Capital</div>
                <div>Equipment Financing</div>
                <div>Line of Credit</div>
                <div>Commercial Real Estate</div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <div className="space-y-2 text-gray-400">
                <div>About Us</div>
                <div>Careers</div>
                <div>Press</div>
                <div>Partner Program</div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Contact</h3>
              <div className="space-y-3 text-gray-400">
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4" />
                  <span>1-800-BOREAL-1</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>hello@borealfinancial.com</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4" />
                  <span>Toronto, ON</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-gray-400 text-sm">
                © 2025 Boreal Financial. All rights reserved.
              </div>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <Link href="/privacy" className="text-gray-400 hover:text-white text-sm">Privacy Policy</Link>
                <Link href="/terms" className="text-gray-400 hover:text-white text-sm">Terms of Service</Link>
                <Link href="/accessibility" className="text-gray-400 hover:text-white text-sm">Accessibility</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}