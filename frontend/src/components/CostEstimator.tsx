"use client";

import { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import ConfidenceGauge from "./ConfidenceGauge";

interface CostComponent {
  label: string;
  range: string;
}

export default function CostEstimator({ totalRange, components, confidence }: { totalRange: string, components: CostComponent[], confidence: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!contentRef.current) return;
    
    if (isOpen) {
      gsap.to(contentRef.current, { height: "auto", opacity: 1, duration: 0.5, ease: "power3.out" });
    } else {
      gsap.to(contentRef.current, { height: 0, opacity: 0, duration: 0.4, ease: "power3.inOut" });
    }
  }, [isOpen]);

  return (
    <div className="border border-foreground/10 rounded-3xl bg-surface overflow-hidden">
      <div 
        className="p-8 cursor-pointer flex justify-between items-center hover:bg-background/50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div>
          <div className="text-sm text-foreground/50 uppercase tracking-wider mb-2">Total Estimated Range</div>
          <div className="text-4xl font-medium text-foreground">{totalRange}</div>
        </div>
        <div className="flex items-center gap-6">
          <ConfidenceGauge score={confidence} label="Data Confidence" />
          <div className={`w-8 h-8 rounded-full border border-foreground/20 flex items-center justify-center transition-transform duration-500 ${isOpen ? "rotate-180" : ""}`}>
            <svg className="w-4 h-4 text-foreground/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      <div ref={contentRef} className="h-0 opacity-0 overflow-hidden px-8">
        <div className="pb-8 pt-4 border-t border-foreground/5">
          <h4 className="text-sm font-medium text-foreground mb-4">Component Breakdown</h4>
          <div className="space-y-4">
            {components.map((c, i) => (
              <div key={i} className="flex justify-between items-center">
                <span className="text-foreground/70">{c.label}</span>
                <span className="font-medium text-foreground">{c.range}</span>
              </div>
            ))}
          </div>
          <div className="mt-8 p-4 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex gap-3">
            <svg className="w-5 h-5 text-orange-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-orange-800/80 font-medium">
              Diabetes flag: Extended recovery likely — additional ₹15,000 – ₹25,000 contingency included.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
