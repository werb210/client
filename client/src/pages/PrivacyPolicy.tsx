import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

/**
 * Privacy Policy page
 * GDPR/CCPA compliant privacy policy for Boreal Financial
 */
export function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-[#FF8C00] hover:text-[#e67900] mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-[#003D7A] mb-2">Privacy Policy</h1>
          <p className="text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 space-y-8">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-semibold text-[#003D7A] mb-4">1. Introduction</h2>
            <p className="text-gray-700 leading-relaxed">
              Boreal Financial ("we," "our," or "us") is committed to protecting your privacy and ensuring 
              the security of your personal information. This Privacy Policy explains how we collect, use, 
              disclose, and safeguard your information when you use our business financing application platform.
            </p>
          </section>

          {/* Information We Collect */}
          <section>
            <h2 className="text-2xl font-semibold text-[#003D7A] mb-4">2. Information We Collect</h2>
            
            <h3 className="text-lg font-medium text-[#003D7A] mb-2">Personal Information</h3>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-1">
              <li>Contact information (name, email, phone number, address)</li>
              <li>Business information (company name, legal structure, industry)</li>
              <li>Financial information (revenue, assets, financial statements)</li>
              <li>Government identification numbers (SSN, SIN, EIN)</li>
              <li>Banking and financial account information</li>
            </ul>

            <h3 className="text-lg font-medium text-[#003D7A] mb-2">Technical Information</h3>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-1">
              <li>IP address and approximate location</li>
              <li>Browser type and device information</li>
              <li>Usage data and interaction patterns</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>
          </section>

          {/* How We Use Information */}
          <section>
            <h2 className="text-2xl font-semibold text-[#003D7A] mb-4">3. How We Use Your Information</h2>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Process and evaluate your financing applications</li>
              <li>Connect you with appropriate lending partners</li>
              <li>Verify your identity and prevent fraud</li>
              <li>Communicate about your application status</li>
              <li>Improve our services and user experience</li>
              <li>Comply with legal and regulatory requirements</li>
              <li>Send marketing communications (with your consent)</li>
            </ul>
          </section>

          {/* Cookie Policy */}
          <section>
            <h2 className="text-2xl font-semibold text-[#003D7A] mb-4">4. Cookie Policy</h2>
            
            <h3 className="text-lg font-medium text-[#003D7A] mb-2">Necessary Cookies</h3>
            <p className="text-gray-700 mb-3">
              Essential for website functionality, security, and user authentication. These cannot be disabled.
            </p>

            <h3 className="text-lg font-medium text-[#003D7A] mb-2">Analytics Cookies</h3>
            <p className="text-gray-700 mb-3">
              Help us understand website usage patterns and improve our services. You can opt out of these.
            </p>

            <h3 className="text-lg font-medium text-[#003D7A] mb-2">Marketing Cookies</h3>
            <p className="text-gray-700 mb-3">
              Used for personalized advertising and campaign tracking. These are optional and require your consent.
            </p>

            <p className="text-gray-700">
              You can manage your cookie preferences at any time using our{" "}
              <button 
                onClick={() => window.dispatchEvent(new CustomEvent('openCookieSettings'))}
                className="text-[#FF8C00] hover:underline font-medium"
              >
                Cookie Settings
              </button>
              .
            </p>
          </section>

          {/* Information Sharing */}
          <section>
            <h2 className="text-2xl font-semibold text-[#003D7A] mb-4">5. Information Sharing</h2>
            <p className="text-gray-700 mb-3">We may share your information with:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Lending partners and financial institutions for application processing</li>
              <li>Service providers who assist in operating our platform</li>
              <li>Legal authorities when required by law or to protect our rights</li>
              <li>Third parties with your explicit consent</li>
            </ul>
            <p className="text-gray-700 mt-3">
              We do not sell your personal information to third parties for marketing purposes.
            </p>
          </section>

          {/* Data Security */}
          <section>
            <h2 className="text-2xl font-semibold text-[#003D7A] mb-4">6. Data Security</h2>
            <p className="text-gray-700">
              We implement industry-standard security measures including encryption, secure servers, 
              and access controls to protect your information. However, no method of transmission over 
              the internet is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          {/* Your Rights */}
          <section>
            <h2 className="text-2xl font-semibold text-[#003D7A] mb-4">7. Your Rights</h2>
            <p className="text-gray-700 mb-3">
              Depending on your location, you may have the following rights:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Access to your personal information</li>
              <li>Correction of inaccurate information</li>
              <li>Deletion of your information (right to be forgotten)</li>
              <li>Data portability</li>
              <li>Opt-out of marketing communications</li>
              <li>Withdraw consent for data processing</li>
            </ul>
          </section>

          {/* Contact Information */}
          <section>
            <h2 className="text-2xl font-semibold text-[#003D7A] mb-4">8. Contact Us</h2>
            <p className="text-gray-700 mb-3">
              If you have questions about this Privacy Policy or wish to exercise your rights, please contact us:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700"><strong>Email:</strong> privacy@boreal.financial</p>
              <p className="text-gray-700"><strong>Phone:</strong> (825) 451‑1768</p>
              <p className="text-gray-700"><strong>Address:</strong> Boreal Financial Privacy Office</p>
            </div>
          </section>

          {/* Updates */}
          <section>
            <h2 className="text-2xl font-semibold text-[#003D7A] mb-4">9. Policy Updates</h2>
            <p className="text-gray-700">
              We may update this Privacy Policy periodically. We will notify you of significant changes 
              by posting the updated policy on our website and updating the "Last updated" date above.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}