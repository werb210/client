import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import AlertCircle from 'lucide-react/dist/esm/icons/alert-circle';
import ShieldIcon from 'lucide-react/dist/esm/icons/shield';
import FileTextIcon from 'lucide-react/dist/esm/icons/file-text';
import UsersIcon from 'lucide-react/dist/esm/icons/users';

interface TypedSignatureProps {
  applicantName: string;
  businessName: string;
  onAuthorize: (authData: AuthorizationData) => void;
  isLoading?: boolean;
}

interface AuthorizationData {
  typedName: string;
  agreements: {
    creditCheck: boolean;
    dataSharing: boolean;
    termsAccepted: boolean;
    electronicSignature: boolean;
    accurateInformation: boolean;
  };
  timestamp: string;
  ipAddress?: string;
  userAgent: string;
}

export default function TypedSignature({ 
  applicantName, 
  businessName, 
  onAuthorize, 
  isLoading = false 
}: TypedSignatureProps) {
  const [typedName, setTypedName] = useState('');
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [agreements, setAgreements] = useState({
    creditCheck: false,
    dataSharing: false,
    termsAccepted: false,
    electronicSignature: false,
    accurateInformation: false
  });

  const allAgreementsChecked = Object.values(agreements).every(Boolean);
  const nameMatches = typedName.trim().toLowerCase() === applicantName.toLowerCase();
  const canAuthorize = allAgreementsChecked && nameMatches && hasScrolledToBottom;

  const handleAgreementChange = (key: keyof typeof agreements, checked: boolean) => {
    setAgreements(prev => ({ ...prev, [key]: checked }));
  };

  const handleAuthorize = () => {
    if (!canAuthorize) return;

    const authData: AuthorizationData = {
      typedName: typedName.trim(),
      agreements,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    };

    onAuthorize(authData);
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const isAtBottom = element.scrollHeight - element.scrollTop <= element.clientHeight + 10;
    console.log('🔍 [SCROLL] Scroll event:', {
      scrollHeight: element.scrollHeight,
      scrollTop: element.scrollTop,
      clientHeight: element.clientHeight,
      isAtBottom,
      hasScrolledToBottom
    });
    if (isAtBottom && !hasScrolledToBottom) {
      console.log('✅ [SCROLL] User has scrolled to bottom - enabling checkboxes');
      setHasScrolledToBottom(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Terms and Conditions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileTextIcon className="h-5 w-5" />
            Application Terms & Conditions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!hasScrolledToBottom && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center gap-2 text-amber-800">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Please scroll to the bottom of the terms to continue</span>
              </div>
            </div>
          )}
          <ScrollArea 
            className="h-96 w-full rounded border p-4"
            onScroll={handleScroll}
          >
            <div className="space-y-4 text-sm">
              <section>
                <h3 className="font-semibold text-base mb-2 flex items-center gap-2">
                  <ShieldIcon className="h-4 w-4" />
                  1. Application Authorization
                </h3>
                <p className="mb-2">
                  By submitting this loan application for <strong>{businessName}</strong>, you authorize 
                  Boreal Financial and its approved lending partners to:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Verify your identity and business information</li>
                  <li>Obtain credit reports from major credit bureaus</li>
                  <li>Contact you via phone, email, or mail regarding financing options</li>
                  <li>Share your application with qualified lenders in our network</li>
                  <li>Perform background checks as required by lending regulations</li>
                </ul>
              </section>

              <Separator />

              <section>
                <h3 className="font-semibold text-base mb-2 flex items-center gap-2">
                  <UsersIcon className="h-4 w-4" />
                  2. Information Accuracy & Certification
                </h3>
                <p className="mb-2">
                  You certify under penalty of perjury that:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>All information provided in this application is true, accurate, and complete</li>
                  <li>You have the authority to apply for financing on behalf of {businessName}</li>
                  <li>You understand that false statements may result in denial or prosecution</li>
                  <li>You will promptly notify us of any material changes to the information provided</li>
                </ul>
              </section>

              <Separator />

              <section>
                <h3 className="font-semibold text-base mb-2">3. Electronic Signature Consent</h3>
                <p className="mb-2">
                  You agree that your typed name below constitutes your electronic signature and has 
                  the same legal effect as a handwritten signature. This electronic signature:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Is legally binding under the Electronic Signatures in Global and National Commerce Act (E-SIGN)</li>
                  <li>Will be recorded with timestamp, IP address, and device information</li>
                  <li>Cannot be revoked once submitted unless permitted by applicable law</li>
                </ul>
              </section>

              <Separator />

              <section>
                <h3 className="font-semibold text-base mb-2">4. Credit Authorization</h3>
                <p className="mb-2">
                  You authorize us to obtain credit information about you and your business from:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Experian, Equifax, TransUnion, and other credit reporting agencies</li>
                  <li>Banks, financial institutions, and trade creditors</li>
                  <li>Government agencies and public records</li>
                  <li>Industry-specific reporting services</li>
                </ul>
              </section>

              <Separator />

              <section>
                <h3 className="font-semibold text-base mb-2">5. Data Sharing & Privacy</h3>
                <p className="mb-2">
                  Your information may be shared with:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Qualified lenders in our network for financing evaluation</li>
                  <li>Service providers who assist with application processing</li>
                  <li>Legal and regulatory authorities as required by law</li>
                </ul>
                <p className="mt-2">
                  We protect your data according to our Privacy Policy and applicable regulations.
                </p>
              </section>

              <Separator />

              <section>
                <h3 className="font-semibold text-base mb-2">6. Application Processing</h3>
                <p className="mb-2">
                  Please understand that:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Submission does not guarantee loan approval</li>
                  <li>Final terms depend on credit evaluation and lender requirements</li>
                  <li>Processing may take 1-5 business days</li>
                  <li>Additional documentation may be requested</li>
                </ul>
              </section>

              <div className="mt-6 p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-green-800">
                  ✅ You have reached the end of the terms and conditions. 
                  Please review the agreements below to proceed.
                </p>
              </div>
            </div>
          </ScrollArea>
          
          {!hasScrolledToBottom && (
            <p className="text-sm text-amber-600 mt-2 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              Please scroll to the bottom to read all terms
            </p>
          )}
        </CardContent>
      </Card>

      {/* Agreement Checkboxes */}
      <Card>
        <CardHeader>
          <CardTitle>Required Agreements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start space-x-2">
            <Checkbox
              id="creditCheck"
              checked={agreements.creditCheck}
              onCheckedChange={(checked) => handleAgreementChange('creditCheck', checked as boolean)}
              disabled={!hasScrolledToBottom}
            />
            <label htmlFor="creditCheck" className="text-sm leading-relaxed">
              I authorize credit checks and verification of my business and personal credit history
            </label>
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox
              id="dataSharing"
              checked={agreements.dataSharing}
              onCheckedChange={(checked) => handleAgreementChange('dataSharing', checked as boolean)}
              disabled={!hasScrolledToBottom}
            />
            <label htmlFor="dataSharing" className="text-sm leading-relaxed">
              I consent to sharing my application data with qualified lenders in the Boreal Financial network
            </label>
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox
              id="accurateInformation"
              checked={agreements.accurateInformation}
              onCheckedChange={(checked) => handleAgreementChange('accurateInformation', checked as boolean)}
              disabled={!hasScrolledToBottom}
            />
            <label htmlFor="accurateInformation" className="text-sm leading-relaxed">
              I certify that all information provided is true, accurate, and complete to the best of my knowledge
            </label>
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox
              id="termsAccepted"
              checked={agreements.termsAccepted}
              onCheckedChange={(checked) => handleAgreementChange('termsAccepted', checked as boolean)}
              disabled={!hasScrolledToBottom}
            />
            <label htmlFor="termsAccepted" className="text-sm leading-relaxed">
              I have read, understood, and accept all terms and conditions outlined above
            </label>
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox
              id="electronicSignature"
              checked={agreements.electronicSignature}
              onCheckedChange={(checked) => handleAgreementChange('electronicSignature', checked as boolean)}
              disabled={!hasScrolledToBottom}
            />
            <label htmlFor="electronicSignature" className="text-sm leading-relaxed">
              I agree to use electronic signature and understand it has the same legal effect as a handwritten signature
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Electronic Signature */}
      <Card>
        <CardHeader>
          <CardTitle>Electronic Signature</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label htmlFor="typedName" className="block text-sm font-medium mb-2">
              Type your full legal name exactly as: <strong>{applicantName}</strong>
            </label>
            <Input
              id="typedName"
              placeholder="Type your full legal name"
              value={typedName}
              onChange={(e) => setTypedName(e.target.value)}
              disabled={!allAgreementsChecked}
              className={nameMatches ? 'border-green-500' : ''}
            />
            {typedName && !nameMatches && (
              <p className="text-sm text-red-600 mt-1">
                Name must match exactly: {applicantName}
              </p>
            )}
            {nameMatches && (
              <p className="text-sm text-green-600 mt-1">
                ✅ Name matches
              </p>
            )}
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-700">
              By typing your name and clicking "Authorize Application" below, you are providing 
              your electronic signature with the same legal effect as a handwritten signature.
            </p>
            <p className="text-xs text-gray-500 mt-2">
              This authorization will be recorded with timestamp: {new Date().toLocaleString()}
            </p>
          </div>

          <Button
            onClick={handleAuthorize}
            disabled={!canAuthorize || isLoading}
            className="w-full h-12 text-lg"
            size="lg"
          >
            {isLoading ? 'Processing...' : 'Authorize Application'}
          </Button>

          {!canAuthorize && (
            <div className="text-sm text-gray-600 space-y-1">
              <p>To authorize, you must:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                {!hasScrolledToBottom && <li>Read all terms and conditions</li>}
                {!allAgreementsChecked && <li>Check all required agreements</li>}
                {!nameMatches && <li>Type your name exactly as shown</li>}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}