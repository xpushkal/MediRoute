interface ProviderProps {
  name: string;
  distance: number;
  score: number;
  tier: "budget" | "mid" | "premium";
  estimate: string;
  tags: string[];
  rating?: number;
  reviewCount?: number;
  nabh?: boolean;
  jci?: boolean;
  waitDays?: number;
  onSelect?: () => void;
}

export default function ProviderCard({
  name, distance, score, tier, estimate, tags, rating, reviewCount, nabh, jci, waitDays, onSelect
}: ProviderProps) {
  const tierConfig = {
    budget: { sign: "₹", label: "Budget", color: "text-green-600 bg-green-50 border-green-200" },
    mid: { sign: "₹₹", label: "Mid-Tier", color: "text-primary bg-primary/5 border-primary/20" },
    premium: { sign: "₹₹₹", label: "Premium", color: "text-purple-600 bg-purple-50 border-purple-200" },
  };

  const t = tierConfig[tier];

  return (
    <div className="group border border-foreground/10 p-6 rounded-3xl bg-surface hover:border-primary/30 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-xl hover:-translate-y-1">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-medium text-foreground group-hover:text-primary transition-colors">{name}</h3>
          <div className="flex items-center gap-3 mt-1.5 text-sm text-foreground/60">
            <span>{distance} km away</span>
            <span className={`px-2 py-0.5 rounded-md text-xs font-medium border ${t.color}`}>
              {t.sign} {t.label}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <div className="text-2xl font-medium text-foreground">{score}</div>
          <div className="text-xs text-foreground/50 uppercase tracking-wider mt-1">Match Score</div>
        </div>
      </div>

      {/* Rating + Accreditation badges */}
      <div className="flex items-center gap-3 mb-4">
        {rating !== undefined && (
          <div className="flex items-center gap-1 text-sm">
            <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="font-medium text-foreground">{rating}</span>
            {reviewCount !== undefined && <span className="text-foreground/40">({reviewCount.toLocaleString("en-IN")})</span>}
          </div>
        )}
        {nabh && (
          <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200">
            NABH
          </span>
        )}
        {jci && (
          <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            JCI
          </span>
        )}
        {waitDays !== undefined && (
          <span className="text-xs text-foreground/50">
            ~{waitDays}d wait
          </span>
        )}
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
        <button onClick={onSelect} className="text-primary font-medium text-sm flex items-center gap-1 group-hover:underline cursor-pointer">
          View Cost Details
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
