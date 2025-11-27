import { ApplicationLayout, WizardWrapper } from "../../../components/application";

const Step2 = () => {
  return (
    <ApplicationLayout title="Use of Funds">
      <WizardWrapper stepNumber={2} totalSteps={7}>
        <p>Step 2 placeholder</p>
      </WizardWrapper>
    </ApplicationLayout>
  );
};

export default Step2;
