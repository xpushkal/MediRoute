"use client";

import { useEffect, useRef } from "react";
import SmoothScroll from "@/components/SmoothScroll";
import gsap from "gsap";
import Link from "next/link";
import ProviderCard from "@/components/ProviderCard";
import CostEstimator from "@/components/CostEstimator";

export default function Results() {
  const headerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        headerRef.current,
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: "power3.out", delay: 0.1 }
      );
      
      gsap.fromTo(
        contentRef.current?.children ? Array.from(contentRef.current.children) : [],
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, stagger: 0.1, ease: "power3.out", delay: 0.3 }
      );
    });
    return () => ctx.revert();
  }, []);

  return (
    <SmoothScroll>
      <main className="min-h-screen bg-background text-foreground pb-24 selection:bg-primary/20">
        {/* Navigation */}
        <nav className="flex items-center justify-between px-8 py-8 max-w-7xl mx-auto w-full">
          <Link href="/" className="text-xl font-medium tracking-tight text-primary hover:opacity-80 transition-opacity">
            MediRoute
          </Link>
          <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">Start Over</Link>
        </nav>

        {/* Results Header */}
        <header ref={headerRef} className="px-6 pt-12 pb-20 max-w-7xl mx-auto border-b border-foreground/5">
          <div className="flex items-center gap-2 text-sm text-primary font-medium mb-6">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Clinical Pathway Identified
          </div>
          <h1 className="text-5xl md:text-7xl font-medium tracking-tight mb-6">Angioplasty.</h1>
          <p className="text-xl md:text-2xl text-foreground/60 font-light max-w-3xl leading-relaxed">
            Based on your symptoms, the most likely underlying condition is <span className="text-foreground font-medium">Coronary Artery Disease</span>. 
            Below are ranked providers and estimated costs in Pune.
          </p>
        </header>

        {/* Results Content */}
        <div ref={contentRef} className="max-w-7xl mx-auto px-6 pt-20 grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* Left Column: Cost Estimation */}
          <div className="lg:col-span-7">
            <h2 className="text-3xl font-medium mb-8 text-foreground">Treatment Cost</h2>
            <CostEstimator 
              totalRange="₹2,00,000 – ₹3,68,000"
              confidence={0.68}
              components={[
                { label: "Procedure / Surgery Cost", range: "₹1,20,000 – ₹2,00,000" },
                { label: "Hospital Stay (4–6 days)", range: "₹30,000 – ₹60,000" },
                { label: "Anaesthesia", range: "₹12,000 – ₹20,000" },
                { label: "Diagnostics (pre/post)", range: "₹8,000 – ₹18,000" },
                { label: "Medication", range: "₹15,000 – ₹30,000" },
                { label: "Complication Contingency", range: "₹15,000 – ₹40,000" },
              ]}
            />
            
            <div className="mt-8 p-6 bg-surface border border-foreground/5 rounded-3xl">
              <h3 className="text-lg font-medium mb-3">Looking for financing?</h3>
              <p className="text-foreground/60 text-sm mb-5 leading-relaxed">
                Pre-qualify for a healthcare loan instantly through our NBFC partners, using this structured estimate.
              </p>
              <button className="bg-foreground text-background px-6 py-3 rounded-full font-medium text-sm hover:bg-foreground/90 transition-colors">
                Check Eligibility
              </button>
            </div>
          </div>

          {/* Right Column: Providers */}
          <div className="lg:col-span-5">
            <h2 className="text-3xl font-medium mb-8 text-foreground">Top Providers</h2>
            <div className="space-y-6">
              <ProviderCard 
                name="ABC Heart Institute"
                distance={5.2}
                score={89}
                tier="mid"
                estimate="₹2.2L – ₹3.1L"
                tags={["High Cardiac Volume", "NABH Accredited"]}
              />
              <ProviderCard 
                name="Apollo Clinic, Viman Nagar"
                distance={8.4}
                score={82}
                tier="premium"
                estimate="₹2.8L – ₹4.0L"
                tags={["Premium Care", "JCI Accredited"]}
              />
              <ProviderCard 
                name="City Care Hospital"
                distance={3.1}
                score={74}
                tier="budget"
                estimate="₹1.5L – ₹2.2L"
                tags={["Budget-Friendly", "Available Next Day"]}
              />
            </div>
          </div>

        </div>
      </main>
    </SmoothScroll>
  );
}
