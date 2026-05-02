"use client";

import { useEffect, useRef, useState } from "react";
import SmoothScroll from "@/components/SmoothScroll";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useJourneyStore } from "@/store/useJourneyStore";

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const router = useRouter();
  const [inputValue, setInputValue] = useState("");
  const heroRef = useRef<HTMLDivElement>(null);
  const textRefs = useRef<(HTMLHeadingElement | null)[]>([]);
  const featureRefs = useRef<(HTMLDivElement | null)[]>([]);
  const setQuery = useJourneyStore((s) => s.setQuery);

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      setQuery(inputValue.trim());
      router.push("/navigator");
    }
  };

  useEffect(() => {
    // Reveal animation for the hero text
    const ctx = gsap.context(() => {
      gsap.fromTo(
        textRefs.current,
        { y: 150, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.4, stagger: 0.15, ease: "power4.out", delay: 0.2 }
      );

      // Scroll animation for features
      featureRefs.current.forEach((el, index) => {
        gsap.fromTo(
          el,
          { y: 100, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1.2,
            ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          }
        );
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <SmoothScroll>
      <main className="flex flex-col min-h-screen bg-background text-foreground selection:bg-primary/20" ref={heroRef}>
        {/* Navigation */}
        <nav className="flex items-center justify-between px-8 py-8 max-w-7xl mx-auto w-full absolute top-0 left-0 right-0 z-50">
          <div className="text-xl font-medium tracking-tight text-primary">MediRoute</div>
          <button className="text-sm font-medium hover:text-primary transition-colors">Menu</button>
        </nav>

        {/* Hero Section */}
        <section className="flex flex-col items-center justify-center min-h-screen px-6 pt-20 relative overflow-hidden">
          <div className="max-w-5xl mx-auto text-center z-10 flex flex-col items-center w-full">
            <div className="overflow-hidden mb-2">
              <h1 
                ref={(el) => { textRefs.current[0] = el; }}
                className="text-6xl md:text-[7rem] leading-none font-medium tracking-tight text-foreground"
              >
                Your Compass
              </h1>
            </div>
            <div className="overflow-hidden mb-10">
              <h1 
                ref={(el) => { textRefs.current[1] = el; }}
                className="text-6xl md:text-[7rem] leading-none font-medium tracking-tight text-foreground"
              >
                for Healthcare.
              </h1>
            </div>
            
            <div className="overflow-hidden max-w-2xl mb-16">
              <p 
                ref={(el) => { textRefs.current[2] = el as any; }}
                className="text-xl md:text-2xl text-foreground/70 font-light leading-relaxed"
              >
                Describe your symptoms. Discover the right clinical pathway, trusted providers, and realistic cost estimates—instantly.
              </p>
            </div>

            {/* Intake Input */}
            <form 
              onSubmit={handleAnalyze}
              ref={(el) => { textRefs.current[3] = el as any; }}
              className="w-full max-w-3xl relative group"
            >
              <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                <svg className="w-6 h-6 text-primary/60 transition-colors group-focus-within:text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input 
                type="text" 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="E.g., I have sharp pain in my left knee when walking..." 
                className="w-full pl-16 pr-40 py-6 rounded-full bg-surface border-2 border-foreground/5 text-xl shadow-lg shadow-primary/5 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all duration-300"
              />
              <button type="submit" className="absolute inset-y-3 right-3 bg-primary text-white px-8 rounded-full font-medium text-lg hover:bg-primary/90 transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center">
                Analyze
              </button>
            </form>
            
            <div 
              ref={(el) => { textRefs.current[4] = el as any; }}
              className="mt-8 text-sm text-foreground/40"
            >
              Strictly for decision-support. Not a medical diagnosis.
            </div>
          </div>
          
          {/* Subtle Parallax Background Shapes */}
          <div className="absolute top-1/4 left-0 w-[40rem] h-[40rem] bg-secondary/10 rounded-full blur-[100px] -z-10 pointer-events-none" />
          <div className="absolute bottom-1/4 right-0 w-[30rem] h-[30rem] bg-primary/5 rounded-full blur-[80px] -z-10 pointer-events-none" />
        </section>

        {/* Explanation Section */}
        <section className="py-40 px-6 bg-surface relative z-10 border-t border-foreground/5">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-20">
            {[
              {
                title: "Clinical Clarity",
                desc: "We translate your symptoms into standard clinical pathways, helping you understand your condition without diagnostic claims.",
                icon: (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                )
              },
              {
                title: "Provider Intelligence",
                desc: "Discover ranked hospitals based on transparent criteria: clinical capability, reputation, and verified accreditations.",
                icon: (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                )
              },
              {
                title: "Cost Transparency",
                desc: "Get realistic, component-level cost ranges adjusted for your location, age, and existing medical conditions.",
                icon: (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                )
              }
            ].map((feature, i) => (
              <div 
                key={i} 
                ref={(el) => { featureRefs.current[i] = el; }}
                className="flex flex-col items-start text-left group cursor-pointer"
              >
                <div className="w-16 h-16 rounded-2xl bg-background border border-foreground/5 text-primary flex items-center justify-center mb-8 group-hover:bg-primary group-hover:text-white transition-all duration-500 ease-out">
                  {feature.icon}
                </div>
                <h3 className="text-3xl font-medium text-foreground mb-4">{feature.title}</h3>
                <p className="text-foreground/60 text-lg leading-relaxed font-light">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </SmoothScroll>
  );
}
