import { useState } from 'react';
import { logger } from '@/lib/utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useApplication } from '@/context/ApplicationContext';
import PenTool from 'lucide-react/dist/esm/icons/pen-tool';

const signatureSchema = z.object({
  termsAccepted: z.boolean().refine(val => val === true, {
    message: 'You must accept the terms and conditions to proceed',
  }),
});

type SignatureData = z.infer<typeof signatureSchema>;

interface SignatureStepProps {
  onNext: () => void;
  onBack: () => void;
}

export function SignatureStep({ onNext, onBack }: SignatureStepProps) {
  const { state, dispatch } = useApplication();
  const [isSigningInProgress, setIsSigningInProgress] = useState(false);
  
  const form = useForm<SignatureData>({
    resolver: zodResolver(signatureSchema),
    defaultValues: {
      termsAccepted: state.formData.signature?.termsAccepted || false,
    },
  });

  const onSubmit = (data: SignatureData) => {
    dispatch({
      type: 'UPDATE_FORM_DATA',
      payload: {
        section: 'signature',
        data: { ...data, signed: false },
      },
    });
    onNext();
  };

  const handleSignDocument = async () => {
    setIsSigningInProgress(true);
    
    // Staff backend handles e-signature integration
    // For now, we'll simulate the signing process
    try {
      // NOTE: E-signature service is handled by staff backend
      // 1. Create document from application data
      // 2. Send for signature
      // 3. Poll signature status
      
      // Simulated delay for signing process
      await new Promise(resolve => setTimeout(resolve, 2000)).catch(error => {
        logger.error('[SIGNATURE_STEP] Delay failed:', error);
      });
      
      dispatch({
        type: 'UPDATE_FORM_DATA',
        payload: {
          section: 'signature',
          data: { 
            termsAccepted: form.getValues('termsAccepted'),
            signed: true,
            signedAt: new Date().toISOString(),
          },
        },
      });

      setIsSigningInProgress(false);
    } catch (error) {
      logger.error('Signing failed:', error);
      setIsSigningInProgress(false);
    }
  };

  const applicationSummary = {
    businessName: state.formData.businessInfo?.legalName || 'N/A',
    requestedAmount: state.formData.businessInfo?.loanAmount || 0,
    productType: state.formData.selectedProduct || 'N/A',
    applicantName: state.formData.personalDetails?.name || 'N/A',
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Application Summary</CardTitle>
          <p className="text-sm text-gray-600">
            Please review your application details before signing.
          </p>
        </CardHeader>
        
        <CardContent>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Business Name:</span>
                <span className="ml-2 text-gray-900 font-medium">{applicationSummary.businessName}</span>
              </div>
              <div>
                <span className="text-gray-500">Requested Amount:</span>
                <span className="ml-2 text-gray-900 font-medium">
                  ${applicationSummary.requestedAmount.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Product Type:</span>
                <span className="ml-2 text-gray-900 font-medium">
                  {applicationSummary.productType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Applicant:</span>
                <span className="ml-2 text-gray-900 font-medium">{applicationSummary.applicantName}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Electronic Signature</CardTitle>
        </CardHeader>
        
        <CardContent>
          {!state.formData.signature?.signed ? (
            <>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-6">
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-lg mx-auto flex items-center justify-center">
                    <PenTool className="w-8 h-8 text-blue-500" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Digital Signature Required</h4>
                    <p className="text-gray-600 mb-4">
                      Please sign the application document to complete your submission
                    </p>
                    <Button
                      onClick={handleSignDocument}
                      disabled={!form.watch('termsAccepted') || isSigningInProgress}
                      className="bg-blue-500 hover:bg-blue-600"
                    >
                      {isSigningInProgress ? 'Signing...' : 'Sign Document'}
                    </Button>
                  </div>
                </div>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="termsAccepted"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm text-gray-700">
                            I agree to the{' '}
                            <a href="#" className="text-blue-500 hover:text-blue-600 underline">
                              Terms and Conditions
                            </a>{' '}
                            and authorize the processing of my application and credit check.
                          </FormLabel>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />

                  <div className="flex items-center justify-between">
                    <Button variant="outline" onClick={onBack}>
                      Back
                    </Button>
                    
                    <Button type="submit" className="bg-blue-500 hover:bg-blue-600">
                      Continue to Review
                    </Button>
                  </div>
                </form>
              </Form>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-lg mx-auto flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Document Signed Successfully</h4>
              <p className="text-gray-600 mb-4">
                Your application has been digitally signed and is ready for final review.
              </p>
              
              <div className="flex items-center justify-between">
                <Button variant="outline" onClick={onBack}>
                  Back
                </Button>
                
                <Button onClick={onNext} className="bg-blue-500 hover:bg-blue-600">
                  Continue to Review
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
