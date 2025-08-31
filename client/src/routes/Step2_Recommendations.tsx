import { useFormData } from '@/context/FormDataContext';
import { useLocation } from 'wouter';
import { StepHeader } from '@/components/StepHeader';
import CategoryMode from '@/features/step2/CategoryMode';
import { Button } from '@/components/ui/button';

export default function Step2Recommendations() {
  const { data: contextData } = useFormData();
  const [, setLocation] = useLocation();

  const handleContinue = () => {
    setLocation('/step3');
  };

  const handleBack = () => {
    setLocation('/step1');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        <StepHeader
          stepNumber={2}
          totalSteps={7}
          title="Choose Product Categories"
          description="Select the types of financing you're interested in"
        />

        <div className="max-w-4xl mx-auto mt-8">
          <CategoryMode />
          
          <div className="flex justify-between mt-8">
            <Button variant="outline" onClick={handleBack}>
              Previous
            </Button>
            <Button onClick={handleContinue}>
              Continue
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}