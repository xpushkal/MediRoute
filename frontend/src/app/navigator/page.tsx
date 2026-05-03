"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import gsap from "gsap";
import ChatBubble from "@/components/ChatBubble";
import QuickReply from "@/components/QuickReply";
import TypingIndicator from "@/components/TypingIndicator";
import { useJourneyStore, ChatMessage } from "@/store/useJourneyStore";

// Quick-reply options for common first queries
const STARTER_SUGGESTIONS = [
  "Chest pain when climbing stairs",
  "Knee replacement cost in Pune",
  "Best heart hospital in Delhi",
  "Cataract surgery options",
];

export default function Navigator() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    query, chatHistory, addMessage, clinicalState, setClinicalState, setQuery,
  } = useJourneyStore();

  // Seed first message on mount
  useEffect(() => {
    if (chatHistory.length === 0) {
      const welcome: ChatMessage = {
        id: "welcome",
        role: "assistant",
        content:
          "Hello, I'm MediRoute AI — your healthcare navigation assistant.\n\nI can help you understand your symptoms, find the right hospitals, and get realistic cost estimates.\n\nPlease describe what you're experiencing, or tell me about a procedure you're looking into.",
        quickReplies: STARTER_SUGGESTIONS,
        timestamp: Date.now(),
      };
      addMessage(welcome);

      // If user came from home page with a query, auto-send it
      if (query) {
        setTimeout(() => sendMessage(query), 500);
      }
    }

    // GSAP entrance
    if (containerRef.current) {
      gsap.fromTo(containerRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isLoading]);

  async function sendMessage(text: string) {
    if (!text.trim() || isLoading) return;
    setError(null);

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text.trim(),
      timestamp: Date.now(),
    };
    addMessage(userMsg);
    setInput("");
    setIsLoading(true);

    try {
      const messages = [...chatHistory, userMsg]
        .filter((m) => m.id !== "welcome") // Don't send welcome to LLM
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: "Network error" }));
        throw new Error(errData.error || `Server error (${res.status})`);
      }

      const data = await res.json();

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: data.message || "I couldn't process that. Could you try again?",
        timestamp: Date.now(),
      };
      addMessage(assistantMsg);

      // If clinical data was extracted
      if (data.clinicalData) {
        setClinicalState({
          symptoms: data.clinicalData.symptoms || [],
          age: data.clinicalData.age,
          gender: data.clinicalData.gender,
          comorbidities: data.clinicalData.comorbidities || [],
          location: data.clinicalData.location,
          mappedCondition: data.clinicalData.mapped_condition,
          icd10Code: data.clinicalData.icd10_code,
          recommendedProcedure: data.clinicalData.recommended_procedure,
          clinicalPathway: data.clinicalData.clinical_pathway || [],
          confidence: data.clinicalData.confidence || 0,
        });

        // Auto-transition to results when we have extraction with location
        if (data.clinicalData.confidence >= 0.6 && data.clinicalData.location) {
          // Add a transition message
          addMessage({
            id: `transition-${Date.now()}`,
            role: "assistant",
            content: `Finding hospitals near ${data.clinicalData.location} for ${data.clinicalData.mapped_condition || "your concern"} with cost comparisons...`,
            timestamp: Date.now(),
          });
          setTimeout(() => router.push("/results"), 1500);
        }
      }
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : "Something went wrong";
      setError(errMsg);
      addMessage({
        id: `error-${Date.now()}`,
        role: "assistant",
        content: errMsg.includes("API_KEY")
          ? "The AI service is not configured yet. Please add your OpenRouter API key to the .env file."
          : `Something went wrong: ${errMsg}. Please try again.`,
        timestamp: Date.now(),
      });
    } finally {
      setIsLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  // Find the last message with quickReplies that hasn't been answered
  const lastQuickReplyMsg = [...chatHistory].reverse().find(
    (m) => m.role === "assistant" && m.quickReplies && m.quickReplies.length > 0
  );
  const showQuickReplies =
    lastQuickReplyMsg &&
    chatHistory[chatHistory.length - 1]?.id === lastQuickReplyMsg.id &&
    !isLoading;

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-6 max-w-4xl mx-auto w-full">
        <Link href="/" className="text-xl font-medium tracking-tight text-primary hover:opacity-80 transition-opacity">
          MediRoute
        </Link>
        <div className="flex items-center gap-4">
          {clinicalState.confidence > 0.5 && (
            <button
              onClick={() => router.push("/results")}
              className="text-sm font-medium text-primary hover:underline"
            >
              View Results
            </button>
          )}
          <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">
            Start Over
          </Link>
        </div>
      </nav>

      {/* Clinical state indicator */}
      {clinicalState.mappedCondition && (
        <div className="max-w-4xl mx-auto w-full px-8 mb-4">
          <div className="bg-primary/5 border border-primary/10 rounded-2xl px-5 py-3 flex items-center justify-between">
            <div className="text-sm">
              <span className="text-foreground/50">Identified: </span>
              <span className="font-medium text-primary">{clinicalState.mappedCondition}</span>
              {clinicalState.location && (
                <span className="text-foreground/50"> near {clinicalState.location}</span>
              )}
            </div>
            <div className="text-xs font-medium text-foreground/40">
              Confidence: {Math.round(clinicalState.confidence * 100)}%
            </div>
          </div>
        </div>
      )}

      {/* Chat area */}
      <div ref={containerRef} className="flex-1 max-w-4xl mx-auto w-full px-8 overflow-y-auto pb-4">
        {/* Disclaimer */}
        <div className="text-center text-xs text-foreground/40 mb-8 py-2 border-b border-foreground/5">
          I am an AI assistant helping you estimate costs and find hospitals. I cannot diagnose medical conditions.
        </div>

        {chatHistory.map((msg) => (
          <ChatBubble key={msg.id} role={msg.role} content={msg.content} />
        ))}

        {/* Quick Reply chips */}
        {showQuickReplies && lastQuickReplyMsg && (
          <QuickReply
            options={lastQuickReplyMsg.quickReplies!}
            onSelect={(opt) => sendMessage(opt)}
          />
        )}

        {isLoading && <TypingIndicator />}

        {/* Retry button on error */}
        {error && !isLoading && (
          <div className="flex justify-center mb-4">
            <button
              onClick={() => {
                const lastUserMsg = [...chatHistory].reverse().find((m) => m.role === "user");
                if (lastUserMsg) sendMessage(lastUserMsg.content);
              }}
              className="text-sm text-primary font-medium hover:underline cursor-pointer"
            >
              ↻ Retry last message
            </button>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className="sticky bottom-0 bg-background border-t border-foreground/5">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto w-full px-8 py-5 flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe your symptoms or ask about a procedure..."
            disabled={isLoading}
            className="flex-1 px-5 py-3.5 rounded-2xl bg-surface border border-foreground/10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-6 py-3.5 bg-primary text-white rounded-2xl font-medium text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 shrink-0"
          >
            Send
          </button>
        </form>
      </div>
    </main>
  );
}
