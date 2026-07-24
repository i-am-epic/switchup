export function ProgressRing({
  percent,
  label,
}: {
  percent: number;
  label: string;
}) {
  const clamped = Math.max(0, Math.min(100, percent));
  const r = 52;
  const c = 2 * Math.PI * r;
  const offset = c - (clamped / 100) * c;

  return (
    <div className="relative flex h-40 w-40 items-center justify-center">
      <svg width="160" height="160" className="-rotate-90">
        <circle
          cx="80"
          cy="80"
          r={r}
          fill="none"
          stroke="rgba(44,36,27,0.08)"
          strokeWidth="14"
        />
        <circle
          cx="80"
          cy="80"
          r={r}
          fill="none"
          stroke="var(--matcha)"
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-3xl">{clamped}%</span>
        <span className="text-xs font-semibold text-ink-soft">{label}</span>
      </div>
    </div>
  );
}
