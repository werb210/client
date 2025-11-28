import { CSSProperties, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import ApplicationLayout from "../components/application/ApplicationLayout";
import WizardWrapper from "../components/application/WizardWrapper";
import {
  ProductCategory,
  useApplication,
} from "../context/ApplicationContext";
import { getEligibleProducts } from "../utils/productRules";
import { wizardSteps } from "../routes/ApplicationWizard";

const productCopy: Record<
  ProductCategory,
  { title: string; description: string }
> = {
  loc: {
    title: "Line of Credit (LOC)",
    description: "Flexible funding you can draw as needed for working capital.",
  },
  term_loan: {
    title: "Working Capital Term Loan",
    description: "Lump sum with predictable payments for growth and operations.",
  },
  factoring: {
    title: "Invoice Factoring",
    description: "Get advances on your B2B invoices to improve cash flow.",
  },
  equipment_finance: {
    title: "Equipment Finance",
    description: "Financing tailored for purchasing or leasing equipment.",
  },
  start_up_loan: {
    title: "Start-Up Loan",
    description: "Funding options designed for businesses under a year old.",
  },
};

const tileStyles: CSSProperties = {
  border: "1px solid #d4d4d4",
  borderRadius: "12px",
  padding: "16px",
  background: "#fff",
  boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
  cursor: "pointer",
  transition: "transform 120ms ease, box-shadow 120ms ease",
};

const tileGridStyles: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: "16px",
};

const Step3_ProductCategory = () => {
  const navigate = useNavigate();
  const { applicationData, setSelectedProductCategory } = useApplication();
  const eligibleProducts = useMemo(
    () =>
      getEligibleProducts(applicationData.kyc, applicationData.businessDetails),
    [applicationData.businessDetails, applicationData.kyc]
  );

  const handleSelect = (category: ProductCategory) => {
    setSelectedProductCategory(category);
    navigate("/application/step-4");
  };

  const showEmptyState = eligibleProducts.length === 0;

  return (
    <ApplicationLayout title="Choose a product category">
      <WizardWrapper stepNumber={3} totalSteps={wizardSteps.length}>
        {showEmptyState ? (
          <div
            style={{
              padding: "16px",
              border: "1px solid #f0b2b2",
              background: "#fff5f5",
              borderRadius: "8px",
            }}
          >
            Based on your answers, no lenders are available. Please adjust your information.
          </div>
        ) : (
          <div style={tileGridStyles}>
            {eligibleProducts.map((category) => (
              <div
                key={category}
                role="button"
                onClick={() => handleSelect(category)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    handleSelect(category);
                  }
                }}
                tabIndex={0}
                style={tileStyles}
                aria-label={`Select ${productCopy[category].title}`}
              >
                <h3 style={{ marginTop: 0, marginBottom: "8px" }}>
                  {productCopy[category].title}
                </h3>
                <p style={{ margin: 0, color: "#555" }}>
                  {productCopy[category].description}
                </p>
              </div>
            ))}
          </div>
        )}
      </WizardWrapper>
    </ApplicationLayout>
  );
};

export default Step3_ProductCategory;
