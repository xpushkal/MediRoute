export default function ConfidenceGauge({ score, label }: { score: number, label?: string }) {
  const percentage = Math.round(score * 100);

  // Color bands per PRD §6.2
  let color = "text-green-500";        // 0.8-1.0: High
  let bgColor = "text-green-500/20";
  if (score < 0.8) { color = "text-primary"; bgColor = "text-primary/20"; }      // 0.6-0.79: Moderate
  if (score < 0.6) { color = "text-orange-500"; bgColor = "text-orange-500/20"; } // 0.4-0.59: Low
  if (score < 0.4) { color = "text-red-500"; bgColor = "text-red-500/20"; }       // <0.4: Very Low

  return (
    <div className="flex items-center gap-3">
      <div className="relative w-10 h-10 flex items-center justify-center">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
          <path
            className={bgColor}
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
