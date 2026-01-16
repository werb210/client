import { useMemo } from "react";
import { OfflineStore } from "../state/offline";
import {
  FUNDING_INTENT_CATEGORY_MAP,
  FUNDING_INTENT_LABELS,
  getAllowedCategories,
  normalizeFundingIntent,
} from "../constants/wizard";
import { DefaultDocLabels } from "../data/requiredDocs";

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

  function describeCategories(intent?: string) {
    const normalized = normalizeFundingIntent(intent);
    if (!normalized) return [];
    return FUNDING_INTENT_CATEGORY_MAP[normalized];
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
      const allowed = getAllowedCategories(state.kyc?.lookingFor);
      const visible =
        allowed.length > 0
          ? allowed.join(", ")
          : "no categories yet (select a funding intent in Step 1)";
      return `Step 2 is where you choose a product category. Based on ${intentLabel}, you should see: ${visible}.`;
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
    const allowed = describeCategories(state.kyc?.lookingFor);
    if (!allowed.length) {
      return "You haven't selected a funding intent in Step 1 yet, so no product categories are available.";
    }
    return `You selected ${intentLabel} in Step 1, so Step 2 shows only: ${allowed.join(
      ", "
    )}.`;
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
