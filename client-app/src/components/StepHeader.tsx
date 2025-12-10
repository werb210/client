export function StepHeader({ step, title }: { step: number; title: string }) {
  return (
    <div className="mb-6">
      <div className="text-sm text-gray-500 mb-1">Step {step} of 6</div>
      <h1 className="text-2xl font-bold text-borealBlue">{title}</h1>
    </div>
  );
}
