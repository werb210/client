const TOTAL_STEPS = 6

export function resolveStepGuard(currentStep: number, targetStep: number) {
  const safeCurrent = Math.max(1, Math.min(TOTAL_STEPS, currentStep))
  const safeTarget = Math.max(1, Math.min(TOTAL_STEPS, targetStep))

  if (safeTarget > safeCurrent + 1) {
    return safeCurrent + 1
  }

  return safeTarget
}
