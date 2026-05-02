export default function ConfidenceGauge({ score, label }: { score: number, label?: string }) {
  const percentage = Math.round(score * 100);
  let color = "text-primary";
  if (score < 0.5) color = "text-orange-500";
  if (score < 0.3) color = "text-red-500";

  return (
    <div className="flex items-center gap-3">
      <div className="relative w-10 h-10 flex items-center justify-center">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
          <path
            className="text-foreground/10"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
          />
          <path
            className={color}
            strokeDasharray={`${percentage}, 100`}
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute text-[10px] font-medium text-foreground">{percentage}%</span>
      </div>
      {label && <span className="text-sm font-medium text-foreground/70">{label}</span>}
    </div>
  );
}
