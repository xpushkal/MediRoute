"use client";

import { useJourneyStore } from "@/store/useJourneyStore";

export default function FilterPanel() {
  const { filters, setFilters } = useJourneyStore();

  const tierOptions: { value: "BUDGET" | "MID" | "PREMIUM"; label: string }[] = [
    { value: "BUDGET", label: "₹ Budget" },
    { value: "MID", label: "₹₹ Mid" },
    { value: "PREMIUM", label: "₹₹₹ Premium" },
  ];

  function toggleTier(tier: "BUDGET" | "MID" | "PREMIUM") {
    const current = filters.costTier;
    const next = current.includes(tier)
      ? current.filter((t) => t !== tier)
      : [...current, tier];
    setFilters({ costTier: next });
  }

  function toggleAccreditation(acc: "NABH" | "JCI") {
    const current = filters.accreditation;
    const next = current.includes(acc)
      ? current.filter((a) => a !== acc)
      : [...current, acc];
    setFilters({ accreditation: next });
  }

  return (
    <div className="sticky top-24 space-y-8">
      <h3 className="text-lg font-medium text-foreground">Filters</h3>

      {/* Distance */}
      <div>
        <label className="text-sm text-foreground/60 block mb-3">
          Max Distance: <span className="font-medium text-foreground">{filters.maxDistance} km</span>
        </label>
        <input
          type="range"
          min={5}
          max={100}
          value={filters.maxDistance}
          onChange={(e) => setFilters({ maxDistance: Number(e.target.value) })}
          className="w-full accent-primary"
        />
      </div>

      {/* Cost Tier */}
      <div>
        <label className="text-sm text-foreground/60 block mb-3">Cost Tier</label>
        <div className="flex flex-wrap gap-2">
          {tierOptions.map((t) => (
            <button
              key={t.value}
              onClick={() => toggleTier(t.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-all cursor-pointer ${
                filters.costTier.includes(t.value)
                  ? "bg-primary text-white border-primary"
                  : "bg-surface text-foreground/60 border-foreground/10 hover:border-primary/30"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Accreditation */}
      <div>
        <label className="text-sm text-foreground/60 block mb-3">Accreditation</label>
        <div className="flex flex-wrap gap-2">
          {(["NABH", "JCI"] as const).map((acc) => (
            <button
              key={acc}
              onClick={() => toggleAccreditation(acc)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-all cursor-pointer ${
                filters.accreditation.includes(acc)
                  ? "bg-primary text-white border-primary"
                  : "bg-surface text-foreground/60 border-foreground/10 hover:border-primary/30"
              }`}
            >
              {acc}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
