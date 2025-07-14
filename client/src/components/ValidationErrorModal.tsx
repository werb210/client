import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, X } from "lucide-react";

interface ValidationErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  missingFields: Record<string, string[]>;
}

export function ValidationErrorModal({ isOpen, onClose, missingFields }: ValidationErrorModalProps) {
  if (!isOpen) return null;

  const getStepName = (step: string) => {
    switch (step) {
      case 'step1': return 'Financial Profile';
      case 'step3': return 'Business Details'; 
      case 'step4': return 'Applicant Information';
      default: return step;
    }
  };

  const getFieldDisplayName = (field: string) => {
    const fieldMap: Record<string, string> = {
      requestedAmount: 'Funding Amount',
      use_of_funds: 'Purpose of Funds',
      legalName: 'Legal Business Name',
      businessName: 'Business Name',
      businessPhone: 'Business Phone',
      businessState: 'Business State/Province',
      firstName: 'First Name',
      lastName: 'Last Name',
      email: 'Email Address',
      phone: 'Phone Number',
      ownershipPercentage: 'Ownership Percentage',
      dob: 'Date of Birth',
      sin: 'SSN/SIN'
    };
    return fieldMap[field] || field;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg bg-white dark:bg-gray-800 border-red-200 dark:border-red-700">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <CardTitle className="text-red-700 dark:text-red-300">Missing Required Fields</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0 hover:bg-red-100 dark:hover:bg-red-900"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Please complete the following required fields before submitting your application:
          </p>
          
          {Object.entries(missingFields).map(([step, fields]) => (
            <div key={step} className="border-l-4 border-red-400 pl-4 py-2 bg-red-50 dark:bg-red-950 rounded-r">
              <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">
                {getStepName(step)}
              </h4>
              <ul className="space-y-1">
                {fields.map(field => (
                  <li key={field} className="flex items-center gap-2 text-sm text-red-700 dark:text-red-300">
                    <span className="text-red-500">•</span>
                    {getFieldDisplayName(field)}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          
          <div className="flex justify-end pt-4">
            <Button onClick={onClose} className="bg-red-600 hover:bg-red-700 text-white">
              Review and Complete Fields
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}