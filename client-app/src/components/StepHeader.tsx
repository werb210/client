export function StepHeader({ step, title }: { step: number; title: string }) {
  const progress = Math.min(100, Math.max(0, Math.round((step / 6) * 100)));
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between text-sm text-slate-500 mb-2">
        <span>Step {step} of 6</span>
        <span>{progress}% complete</span>
      </div>
      <div className="h-2.5 w-full rounded-full bg-borealLightBlue/70 mb-3">
        <div
          className="h-2.5 rounded-full bg-borealBlue"
          style={{ width: `${progress}%` }}
        />
      </div>
      <h1 className="text-2xl font-semibold text-borealBlue">{title}</h1>
    </div>
  );
}
