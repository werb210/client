import { useState } from 'react';
import { useLocation } from 'wouter';
import { CheckCircle, Users, Shield, TrendingUp, Clock, DollarSign, FileText, Phone, Mail, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { isFirstVisit } from '@/lib/visitFlags';

export default function ProfessionalLandingPage() {
  const [, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleGetStarted = () => {
    if (isFirstVisit()) {
      setLocation('/register');
    } else {
      setLocation('/login');
    }
  };

  const handleSignIn = () => {
    setLocation('/login');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">B</span>
              </div>
              <span className="text-xl font-bold text-foreground">Boreal Financial</span>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#services" className="text-muted-foreground hover:text-foreground transition-colors">Services</a>
              <a href="#about" className="text-muted-foreground hover:text-foreground transition-colors">About</a>
              <a href="#contact" className="text-muted-foreground hover:text-foreground transition-colors">Contact</a>
              <Button variant="outline" onClick={handleSignIn} className="button-transition">
                Sign In
              </Button>
              <Button onClick={handleGetStarted} className="button-transition bg-primary hover:bg-primary/90">
                Get Started
              </Button>
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <div className="w-6 h-6 flex flex-col justify-center space-y-1">
                <div className="h-0.5 bg-foreground transform transition"></div>
                <div className="h-0.5 bg-foreground transform transition"></div>
                <div className="h-0.5 bg-foreground transform transition"></div>
              </div>
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 py-4 border-t border-border">
              <nav className="flex flex-col space-y-4">
                <a href="#services" className="text-muted-foreground hover:text-foreground transition-colors">Services</a>
                <a href="#about" className="text-muted-foreground hover:text-foreground transition-colors">About</a>
                <a href="#contact" className="text-muted-foreground hover:text-foreground transition-colors">Contact</a>
                <div className="flex flex-col space-y-2 pt-4">
                  <Button variant="outline" onClick={handleSignIn} className="mobile-button">
                    Sign In
                  </Button>
                  <Button onClick={handleGetStarted} className="mobile-button bg-primary hover:bg-primary/90">
                    Get Started
                  </Button>
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24 page-transition">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Finance That <span className="text-primary">Grows With You</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Get the funding your business needs with competitive rates, fast approval, 
              and personalized service from Canada's trusted financial partner.
            </p>
            
            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-8 mb-12 text-muted-foreground">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-success" />
                <span>$50M+ Funded</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-success" />
                <span>1000+ Businesses</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-success" />
                <span>Bank-Level Security</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={handleGetStarted}
                className="text-lg px-8 py-6 button-transition bg-primary hover:bg-primary/90"
              >
                Start Your Application
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="text-lg px-8 py-6 button-transition"
              >
                View Loan Products
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Loan Products Showcase */}
      <section id="services" className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Financing Solutions for Every Business
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From startups to established enterprises, we have the right funding solution for your needs.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              {
                title: "Term Loans",
                range: "$25K - $5M",
                icon: <DollarSign className="w-8 h-8" />,
                description: "Traditional business loans with competitive fixed rates",
                features: ["Fixed interest rates", "5-7 year terms", "No prepayment penalties"]
              },
              {
                title: "Lines of Credit",
                range: "$10K - $2M", 
                icon: <TrendingUp className="w-8 h-8" />,
                description: "Flexible credit lines for working capital needs",
                features: ["Draw as needed", "Interest only on used funds", "Revolving credit"]
              },
              {
                title: "Equipment Financing",
                range: "$50K - $10M",
                icon: <FileText className="w-8 h-8" />,
                description: "Specialized financing for business equipment and machinery",
                features: ["Up to 100% financing", "Equipment as collateral", "Fast approval"]
              },
              {
                title: "Invoice Factoring",
                range: "$1K - $1M",
                icon: <Clock className="w-8 h-8" />,
                description: "Convert invoices to immediate cash flow",
                features: ["Same-day funding", "No debt incurred", "Credit protection"]
              }
            ].map((product, index) => (
              <Card key={index} className="card-transition hover:shadow-lg">
                <CardContent className="p-6">
                  <div className="text-primary mb-4">{product.icon}</div>
                  <h3 className="text-xl font-semibold mb-2">{product.title}</h3>
                  <div className="text-2xl font-bold text-primary mb-3">{product.range}</div>
                  <p className="text-muted-foreground mb-4">{product.description}</p>
                  <ul className="space-y-2">
                    {product.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-sm text-muted-foreground">
                        <CheckCircle className="w-4 h-4 text-success mr-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Choose Boreal Financial?
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Clock className="w-12 h-12 text-primary" />,
                title: "Fast Approval",
                description: "Get approved in as little as 24 hours with our streamlined application process.",
                benefits: ["Online application", "Quick decision", "Minimal paperwork"]
              },
              {
                icon: <DollarSign className="w-12 h-12 text-primary" />,
                title: "Competitive Rates",
                description: "Access some of the most competitive interest rates in the Canadian market.",
                benefits: ["Market-leading rates", "Transparent pricing", "No hidden fees"]
              },
              {
                icon: <Users className="w-12 h-12 text-primary" />,
                title: "Expert Support",
                description: "Work with dedicated financing specialists who understand your business.",
                benefits: ["Personal advisor", "Industry expertise", "Ongoing support"]
              }
            ].map((feature, index) => (
              <Card key={index} className="text-center card-transition">
                <CardContent className="p-8">
                  <div className="flex justify-center mb-6">{feature.icon}</div>
                  <h3 className="text-2xl font-semibold mb-4">{feature.title}</h3>
                  <p className="text-muted-foreground mb-6">{feature.description}</p>
                  <ul className="space-y-2">
                    {feature.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-center justify-center text-muted-foreground">
                        <CheckCircle className="w-4 h-4 text-success mr-2" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Grow Your Business?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of Canadian businesses that have chosen Boreal Financial for their funding needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="secondary"
              onClick={handleGetStarted}
              className="text-lg px-8 py-6 button-transition"
            >
              Apply Now
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="text-lg px-8 py-6 button-transition border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
            >
              Schedule Consultation
            </Button>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Get In Touch
            </h2>
            <p className="text-xl text-muted-foreground">
              Have questions? Our team is here to help you find the right financing solution.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Card className="text-center card-transition">
              <CardContent className="p-6">
                <Phone className="w-8 h-8 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Phone</h3>
                <p className="text-muted-foreground">1-800-BOREAL-1</p>
                <p className="text-sm text-muted-foreground">Mon-Fri 9AM-6PM EST</p>
              </CardContent>
            </Card>

            <Card className="text-center card-transition">
              <CardContent className="p-6">
                <Mail className="w-8 h-8 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Email</h3>
                <p className="text-muted-foreground">info@borealfinancial.ca</p>
                <p className="text-sm text-muted-foreground">24/7 support</p>
              </CardContent>
            </Card>

            <Card className="text-center card-transition">
              <CardContent className="p-6">
                <MapPin className="w-8 h-8 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Office</h3>
                <p className="text-muted-foreground">Toronto, ON</p>
                <p className="text-sm text-muted-foreground">Serving all of Canada</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-lg">B</span>
                </div>
                <span className="text-xl font-bold">Boreal Financial</span>
              </div>
              <p className="text-muted-foreground">
                Empowering Canadian businesses with flexible financing solutions since 2020.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Products</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Term Loans</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Lines of Credit</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Equipment Financing</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Invoice Factoring</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Press</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Partners</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2025 Boreal Financial. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}