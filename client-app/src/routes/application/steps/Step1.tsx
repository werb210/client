import { ApplicationLayout, WizardWrapper } from "../../../components/application";

const Step1 = () => {
  return (
    <ApplicationLayout title="Business Information">
      <WizardWrapper stepNumber={1} totalSteps={7}>
        <p>Step 1 placeholder</p>
      </WizardWrapper>
    </ApplicationLayout>
  );
};

export default Step1;
