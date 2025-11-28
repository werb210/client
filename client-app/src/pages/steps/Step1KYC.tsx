import { useState, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { StepLayout } from "../../components/steps/StepLayout";
import { useApplication } from "../../hooks/useApplication";

type Step1Values = {
  businessType: string;
  industry: string;
  revenue: string;
  timeInBusiness: string;
  location: string;
};

export default function Step1KYC() {
  const navigate = useNavigate();
  const { save } = useApplication();

  const [values, setValues] = useState<Step1Values>({
    businessType: "",
    industry: "",
    revenue: "",
    timeInBusiness: "",
    location: "",
  });

  const onChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  async function handleNext() {
    await save(1, values);
    navigate("/apply/step-2");
  }

  return (
    <StepLayout
      title="About Your Business"
      subtitle="We use this information to find the best lenders for your needs."
      onNext={handleNext}
      nextDisabled={
        !values.businessType ||
        !values.industry ||
        !values.revenue ||
        !values.timeInBusiness ||
        !values.location
      }
    >
      <div className="step-form">
        <label className="step-label">Business Type</label>
        <select
          name="businessType"
          className="step-input"
          value={values.businessType}
          onChange={onChange}
        >
          <option value="">Select…</option>
          <option value="corporation">Corporation</option>
          <option value="sole-proprietor">Sole Proprietor</option>
          <option value="partnership">Partnership</option>
          <option value="llc">LLC</option>
        </select>

        <label className="step-label">Industry</label>
        <input
          className="step-input"
          name="industry"
          value={values.industry}
          onChange={onChange}
          placeholder="E.g. Construction, Retail, Consulting"
        />

        <label className="step-label">Annual Revenue</label>
        <select
          name="revenue"
          className="step-input"
          value={values.revenue}
          onChange={onChange}
        >
          <option value="">Select…</option>
          <option value="<100k">Under $100k</option>
          <option value="100k-250k">$100k – $250k</option>
          <option value="250k-500k">$250k – $500k</option>
          <option value="500k-1m">$500k – $1M</option>
          <option value="1m-2m">$1M – $2M</option>
          <option value=">2m">Over $2M</option>
        </select>

        <label className="step-label">Time in Business</label>
        <select
          name="timeInBusiness"
          className="step-input"
          value={values.timeInBusiness}
          onChange={onChange}
        >
          <option value="">Select…</option>
          <option value="<6mo">Under 6 months</option>
          <option value="6-12mo">6–12 months</option>
          <option value="1-2y">1–2 years</option>
          <option value="2-5y">2–5 years</option>
          <option value="5y+">Over 5 years</option>
        </select>

        <label className="step-label">Province</label>
        <select
          name="location"
          className="step-input"
          value={values.location}
          onChange={onChange}
        >
          <option value="">Select your province…</option>
          <option value="ON">Ontario</option>
          <option value="BC">British Columbia</option>
          <option value="AB">Alberta</option>
          <option value="SK">Saskatchewan</option>
          <option value="MB">Manitoba</option>
          <option value="QC">Quebec</option>
          <option value="NB">New Brunswick</option>
          <option value="NS">Nova Scotia</option>
          <option value="PEI">Prince Edward Island</option>
          <option value="NL">Newfoundland & Labrador</option>
        </select>
      </div>
    </StepLayout>
  );
}
