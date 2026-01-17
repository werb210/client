import { useMemo } from "react";
import { OfflineStore } from "../state/offline";
import {
  FUNDING_INTENT_LABELS,
  normalizeFundingIntent,
} from "../constants/wizard";
import { DefaultDocLabels } from "../data/requiredDocs";
import { getEligibilityResult } from "../lender/eligibility";

export function useChatbot() {
  const staticSteps = useMemo(
    () => [
      { step: 1, title: "Financial Profile" },
      { step: 2, title: "Choose Product Category" },
      { step: 3, title: "Business Details" },
      { step: 4, title: "Applicant Details" },
      { step: 5, title: "Required Documents" },
      { step: 6, title: "Terms & Signature" },
    ],
    []
  );

  function getWizardSnapshot() {
    return OfflineStore.load() || {};
  }

  function describeIntent(intent?: string) {
    const normalized = normalizeFundingIntent(intent);
    if (!normalized) return "your selection from Step 1";
    return FUNDING_INTENT_LABELS[normalized];
  }

  function describeDocuments(state: any) {
    const uploaded = Object.keys(state.documents || {}).map(
      (doc) => DefaultDocLabels[doc] || doc
    );
    if (state.documentsDeferred) {
      return "You chose to upload documents later. You can return to Step 5 to upload required files.";
    }
    if (uploaded.length) {
      return `Uploaded so far: ${uploaded.join(", ")}. The required documents list appears in Step 5 (bank statements are always required).`;
    }
    return "Required documents are listed in Step 5. Bank statements for the last 6 months are always required.";
  }

  function handleStepQuestion(state: any, message: string) {
    if (!message.includes("step")) return "";
    if (message.includes("step 2") || message.includes("step two")) {
      const intentLabel = describeIntent(state.kyc?.lookingFor);
      const eligibility = getEligibilitySnapshot(state);
      const visible =
        eligibility.categories.length > 0
          ? eligibility.categories.map((category) => category.name).join(", ")
          : "no categories yet (update your Step 1 details)";
      return `Step 2 is where you choose a product category. Based on ${intentLabel} and your eligibility, you have ${eligibility.eligibleProducts.length} eligible products across: ${visible}.`;
    }
    const currentStep =
      typeof state.currentStep === "number"
        ? state.currentStep
        : "the current step";
    const stepList = staticSteps
      .map((step) => `Step ${step.step}: ${step.title}`)
      .join("; ");
    return `You are on ${currentStep}. The application steps are: ${stepList}.`;
  }

  function handleCategoryQuestion(state: any) {
    const intentLabel = describeIntent(state.kyc?.lookingFor);
    const eligibility = getEligibilitySnapshot(state);
    if (!eligibility.categories.length) {
      const reasons = formatReasonSummary(eligibility.reasons);
      return `No product categories are available yet based on ${intentLabel} and your Step 1 details. ${reasons}`;
    }
    const categories = eligibility.categories
      .map((category) => `${category.name} (${category.productCount})`)
      .join(", ");
    const reasons = formatReasonSummary(eligibility.reasons);
    return `Based on ${intentLabel} and your eligibility, Step 2 shows: ${categories}. ${reasons}`;
  }

  function getEligibilitySnapshot(state: any) {
    const storedProducts = Array.isArray(state.eligibleProducts)
      ? state.eligibleProducts
      : [];
    const storedCategories = Array.isArray(state.eligibleCategories)
      ? state.eligibleCategories
      : [];
    const storedReasons = Array.isArray(state.eligibilityReasons)
      ? state.eligibilityReasons
      : [];

    if (
      storedProducts.length > 0 ||
      storedCategories.length > 0 ||
      storedReasons.length > 0
    ) {
      return {
        eligibleProducts: storedProducts,
        categories: storedCategories,
        reasons: storedReasons,
      };
    }

    const products = state.lenderProducts || [];
    return getEligibilityResult(
      products,
      {
        fundingIntent: state.kyc?.lookingFor,
        amountRequested: state.kyc?.fundingAmount,
        businessLocation: state.kyc?.businessLocation,
        accountsReceivableBalance: state.kyc?.accountsReceivable,
      },
      state.matchPercentages || {}
    );
  }

  function formatReasonSummary(reasons: Array<{ reason: string; count: number }>) {
    if (!reasons.length) {
      return "No eligibility filters are excluding products right now.";
    }
    const summary = reasons
      .map((reason) => `${reason.reason} (${reason.count})`)
      .join(", ");
    return `Filters applied: ${summary}.`;
  }

  async function send(text: string) {
    const state = getWizardSnapshot();
    const message = text.toLowerCase();

    if (
      message.includes("document") ||
      message.includes("upload") ||
      message.includes("requirements")
    ) {
      return describeDocuments(state);
    }

    if (
      message.includes("why am i seeing") ||
      message.includes("why am i seeing this") ||
      message.includes("why am i seeing these") ||
      message.includes("why are these") ||
      message.includes("categories")
    ) {
      return handleCategoryQuestion(state);
    }

    const stepAnswer = handleStepQuestion(state, message);
    if (stepAnswer) return stepAnswer;

    return "I can explain each step, why product categories appear in Step 2, or what documents are required. Ask me about Step 2, categories, or document requirements.";
  }

  return { send };
}
