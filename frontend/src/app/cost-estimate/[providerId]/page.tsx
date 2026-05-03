"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import gsap from "gsap";
import SmoothScroll from "@/components/SmoothScroll";
import CostEstimator from "@/components/CostEstimator";
import ConfidenceGauge from "@/components/ConfidenceGauge";
import FinancingModal from "@/components/FinancingModal";
import { useJourneyStore } from "@/store/useJourneyStore";

interface CostData {
  provider: { id: string; name: string; tier: string; city: string };
  procedure: { name: string; icd10: string; category: string };
  estimate: {
    totalRange: string; totalMin: number; totalMax: number; confidence: number;
    components: { label: string; range: string; min: number; max: number }[];
    adjustments: string[]; riskFlags: string[];
  };
  disclaimer: string;
}

export default function CostEstimatePage() {
  const params = useParams();
  const providerId = params.providerId as string;
  const [data, setData] = useState<CostData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFinancing, setShowFinancing] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);

  const { clinicalState } = useJourneyStore();

  useEffect(() => {
    fetch("/api/cost-estimate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        providerId,
        procedureName: clinicalState.recommendedProcedure,
        icd10Code: clinicalState.icd10Code,
        comorbidities: clinicalState.comorbidities,
        age: clinicalState.age,
      }),
    })
      .then((r) => {
        if (!r.ok) throw new Error(`Server error (${r.status})`);
        return r.json();
      })
      .then(setData)
      .catch((e) => console.error("Cost estimate fetch failed:", e))
      .finally(() => setLoading(false));
  }, [providerId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!loading && headerRef.current) {
      gsap.fromTo(headerRef.current, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: "power3.out" });
    }
  }, [loading]);

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </main>
    );
  }

  if (!data || !data.estimate) {
    return (
      <main className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 text-foreground">
        <p className="text-xl">Could not load cost estimate.</p>
        <Link href="/results" className="text-primary hover:underline">Back to results</Link>
      </main>
    );
  }

  return (
    <SmoothScroll>
      <main className="min-h-screen bg-background text-foreground pb-24">
        <nav className="flex items-center justify-between px-8 py-8 max-w-5xl mx-auto w-full">
          <Link href="/" className="text-xl font-medium tracking-tight text-primary hover:opacity-80 transition-opacity">MediRoute</Link>
          <Link href="/results" className="text-sm font-medium hover:text-primary transition-colors">Back to Results</Link>
        </nav>

        <div ref={headerRef} className="max-w-5xl mx-auto px-6">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-sm text-foreground/40 mb-8">
            <Link href="/" className="hover:text-primary">Home</Link>
            <span>/</span>
            <Link href="/results" className="hover:text-primary">Results</Link>
            <span>/</span>
            <span className="text-foreground/70">{data.provider.name}</span>
          </div>

          {/* Provider + Procedure header */}
          <div className="mb-4">
            <h1 className="text-4xl md:text-6xl font-medium tracking-tight mb-3">{data.procedure.name}</h1>
            <p className="text-xl text-foreground/60 font-light">
              at <span className="text-foreground font-medium">{data.provider.name}</span>, {data.provider.city}
            </p>
          </div>

          {/* Cost estimate card */}
          <div className="mt-12">
            <CostEstimator
              totalRange={data.estimate.totalRange}
              confidence={data.estimate.confidence}
              components={data.estimate.components.map((c) => ({ label: c.label, range: c.range }))}
              riskFlags={data.estimate.riskFlags}
            />
          </div>

          {/* Adjustments applied */}
          {data.estimate.adjustments.length > 0 && (
            <div className="mt-8 p-6 bg-surface border border-foreground/5 rounded-3xl">
              <h3 className="text-sm font-medium text-foreground/50 uppercase tracking-wider mb-4">Adjustments Applied</h3>
              <ul className="space-y-2">
                {data.estimate.adjustments.map((a, i) => (
                  <li key={i} className="text-sm text-foreground/70 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full shrink-0" />
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Risk flags */}
          {data.estimate.riskFlags.length > 0 && (
            <div className="mt-6 p-5 rounded-2xl bg-orange-500/10 border border-orange-500/20">
              <h4 className="text-sm font-medium text-orange-700 mb-2">Risk Factors Identified</h4>
              {data.estimate.riskFlags.map((f, i) => (
                <p key={i} className="text-sm text-orange-800/80">{f}</p>
              ))}
            </div>
          )}

          {/* Financing CTA */}
          <div className="mt-10 p-8 bg-surface border border-foreground/5 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-medium mb-2">Need help financing this treatment?</h3>
              <p className="text-foreground/60 text-sm leading-relaxed">
                Pre-qualify for a healthcare loan instantly through our NBFC partners.
              </p>
            </div>
            <button
              onClick={() => setShowFinancing(true)}
              className="bg-primary text-white px-8 py-4 rounded-full font-medium hover:bg-primary/90 transition-colors shrink-0 cursor-pointer"
            >
              Check Loan Eligibility
            </button>
          </div>

          {/* Disclaimer */}
          <p className="mt-12 text-xs text-foreground/40 text-center">
            {data.disclaimer}
          </p>
        </div>

        {showFinancing && (
          <FinancingModal
            estimatedAmount={data.estimate.totalMax}
            totalRange={data.estimate.totalRange}
            onClose={() => setShowFinancing(false)}
          />
        )}
      </main>
    </SmoothScroll>
  );
}
