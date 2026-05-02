import { create } from "zustand";

// ── Types ───────────────────────────────────────────────────────────────

export interface ClinicalState {
  symptoms: string[];
  age: number | null;
  gender: string | null;
  comorbidities: string[];
  location: string | null;
  mappedCondition: string | null;
  icd10Code: string | null;
  recommendedProcedure: string | null;
  clinicalPathway: string[]; // e.g. ["Cardiology", "Stress Test", "Angiography"]
  confidence: number; // 0-1
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  quickReplies?: string[];
  timestamp: number;
}

export interface ProviderResult {
  id: string;
  name: string;
  type: string;
  address: string;
  distance: number;
  latitude: number;
  longitude: number;
  tier: "BUDGET" | "MID" | "PREMIUM";
  nabh: boolean;
  jci: boolean;
  rating: number;
  reviewCount: number;
  rankingScore: number;
  scoreBreakdown: Record<string, number>;
  costEstimate: string;
  costMin: number;
  costMax: number;
  waitDays: number;
  strengths: string[];
}

export interface CostEstimate {
  totalMin: number;
  totalMax: number;
  confidence: number;
  components: { label: string; min: number; max: number }[];
  adjustments: string[];
  riskFlags: string[];
}

export interface Filters {
  maxDistance: number;
  costTier: ("BUDGET" | "MID" | "PREMIUM")[];
  accreditation: ("NABH" | "JCI")[];
}

// ── Store ───────────────────────────────────────────────────────────────

interface JourneyStore {
  // Query
  query: string;
  setQuery: (q: string) => void;

  // Chat
  chatHistory: ChatMessage[];
  addMessage: (msg: ChatMessage) => void;
  clearChat: () => void;

  // Clinical extraction
  clinicalState: ClinicalState;
  setClinicalState: (state: Partial<ClinicalState>) => void;

  // City selection
  selectedCity: string | null;
  setSelectedCity: (city: string) => void;

  // Provider results
  providers: ProviderResult[];
  setProviders: (p: ProviderResult[]) => void;
  selectedProvider: ProviderResult | null;
  setSelectedProvider: (p: ProviderResult | null) => void;

  // Cost estimate
  costEstimate: CostEstimate | null;
  setCostEstimate: (c: CostEstimate | null) => void;

  // Filters
  filters: Filters;
  setFilters: (f: Partial<Filters>) => void;

  // Reset
  resetJourney: () => void;
}

const initialClinicalState: ClinicalState = {
  symptoms: [],
  age: null,
  gender: null,
  comorbidities: [],
  location: null,
  mappedCondition: null,
  icd10Code: null,
  recommendedProcedure: null,
  clinicalPathway: [],
  confidence: 0,
};

const initialFilters: Filters = {
  maxDistance: 50,
  costTier: ["BUDGET", "MID", "PREMIUM"],
  accreditation: [],
};

export const useJourneyStore = create<JourneyStore>((set) => ({
  query: "",
  setQuery: (q) => set({ query: q }),

  chatHistory: [],
  addMessage: (msg) =>
    set((s) => {
      if (s.chatHistory.some((m) => m.id === msg.id)) return s;
      return { chatHistory: [...s.chatHistory, msg] };
    }),
  clearChat: () => set({ chatHistory: [] }),

  clinicalState: initialClinicalState,
  setClinicalState: (state) =>
    set((s) => ({ clinicalState: { ...s.clinicalState, ...state } })),

  selectedCity: null,
  setSelectedCity: (city) => set({ selectedCity: city }),

  providers: [],
  setProviders: (p) => set({ providers: p }),
  selectedProvider: null,
  setSelectedProvider: (p) => set({ selectedProvider: p }),

  costEstimate: null,
  setCostEstimate: (c) => set({ costEstimate: c }),

  filters: initialFilters,
  setFilters: (f) => set((s) => ({ filters: { ...s.filters, ...f } })),

  resetJourney: () =>
    set({
      query: "",
      chatHistory: [],
      clinicalState: initialClinicalState,
      selectedCity: null,
      providers: [],
      selectedProvider: null,
      costEstimate: null,
      filters: initialFilters,
    }),
}));
