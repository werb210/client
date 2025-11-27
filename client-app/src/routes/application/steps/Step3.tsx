import { ApplicationLayout, WizardWrapper } from "../../../components/application";

const Step3 = () => {
  return (
    <ApplicationLayout title="Applicant Information">
      <WizardWrapper stepNumber={3} totalSteps={7}>
        <p>Step 3 placeholder</p>
      </WizardWrapper>
    </ApplicationLayout>
  );
};

export default Step3;
