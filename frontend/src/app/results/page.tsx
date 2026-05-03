"use client";

import { useEffect, useRef, useState, lazy, Suspense } from "react";
import SmoothScroll from "@/components/SmoothScroll";
import gsap from "gsap";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ProviderCard from "@/components/ProviderCard";
import FilterPanel from "@/components/FilterPanel";
import { useJourneyStore, ProviderResult } from "@/store/useJourneyStore";

const ProviderMap = lazy(() => import("@/components/ProviderMap"));

export default function Results() {
  const router = useRouter();
  const headerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"list" | "map">("list");

  const { clinicalState, providers, setProviders, filters, setSelectedProvider } = useJourneyStore();

  // Redirect to navigator if no clinical context exists
  useEffect(() => {
    if (!clinicalState.location && clinicalState.symptoms.length === 0) {
      router.replace("/navigator");
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Stable dependency key to prevent over-fetching
  const fetchKey = JSON.stringify({
    loc: clinicalState.location,
    icd: clinicalState.icd10Code,
    proc: clinicalState.recommendedProcedure,
    symp: clinicalState.symptoms.length,
    filters,
  });

  // Fetch providers on mount / filter change
  useEffect(() => {
    if (!clinicalState.location && clinicalState.symptoms.length === 0) return;

    const city = clinicalState.location || "Pune";
    const condition = clinicalState.icd10Code || clinicalState.recommendedProcedure || "";

    const params = new URLSearchParams({ city, condition, maxDistance: String(filters.maxDistance) });
    filters.costTier.forEach((t) => params.append("tier", t));
    filters.accreditation.forEach((a) => params.append("accreditation", a));

    setLoading(true);
    fetch(`/api/providers?${params.toString()}`)
      .then((r) => {
        if (!r.ok) throw new Error(`Server error (${r.status})`);
        return r.json();
      })
      .then((data) => {
        if (data.providers) setProviders(data.providers);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [fetchKey]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!loading && headerRef.current) {
      gsap.fromTo(headerRef.current, { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: "power3.out" });
    }
    if (!loading && contentRef.current?.children) {
      gsap.fromTo(
        Array.from(contentRef.current.children),
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.08, ease: "power3.out", delay: 0.2 }
      );
    }
  }, [loading]);

  function handleSelectProvider(p: ProviderResult) {
    setSelectedProvider(p);
    router.push(`/cost-estimate/${p.id}`);
  }

  return (
    <SmoothScroll>
      <main className="min-h-screen bg-background text-foreground pb-24 selection:bg-primary/20">
        <nav className="flex items-center justify-between px-8 py-8 max-w-7xl mx-auto w-full">
          <Link href="/" className="text-xl font-medium tracking-tight text-primary hover:opacity-80 transition-opacity">MediRoute</Link>
          <div className="flex gap-4">
            <Link href="/navigator" className="text-sm font-medium hover:text-primary transition-colors">Back to Chat</Link>
            <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">Start Over</Link>
          </div>
        </nav>

        <header ref={headerRef} className="px-6 pt-12 pb-16 max-w-7xl mx-auto border-b border-foreground/5">
          {clinicalState.mappedCondition && (
            <div className="flex items-center gap-2 text-sm text-primary font-medium mb-6">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Clinical Pathway Identified
            </div>
          )}
          <h1 className="text-5xl md:text-7xl font-medium tracking-tight mb-6">
            {clinicalState.recommendedProcedure || clinicalState.mappedCondition || "Provider Search"}
          </h1>
          <p className="text-xl text-foreground/60 font-light max-w-3xl leading-relaxed">
            {clinicalState.mappedCondition
              ? `Based on your symptoms, the likely condition is ${clinicalState.mappedCondition}. Below are ranked providers${clinicalState.location ? ` in ${clinicalState.location}` : ""}.`
              : "Browse providers near you."}
          </p>
        </header>

        <div className="max-w-7xl mx-auto px-6 pt-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Filters */}
          <div className="lg:col-span-3">
            <FilterPanel />

            {/* View toggle */}
            <div className="mt-8 flex gap-2">
              <button
                onClick={() => setView("list")}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  view === "list" ? "bg-primary text-white" : "bg-surface border border-foreground/10 text-foreground/60"
                }`}
              >
                List
              </button>
              <button
                onClick={() => setView("map")}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  view === "map" ? "bg-primary text-white" : "bg-surface border border-foreground/10 text-foreground/60"
                }`}
              >
                Map
              </button>
            </div>
          </div>

          {/* Provider list / map */}
          <div ref={contentRef} className="lg:col-span-9 space-y-6">
            {loading ? (
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-48 rounded-3xl bg-surface border border-foreground/5 animate-pulse" />
                ))}
              </div>
            ) : providers.length === 0 ? (
              <div className="text-center py-20 text-foreground/50">
                <p className="text-lg">No providers found matching your criteria.</p>
                <p className="text-sm mt-2">Try adjusting your filters or location.</p>
              </div>
            ) : view === "map" ? (
              <Suspense fallback={<div className="h-[400px] rounded-2xl bg-surface animate-pulse" />}>
                <ProviderMap providers={providers} onSelectProvider={handleSelectProvider} />
              </Suspense>
            ) : (
              providers.map((p) => (
                <ProviderCard
                  key={p.id}
                  name={p.name}
                  distance={p.distance}
                  score={p.rankingScore}
                  tier={p.tier.toLowerCase() as "budget" | "mid" | "premium"}
                  estimate={p.costEstimate}
                  tags={p.strengths}
                  rating={p.rating}
                  reviewCount={p.reviewCount}
                  nabh={p.nabh}
                  jci={p.jci}
                  waitDays={p.waitDays}
                  onSelect={() => handleSelectProvider(p)}
                />
              ))
            )}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="max-w-7xl mx-auto px-6 mt-16 py-4 border-t border-foreground/5 text-xs text-foreground/40 text-center">
          Costs shown are estimates based on available data. Actual hospital bills may vary. Always consult the hospital directly.
        </div>
      </main>
    </SmoothScroll>
  );
}
