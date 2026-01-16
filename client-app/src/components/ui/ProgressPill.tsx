type ProgressPillProps = {
  value: number;
};

export function ProgressPill({ value }: ProgressPillProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  let color = "bg-emerald-100 text-emerald-700";

  if (clamped < 50) {
    color = "bg-amber-100 text-amber-700";
  } else if (clamped < 75) {
    color = "bg-sky-100 text-sky-700";
  }

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${color}`}
    >
      {clamped}% match
    </span>
  );
}
