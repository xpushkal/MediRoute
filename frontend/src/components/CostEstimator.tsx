"use client";

import { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import ConfidenceGauge from "./ConfidenceGauge";

interface CostComponent {
  label: string;
  range: string;
}

interface CostEstimatorProps {
  totalRange: string;
  components: CostComponent[];
  confidence: number;
  riskFlags?: string[];
}

export default function CostEstimator({ totalRange, components, confidence, riskFlags = [] }: CostEstimatorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // Confidence level label per PRD §6.2
  const confidenceLabel = confidence >= 0.8
    ? "High — reliable for planning"
    : confidence >= 0.6
      ? "Moderate — actual costs may vary 20-30%"
      : confidence >= 0.4
        ? "Low — rough guide only"
        : "Very Low — verify with hospital";

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

          {/* Confidence interpretation per PRD §6.2 */}
          <div className="mt-6 p-4 rounded-2xl bg-primary/5 border border-primary/10 flex gap-3">
            <svg className="w-5 h-5 text-primary shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-foreground/80">
                Confidence: {Math.round(confidence * 100)}% — {confidenceLabel}
              </p>
            </div>
          </div>

          {/* Risk flags — only show if present (was hardcoded before) */}
          {riskFlags.length > 0 && (
            <div className="mt-4 p-4 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex gap-3">
              <svg className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div className="space-y-1">
                {riskFlags.map((flag, i) => (
                  <p key={i} className="text-sm text-orange-800/80 font-medium">{flag}</p>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
