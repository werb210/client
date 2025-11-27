import { ApplicationLayout, WizardWrapper } from "../../../components/application";

const Step4 = () => {
  return (
    <ApplicationLayout title="Business Documents">
      <WizardWrapper stepNumber={4} totalSteps={7}>
        <p>Step 4 placeholder</p>
      </WizardWrapper>
    </ApplicationLayout>
  );
};

export default Step4;
