import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

/**
 * Terms of Service page
 * Legal terms and conditions for Boreal Financial platform usage
 */
export function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-[#FF8C00] hover:text-[#e67900] mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-[#003D7A] mb-2">Terms of Service</h1>
          <p className="text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 space-y-8">
          {/* Acceptance */}
          <section>
            <h2 className="text-2xl font-semibold text-[#003D7A] mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              By accessing or using the Boreal Financial platform, you agree to be bound by these Terms of Service 
              and all applicable laws and regulations. If you do not agree with any of these terms, you are 
              prohibited from using or accessing our services.
            </p>
          </section>

          {/* Description of Service */}
          <section>
            <h2 className="text-2xl font-semibold text-[#003D7A] mb-4">2. Description of Service</h2>
            <p className="text-gray-700 mb-3">
              Boreal Financial provides an online platform that:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Connects businesses with potential lending partners</li>
              <li>Facilitates the submission of financing applications</li>
              <li>Provides document upload and e-signature capabilities</li>
              <li>Offers AI-powered lender recommendations</li>
              <li>Manages application workflow and status tracking</li>
            </ul>
            <p className="text-gray-700 mt-3">
              We are a technology platform and do not provide financial services directly.
            </p>
          </section>

          {/* User Responsibilities */}
          <section>
            <h2 className="text-2xl font-semibold text-[#003D7A] mb-4">3. User Responsibilities</h2>
            <p className="text-gray-700 mb-3">You agree to:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Provide accurate, current, and complete information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Use the platform only for legitimate business purposes</li>
              <li>Comply with all applicable laws and regulations</li>
              <li>Not attempt to circumvent security measures</li>
              <li>Not upload malicious software or harmful content</li>
              <li>Respect intellectual property rights</li>
            </ul>
          </section>

          {/* Application Process */}
          <section>
            <h2 className="text-2xl font-semibold text-[#003D7A] mb-4">4. Application Process</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-[#003D7A] mb-2">Application Submission</h3>
                <p className="text-gray-700">
                  Submitting an application through our platform does not guarantee approval or funding. 
                  Final lending decisions are made by our partner lenders based on their own criteria.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-[#003D7A] mb-2">Document Requirements</h3>
                <p className="text-gray-700">
                  You may be required to provide additional documentation during the application process. 
                  All documents must be accurate and authentic.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-[#003D7A] mb-2">E-Signature</h3>
                <p className="text-gray-700">
                  Electronic signatures provided through our platform have the same legal effect as 
                  handwritten signatures under applicable electronic signature laws.
                </p>
              </div>
            </div>
          </section>

          {/* Privacy and Data */}
          <section>
            <h2 className="text-2xl font-semibold text-[#003D7A] mb-4">5. Privacy and Data Protection</h2>
            <p className="text-gray-700">
              Your privacy is important to us. Please review our{" "}
              <Link href="/privacy-policy" className="text-[#FF8C00] hover:underline font-medium">
                Privacy Policy
              </Link>
              {" "}to understand how we collect, use, and protect your information. By using our service, 
              you consent to the data practices described in our Privacy Policy.
            </p>
          </section>

          {/* Intellectual Property */}
          <section>
            <h2 className="text-2xl font-semibold text-[#003D7A] mb-4">6. Intellectual Property</h2>
            <p className="text-gray-700">
              The platform and its original content, features, and functionality are owned by Boreal Financial 
              and are protected by international copyright, trademark, patent, trade secret, and other 
              intellectual property laws.
            </p>
          </section>

          {/* Disclaimers */}
          <section>
            <h2 className="text-2xl font-semibold text-[#003D7A] mb-4">7. Disclaimers</h2>
            <div className="space-y-3">
              <p className="text-gray-700">
                <strong>No Financial Advice:</strong> We do not provide financial, investment, or legal advice. 
                All information provided is for general informational purposes only.
              </p>
              <p className="text-gray-700">
                <strong>Third-Party Services:</strong> We are not responsible for the actions or decisions 
                of our lending partners or other third-party service providers.
              </p>
              <p className="text-gray-700">
                <strong>Service Availability:</strong> We strive to maintain continuous service availability 
                but do not guarantee uninterrupted access to our platform.
              </p>
            </div>
          </section>

          {/* Limitation of Liability */}
          <section>
            <h2 className="text-2xl font-semibold text-[#003D7A] mb-4">8. Limitation of Liability</h2>
            <p className="text-gray-700">
              To the fullest extent permitted by law, Boreal Financial shall not be liable for any indirect, 
              incidental, special, consequential, or punitive damages, including without limitation, loss of 
              profits, data, use, goodwill, or other intangible losses.
            </p>
          </section>

          {/* Termination */}
          <section>
            <h2 className="text-2xl font-semibold text-[#003D7A] mb-4">9. Termination</h2>
            <p className="text-gray-700">
              We may terminate or suspend your account and access to our service immediately, without prior 
              notice or liability, for any reason, including if you breach these Terms of Service.
            </p>
          </section>

          {/* Governing Law */}
          <section>
            <h2 className="text-2xl font-semibold text-[#003D7A] mb-4">10. Governing Law</h2>
            <p className="text-gray-700">
              These Terms shall be interpreted and governed by the laws of Canada and the United States, 
              depending on your jurisdiction, without regard to conflict of law provisions.
            </p>
          </section>

          {/* Contact Information */}
          <section>
            <h2 className="text-2xl font-semibold text-[#003D7A] mb-4">11. Contact Information</h2>
            <p className="text-gray-700 mb-3">
              If you have any questions about these Terms of Service, please contact us:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700"><strong>Email:</strong> legal@boreal.financial</p>
              <p className="text-gray-700"><strong>Phone:</strong> (825) 451‑1768</p>
              <p className="text-gray-700"><strong>Address:</strong> Boreal Financial Legal Department</p>
            </div>
          </section>

          {/* Updates */}
          <section>
            <h2 className="text-2xl font-semibold text-[#003D7A] mb-4">12. Changes to Terms</h2>
            <p className="text-gray-700">
              We reserve the right to modify or replace these Terms at any time. If a revision is material, 
              we will provide at least 30 days notice prior to any new terms taking effect.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}