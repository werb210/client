import { useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useApplicationStore } from "../state/useApplicationStore";
import { StepHeader } from "../components/StepHeader";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { WizardLayout } from "../components/WizardLayout";
import { theme } from "../styles/theme";
import { getEligibilityResult } from "../lender/eligibility";
import { ProductSync } from "../lender/productSync";

export function Step2_Product() {
  const { app, update } = useApplicationStore();
  const navigate = useNavigate();
  const products = useMemo(() => ProductSync.load(), []);

  const eligibility = useMemo(
    () =>
      getEligibilityResult(
        products,
        {
          fundingIntent: app.kyc.lookingFor,
          amountRequested: app.kyc.fundingAmount,
          businessLocation: app.kyc.businessLocation,
          accountsReceivableBalance: app.kyc.accountsReceivable,
        },
        app.matchPercentages
      ),
    [
      app.kyc.accountsReceivable,
      app.kyc.businessLocation,
      app.kyc.fundingAmount,
      app.kyc.lookingFor,
      app.matchPercentages,
      products,
    ]
  );

  const categories = eligibility.categories;
  const eligibilitySnapshot = useMemo(
    () =>
      JSON.stringify({
        eligibleProducts: eligibility.eligibleProducts,
        eligibleCategories: eligibility.categories,
        eligibilityReasons: eligibility.reasons,
      }),
    [eligibility]
  );

  const previousInputs = useRef({
    lookingFor: app.kyc.lookingFor,
    fundingAmount: app.kyc.fundingAmount,
    businessLocation: app.kyc.businessLocation,
    accountsReceivable: app.kyc.accountsReceivable,
  });

  useEffect(() => {
    if (app.currentStep !== 2) {
      update({ currentStep: 2 });
    }
  }, [app.currentStep, update]);

  useEffect(() => {
    if (eligibilitySnapshot) {
      const currentSnapshot = JSON.stringify({
        eligibleProducts: app.eligibleProducts,
        eligibleCategories: app.eligibleCategories,
        eligibilityReasons: app.eligibilityReasons,
      });
      if (currentSnapshot !== eligibilitySnapshot) {
        update({
          eligibleProducts: eligibility.eligibleProducts,
          eligibleCategories: eligibility.categories,
          eligibilityReasons: eligibility.reasons,
        });
      }
    }
  }, [
    app.eligibleCategories,
    app.eligibleProducts,
    app.eligibilityReasons,
    eligibility,
    eligibilitySnapshot,
    update,
  ]);

  useEffect(() => {
    const currentInputs = {
      lookingFor: app.kyc.lookingFor,
      fundingAmount: app.kyc.fundingAmount,
      businessLocation: app.kyc.businessLocation,
      accountsReceivable: app.kyc.accountsReceivable,
    };
    const changed = Object.keys(currentInputs).some(
      (key) =>
        currentInputs[key as keyof typeof currentInputs] !==
        previousInputs.current[key as keyof typeof currentInputs]
    );

    if (changed && app.productCategory) {
      update({ productCategory: null });
    }

    previousInputs.current = currentInputs;
  }, [
    app.kyc.accountsReceivable,
    app.kyc.businessLocation,
    app.kyc.fundingAmount,
    app.kyc.lookingFor,
    app.productCategory,
    update,
  ]);

  useEffect(() => {
    const current = categories.find(
      (category) => category.name === app.productCategory
    );
    if (app.productCategory && !current) {
      update({ productCategory: null });
      return;
    }

    if (categories.length === 1) {
      const onlyOption = categories[0].name;
      if (app.productCategory !== onlyOption) {
        update({ productCategory: onlyOption });
      }
    }
  }, [app.productCategory, categories, update]);

  function select(name: string) {
    update({ productCategory: name });
  }

  function goBack() {
    navigate("/apply/step-1");
  }

  function goNext() {
    if (!app.productCategory) return;
    navigate("/apply/step-3");
  }

  return (
    <WizardLayout>
      <StepHeader step={2} title="Choose Product Category" />

      <Card className="space-y-4">
        <div className="space-y-4">
          {categories.map((category) => {
            const isSelected = app.productCategory === category.name;
            return (
              <Card
                key={category.name}
                onClick={() => select(category.name)}
                style={{
                  borderColor: isSelected
                    ? "#22c55e"
                    : theme.colors.border,
                  boxShadow: isSelected
                    ? "0 0 0 2px rgba(34, 197, 94, 0.24)"
                    : "0 4px 16px rgba(15, 23, 42, 0.08)",
                  cursor: "pointer",
                  background: isSelected ? "rgba(34, 197, 94, 0.08)" : "white",
                }}
              >
                <div className="flex flex-col gap-3">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div
                        style={{
                          fontSize: theme.typography.h2.fontSize,
                          fontWeight: theme.typography.h2.fontWeight,
                          color: theme.colors.textPrimary,
                        }}
                      >
                        {category.name}
                      </div>
                      {isSelected && (
                        <span
                          style={{
                            padding: "6px 12px",
                            borderRadius: "999px",
                            fontSize: "12px",
                            fontWeight: 600,
                            background: "rgba(34, 197, 94, 0.12)",
                            color: "#15803d",
                            border: "1px solid rgba(34, 197, 94, 0.35)",
                          }}
                        >
                          Selected
                        </span>
                      )}
                    </div>
                    <p
                      style={{
                        fontSize: "14px",
                        color: theme.colors.textSecondary,
                      }}
                    >
                      {category.productCount} products available (Match score{" "}
                      {category.matchScore}%)
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        borderRadius: "999px",
                        padding: "6px 12px",
                        fontSize: "12px",
                        fontWeight: 600,
                        background: "rgba(15, 23, 42, 0.06)",
                        color: theme.colors.textSecondary,
                      }}
                    >
                      {category.matchScore}% Match
                    </span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </Card>

      <div
        className="flex flex-col sm:flex-row gap-3"
        style={{ marginTop: theme.spacing.lg }}
      >
        <Button
          variant="secondary"
          style={{ width: "100%", maxWidth: "160px" }}
          onClick={goBack}
        >
          ← Back
        </Button>
        <Button
          style={{ width: "100%", maxWidth: "200px" }}
          onClick={goNext}
          disabled={!app.productCategory}
        >
          Continue →
        </Button>
      </div>
    </WizardLayout>
  );
}

export default Step2_Product;
