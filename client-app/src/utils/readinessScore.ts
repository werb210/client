export interface ReadinessInput {
  yearsInBusiness: number;
  annualRevenue: number;
  creditScore: number;
  industryRisk: "low" | "medium" | "high";
}

export function calculateReadinessScore(input: ReadinessInput): number {
  let score = 0;

  if (input.yearsInBusiness >= 3) score += 20;
  else if (input.yearsInBusiness >= 1) score += 10;

  if (input.annualRevenue >= 1_000_000) score += 25;
  else if (input.annualRevenue >= 250_000) score += 15;

  if (input.creditScore >= 700) score += 25;
  else if (input.creditScore >= 620) score += 15;

  if (input.industryRisk === "low") score += 20;
  if (input.industryRisk === "medium") score += 10;

  return Math.min(score, 100);
}
