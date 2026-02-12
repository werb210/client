export function resolveStepGuard(
  currentStep: number | undefined,
  targetStep: number
) {
  const current = Math.min(6, Math.max(1, Number(currentStep) || 1));
  const target = Math.min(6, Math.max(1, Number(targetStep) || 1));
  if (target > current + 1) {
    return { allowed: false, redirectStep: current };
  }

  return { allowed: true, redirectStep: target };
}
