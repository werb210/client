import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { step6Schema, type ApplicationForm } from '@/types/forms';
import { Button } from '@/components/ui/button';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Shield, FileText, MessageCircle, Lock } from '@/lib/icons';

interface Step6Props {
  defaultValues?: Partial<ApplicationForm>;
  onSubmit: (data: Partial<ApplicationForm>) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export function Step6Consents({ defaultValues, onSubmit, onNext, onPrevious }: Step6Props) {
  const form = useForm<ApplicationForm>({
    resolver: zodResolver(step6Schema),
    defaultValues,
  });

  const handleSubmit = (data: Partial<ApplicationForm>) => {
    onSubmit(data);
    onNext();
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Consents & Authorization</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Please review and provide consent for communication and document processing
        </p>
      </div>

      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
          {/* Communication Consent */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-teal-600" />
                Communication Authorization
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  Why we need this consent
                </h3>
                <p className="text-blue-800 dark:text-blue-200 text-sm">
                  To process your application efficiently, we need permission to contact you via phone, email, 
                  and SMS regarding your application status, required documents, and funding decisions.
                </p>
              </div>

              <FormField
                control={form.control}
                name="communicationConsent"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-sm font-medium">
                        I consent to communication regarding my application
                      </FormLabel>
                      <FormDescription className="text-xs">
                        I authorize Boreal Financial and its partners to contact me via phone (including automated calls), 
                        email, and SMS at the contact information provided to discuss my application, funding options, 
                        and related services. I understand I can opt out at any time.
                      </FormDescription>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Document Maintenance Consent */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-teal-600" />
                Document Processing Authorization
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                  Document handling and storage
                </h3>
                <p className="text-green-800 dark:text-green-200 text-sm">
                  We need permission to collect, process, and securely store your financial documents and 
                  business information for underwriting and compliance purposes.
                </p>
              </div>

              <FormField
                control={form.control}
                name="documentMaintenanceConsent"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-sm font-medium">
                        I consent to document processing and maintenance
                      </FormLabel>
                      <FormDescription className="text-xs">
                        I authorize Boreal Financial to collect, process, store, and maintain all documents 
                        and information provided in this application for underwriting, compliance, and 
                        servicing purposes. I understand this information will be kept secure and confidential.
                      </FormDescription>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Privacy & Security Notice */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-teal-600" />
                Privacy & Security
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  Your information is protected
                </h3>
                <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                  <li className="flex items-start gap-2">
                    <Shield className="h-4 w-4 text-teal-600 mt-0.5 flex-shrink-0" />
                    <span>All data is encrypted in transit and at rest using industry-standard security protocols</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Shield className="h-4 w-4 text-teal-600 mt-0.5 flex-shrink-0" />
                    <span>We never share your personal information with unauthorized third parties</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Shield className="h-4 w-4 text-teal-600 mt-0.5 flex-shrink-0" />
                    <span>You can request to review, update, or delete your information at any time</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Shield className="h-4 w-4 text-teal-600 mt-0.5 flex-shrink-0" />
                    <span>Our privacy practices comply with applicable data protection regulations</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Form Validation Summary */}
          {Object.keys(form.formState.errors).length > 0 && (
            <Card className="border-red-200 dark:border-red-800">
              <CardContent className="pt-6">
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                  <h3 className="font-semibold text-red-900 dark:text-red-100 mb-2">
                    Required Consents Missing
                  </h3>
                  <p className="text-red-800 dark:text-red-200 text-sm">
                    Please provide all required consents to continue with your application. 
                    These authorizations are necessary to process your funding request.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={onPrevious}>
              Previous
            </Button>
            <Button type="submit" size="lg" className="bg-teal-600 hover:bg-teal-700">
              Continue to Signature
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}