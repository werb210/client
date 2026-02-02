export function resolveStepGuard(
  currentStep: number | undefined,
  targetStep: number
) {
  const normalizedCurrent = Math.min(6, Math.max(1, Number(currentStep) || 1));
  const normalizedTarget = Math.min(6, Math.max(1, Number(targetStep) || 1));

  if (normalizedTarget <= normalizedCurrent + 1) {
    return { allowed: true, redirectStep: normalizedCurrent };
  }

  return { allowed: false, redirectStep: normalizedCurrent };
}
