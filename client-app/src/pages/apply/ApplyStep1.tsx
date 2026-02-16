import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { Button } from "../../components/ui/Button";
import { layout, components, tokens } from "@/styles";

type Step1Values = {
  fundingType: string;
  fundingAmount: string;
  businessLocation: string;
  industry: string;
  purpose: string;
  yearsInBusiness: string;
  annualRevenue: string;
  monthlyRevenue: string;
  arBalance: string;
  existingDebt: string;
};

export default function ApplyStep1() {
  const navigate = useNavigate();

  const [formValues, setFormValues] = useState<Step1Values>({
    fundingType: "",
    fundingAmount: "",
    businessLocation: "",
    industry: "",
    purpose: "",
    yearsInBusiness: "",
    annualRevenue: "",
    monthlyRevenue: "",
    arBalance: "",
    existingDebt: "",
  });

  function update(field: keyof Step1Values, value: string) {
    const updated = { ...formValues, [field]: value };
    setFormValues(updated);
    localStorage.setItem("step1", JSON.stringify(updated));
  }

  function submit() {
    navigate("/apply/step-2");
  }

  return (
    <div style={layout.page}>
      <div style={layout.centerColumn}>
        <Card>
          <div style={{ display: "flex", flexDirection: "column", gap: tokens.spacing.md }}>
            <h2 style={components.form.sectionTitle}>Step 1: Financial Profile</h2>

            <Select onChange={(e) => update("fundingType", e.target.value)}>
              <option value="">Select funding type</option>
              <option>Capital</option>
              <option>Equipment Financing</option>
              <option>Both Capital and Equipment</option>
            </Select>

            <Input
              placeholder="Funding amount"
              value={formValues.fundingAmount}
              onChange={(e) => update("fundingAmount", e.target.value)}
            />

            <Select onChange={(e) => update("businessLocation", e.target.value)}>
              <option value="">Business Location</option>
              <option>Canada</option>
              <option>United States</option>
              <option>Neither</option>
            </Select>

            <Select onChange={(e) => update("purpose", e.target.value)}>
              <option value="">Purpose of funds</option>
              <option>Working Capital</option>
              <option>Expansion</option>
              <option>Inventory</option>
              <option>Equipment</option>
              <option>Marketing</option>
              <option>Other</option>
            </Select>

            <Select onChange={(e) => update("yearsInBusiness", e.target.value)}>
              <option value="">Years in business</option>
              <option>Zero</option>
              <option>Under 1 Year</option>
              <option>1 to 3 Years</option>
              <option>Over 3 Years</option>
            </Select>

            <Select onChange={(e) => update("annualRevenue", e.target.value)}>
              <option value="">Annual revenue</option>
              <option>Zero to $150,000</option>
              <option>$150,001 to $500,000</option>
              <option>$500,001 to $1,000,000</option>
              <option>$1,000,001 to $3,000,000</option>
              <option>Over $3,000,000</option>
            </Select>

            <Select onChange={(e) => update("monthlyRevenue", e.target.value)}>
              <option value="">Average monthly revenue</option>
              <option>Under $10,000</option>
              <option>$10,001 to $30,000</option>
              <option>$30,001 to $100,000</option>
              <option>Over $100,000</option>
            </Select>

            <Select onChange={(e) => update("arBalance", e.target.value)}>
              <option value="">Account Receivables</option>
              <option>No Account Receivables</option>
              <option>Zero to $100,000</option>
              <option>$100,000 to $250,000</option>
              <option>$250,000 to $500,000</option>
              <option>$500,000 to $1,000,000</option>
              <option>$1,000,000 to $3,000,000</option>
              <option>Over $3,000,000</option>
            </Select>

            <Select onChange={(e) => update("existingDebt", e.target.value)}>
              <option value="">Existing Debt</option>
              <option>Zero</option>
              <option>Zero to $100,000</option>
              <option>$100,001 to $500,000</option>
              <option>$500,001 to $1,000,000</option>
              <option>$1,000,001 to $3,000,000</option>
              <option>Over $3,000,000</option>
            </Select>

            <Button onClick={submit}>Continue</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
