export function validateApplicationPayload(payload: any) {
  if (!payload) {
    throw new Error("Missing application payload");
  }

  if (!payload.applicant) {
    throw new Error("Missing applicant data");
  }

  if (!payload.business) {
    throw new Error("Missing business data");
  }

  if (!payload.fundingRequest) {
    throw new Error("Missing funding request");
  }

  return true;
}
