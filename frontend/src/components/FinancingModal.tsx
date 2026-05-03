"use client";

import { useState } from "react";

interface FinancingModalProps {
  estimatedAmount: number;
  totalRange: string;
  onClose: () => void;
}

export default function FinancingModal({ estimatedAmount, totalRange, onClose }: FinancingModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<"form" | "loading" | "success" | "review">("form");
  const [result, setResult] = useState<Record<string, string>>({});

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !phone) return;

    setStatus("loading");

    try {
      const res = await fetch("/api/v1/lenders/pre-qualify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": "medi-lender-demo-key-2025",
        },
        body: JSON.stringify({
          name, phone,
          estimatedAmount,
          costEstimate: { totalRange },
        }),
      });
      const data = await res.json();

      if (data.status === "PRE_QUALIFIED") {
        setStatus("success");
        setResult(data);
      } else {
        setStatus("review");
        setResult(data);
      }
    } catch {
      setStatus("review");
      setResult({ message: "Something went wrong. Please try again." });
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-foreground/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-surface rounded-3xl p-8 max-w-lg w-full mx-4 shadow-2xl">
        <button onClick={onClose} className="absolute top-6 right-6 text-foreground/40 hover:text-foreground transition-colors cursor-pointer">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {status === "form" && (
          <form onSubmit={handleSubmit}>
            <h2 className="text-2xl font-medium mb-2">Check Loan Eligibility</h2>
            <p className="text-sm text-foreground/60 mb-6">Estimated treatment cost: <span className="font-medium text-foreground">{totalRange}</span></p>

            <div className="space-y-4 mb-6">
              <div>
                <label className="text-sm text-foreground/60 block mb-1.5">Full Name</label>
                <input
                  value={name} onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-background border border-foreground/10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  required
                />
              </div>
              <div>
                <label className="text-sm text-foreground/60 block mb-1.5">Phone Number</label>
                <input
                  value={phone} onChange={(e) => setPhone(e.target.value)}
                  type="tel" pattern="[0-9]{10}"
                  className="w-full px-4 py-3 rounded-xl bg-background border border-foreground/10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  required
                />
              </div>
            </div>

            <label className="flex items-start gap-2 text-xs text-foreground/50 mb-6">
              <input type="checkbox" required className="mt-0.5 accent-primary" />
              I consent to sharing this estimate with our NBFC partner for pre-qualification purposes.
            </label>

            <button type="submit" className="w-full bg-primary text-white py-3.5 rounded-xl font-medium hover:bg-primary/90 transition-colors cursor-pointer">
              Check Eligibility
            </button>
          </form>
        )}

        {status === "loading" && (
          <div className="py-16 flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p className="text-sm text-foreground/60">Checking with our lending partners...</p>
          </div>
        )}

        {status === "success" && (
          <div className="py-8 text-center">
            <div className="w-16 h-16 bg-cta/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-cta" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-medium mb-2">Pre-Qualified</h3>
            <p className="text-foreground/60 text-sm mb-6">{result.message}</p>
            <button onClick={onClose} className="bg-primary text-white px-8 py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors cursor-pointer">
              Done
            </button>
          </div>
        )}

        {status === "review" && (
          <div className="py-8 text-center">
            <h3 className="text-xl font-medium mb-2">Manual Review Required</h3>
            <p className="text-foreground/60 text-sm mb-6">{result.message}</p>
            <button onClick={onClose} className="bg-foreground text-background px-8 py-3 rounded-xl font-medium hover:bg-foreground/90 transition-colors cursor-pointer">
              Close
            </button>
          </div>
        )}

        <p className="mt-4 text-[10px] text-foreground/30 text-center">
          Pre-qualification is not a guarantee of loan approval. Final approval subject to documentation.
        </p>
      </div>
    </div>
  );
}
