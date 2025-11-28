import { BusinessDetails, KycData, ProductCategory } from "../context/ApplicationContext";

export const getEligibleProducts = (
  kyc: KycData,
  businessDetails?: BusinessDetails
): ProductCategory[] => {
  const categories = new Set<ProductCategory>();

  if (kyc.timeInBusiness !== null && kyc.timeInBusiness < 6) {
    return ["start_up_loan"];
  }

  const hasInvoices = businessDetails?.issuesInvoices ?? false;
  const purchasingEquipment = businessDetails?.purchasingEquipment ?? false;

  if (kyc.monthlyRevenue !== null && kyc.monthlyRevenue < 8000) {
    categories.add("start_up_loan");
    if (hasInvoices) {
      categories.add("factoring");
    }
    if (purchasingEquipment) {
      categories.add("equipment_finance");
    }
    return Array.from(categories);
  }

  if (hasInvoices) {
    categories.add("factoring");
  }

  if (purchasingEquipment) {
    categories.add("equipment_finance");
  }

  if (
    kyc.monthlyRevenue !== null &&
    kyc.monthlyRevenue > 20000 &&
    kyc.timeInBusiness !== null &&
    kyc.timeInBusiness > 12
  ) {
    categories.add("loc");
    categories.add("term_loan");
  }

  return Array.from(categories);
};
