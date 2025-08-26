export type RawIntake = Record<string, any>;

export function normalizeIntake(raw: RawIntake) {
  const country =
    String(raw?.country ?? raw?.countryOffered ?? raw?.appCountry ?? '')
      .trim().toUpperCase() || undefined;

  const amountRaw = raw?.fundingAmount ?? raw?.desired_amount ?? raw?.amount;
  const amount = amountRaw == null ? undefined : Number(amountRaw);

  const purpose = raw?.lookingFor ?? raw?.fundPurpose ?? raw?.purpose;

  return { country, amount, purpose };
}