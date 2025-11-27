import { ApplicationLayout, WizardWrapper } from "../../../components/application";

const Step5 = () => {
  return (
    <ApplicationLayout title="Financial Documents">
      <WizardWrapper stepNumber={5} totalSteps={7}>
        <p>Step 5 placeholder</p>
      </WizardWrapper>
    </ApplicationLayout>
  );
};

export default Step5;
