type ProgressPillProps = {
  value: number;
};

export function ProgressPill({ value }: ProgressPillProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  let color = "bg-borealLightBlue text-borealBlue";

  if (clamped < 50) {
    color = "bg-slate-100 text-slate-600";
  } else if (clamped < 75) {
    color = "bg-borealLightBlue text-borealBlue";
  }

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${color}`}
    >
      {clamped}% match
    </span>
  );
}
