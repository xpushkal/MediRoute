interface ProviderProps {
  name: string;
  distance: number;
  score: number;
  tier: "budget" | "mid" | "premium";
  estimate: string;
  tags: string[];
}

export default function ProviderCard({ name, distance, score, tier, estimate, tags }: ProviderProps) {
  const tierSigns = { budget: "₹", mid: "₹₹", premium: "₹₹₹" };

  return (
    <div className="group border border-foreground/10 p-6 rounded-3xl bg-surface hover:border-primary/30 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-xl hover:-translate-y-1">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-medium text-foreground group-hover:text-primary transition-colors">{name}</h3>
          <p className="text-sm text-foreground/60 mt-1">{distance} km away • Tier: {tierSigns[tier]}</p>
        </div>
        <div className="flex flex-col items-end">
          <div className="text-2xl font-medium text-foreground">{score}</div>
          <div className="text-xs text-foreground/50 uppercase tracking-wider mt-1">Match Score</div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {tags.map((tag, i) => (
          <span key={i} className="px-3 py-1 bg-background rounded-full text-xs font-medium text-foreground/70 border border-foreground/5">
            {tag}
          </span>
        ))}
      </div>

      <div className="pt-4 border-t border-foreground/5 flex justify-between items-center">
        <div>
          <div className="text-xs text-foreground/50 uppercase tracking-wider mb-1">Est. Cost Range</div>
          <div className="text-lg font-medium text-foreground">{estimate}</div>
        </div>
        <button className="text-primary font-medium text-sm flex items-center gap-1 group-hover:underline">
          Select
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
