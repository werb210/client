import { ApplicationLayout, WizardWrapper } from "../../../components/application";

const Step7 = () => {
  return (
    <ApplicationLayout title="Submit Application">
      <WizardWrapper stepNumber={7} totalSteps={7}>
        <p>Step 7 placeholder</p>
      </WizardWrapper>
    </ApplicationLayout>
  );
};

export default Step7;
