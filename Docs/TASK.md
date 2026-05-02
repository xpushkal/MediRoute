# MediRoute AI — Implementation Tasks

> Cross-referenced against: PRD (prd.md), Technical Design (design.md), Frontend Guide (frontend-guide.md)
> Tech Stack: Next.js 16 + Tailwind v4 + Prisma 7 + Neon DB + OpenRouter AI + Zustand + Leaflet + Docker

---

## Current State

**Done (Frontend — from prior session):**
- [x] Next.js 16 project initialized with Tailwind v4, GSAP, Lenis
- [x] Landing page with hero, search input, feature cards
- [x] Results page (initial version)
- [x] Components: SmoothScroll, ConfidenceGauge, CostEstimator, ProviderCard

---

## Task 1: Database Schema & Seed Data — DONE
**Files:** `prisma/schema.prisma`, `prisma/seed.ts`, `src/lib/prisma.ts`

- [x] 1.1 Install Prisma, `@prisma/client`, configure for Neon PostgreSQL
- [x] 1.2 Define schema: `Provider`, `Procedure`, `ProcedureCost`, `City`, `Specialty`, `UserSession`
- [x] 1.3 Create `src/lib/prisma.ts` singleton client
- [x] 1.4 Write seed script with 13 cities, 8 specialties, 10 procedures, 15 hospitals
- [x] 1.5 Run migrations and seed — DONE (13 cities, 8 specialties, 10 procedures, 15 hospitals seeded)

---

## Task 2: Zustand Journey Store — DONE
**Files:** `src/store/useJourneyStore.ts`

- [x] 2.1 Install Zustand
- [x] 2.2 Create store with: `query`, `chatHistory`, `clinicalState`, `selectedCity`, `selectedProvider`, `costEstimate`, `filters`
- [x] 2.3 Define TypeScript interfaces for all state shapes

---

## Task 3: Clinical Mapping API (OpenRouter AI) — DONE
**Files:** `src/lib/llm-prompts.ts`, `src/lib/openrouter.ts`, `src/app/api/chat/route.ts`

- [x] 3.1 Install `zod`
- [x] 3.2 Create OpenRouter client configuration (`src/lib/openrouter.ts`)
- [x] 3.3 Write system prompt for clinical intake with strict responsible AI guardrails
- [x] 3.4 Define Zod schemas for structured AI output (`ClinicalIntent`)
- [x] 3.5 Build chat API route at `/api/chat` with JSON extraction
- [x] 3.6 Implement clarification logic via confidence thresholds

---

## Task 4: Provider Discovery & Ranking API — DONE
**Files:** `src/lib/ranking-engine.ts`, `src/app/api/providers/route.ts`

- [x] 4.1 Build ranking engine with 8-signal weighted scoring (PRD §4.2)
- [x] 4.2 Create `GET /api/providers` endpoint with ranked results
- [x] 4.3 Add filter support: distance, cost tier, accreditation

---

## Task 5: Cost Estimation Engine API — DONE
**Files:** `src/lib/cost-engine.ts`, `src/app/api/cost-estimate/route.ts`

- [x] 5.1 Build cost engine with component-level calculation (PRD §4.3)
- [x] 5.2 Create `POST /api/cost-estimate` endpoint
- [x] 5.3 Return component-level ranges, total range, confidence score, risk flags

---

## Task 6: Lender Pre-Qualification API (Mock) — DONE
**Files:** `src/app/api/v1/lenders/pre-qualify/route.ts`

- [x] 6.1 Create `POST /api/v1/lenders/pre-qualify` endpoint
- [x] 6.2 Accept structured cost estimate + basic user info
- [x] 6.3 Return mock pre-qualification response
- [x] 6.4 Add API key authentication header check

---

## Task 7: Navigator (Chat) Page — DONE
**Files:** `src/app/navigator/page.tsx`, `src/components/ChatBubble.tsx`, `src/components/QuickReply.tsx`, `src/components/TypingIndicator.tsx`

- [x] 7.1 Build chat interface with user/AI message bubbles
- [x] 7.2 Integrate with `/api/chat` endpoint
- [x] 7.3 Implement quick-reply chips for clarification
- [x] 7.4 On high-confidence extraction (≥0.8), auto-transition to results
- [x] 7.5 Save extracted clinical state to Zustand store
- [x] 7.6 Add GSAP entrance animations

---

## Task 8: Wire Results Page to Live Data — DONE
**Files:** `src/app/results/page.tsx`, `src/components/FilterPanel.tsx`

- [x] 8.1 Read clinical state from Zustand store
- [x] 8.2 Fetch providers from `/api/providers` on mount
- [x] 8.3 Build FilterPanel component (distance slider, cost tier toggles, accreditation)
- [x] 8.4 Re-fetch on filter change
- [x] 8.5 Add Leaflet map view with provider pins, List/Map toggle, custom markers, popups
- [x] 8.6 Wire "Select" button to navigate to `/cost-estimate/[providerId]`

Additional: `src/components/ProviderMap.tsx` (lazy-loaded)

---

## Task 9: Cost Estimate Detail Page — DONE
**Files:** `src/app/cost-estimate/[providerId]/page.tsx`

- [x] 9.1 Fetch cost estimate from `/api/cost-estimate`
- [x] 9.2 Display total range with confidence badge
- [x] 9.3 Itemized accordion breakdown
- [x] 9.4 Dynamic comorbidity alert banner
- [x] 9.5 "Check Loan Eligibility" button → opens financing modal

---

## Task 10: Financing Pre-Qualification Modal — DONE
**Files:** `src/components/FinancingModal.tsx`

- [x] 10.1 Build slide-over modal with consent form
- [x] 10.2 Connect to `/api/v1/lenders/pre-qualify`
- [x] 10.3 Show loading state, then success/failure result

---

## Task 11: Responsible AI & Disclaimers — DONE
- [x] 11.1 Persistent disclaimer on Results and Cost pages (footer banner)
- [x] 11.2 Chat intake disclaimer at session start
- [x] 11.3 Low-confidence gate: confidence < 0.6 triggers follow-up questions in chat
- [x] 11.4 Confidence score color coding in ConfidenceGauge

---

## Task 12: Docker Setup — DONE
**Files:** `Dockerfile`, `docker-compose.yml`, `.dockerignore`

- [x] 12.1 Create multi-stage Dockerfile for Next.js
- [x] 12.2 Create docker-compose.yml
- [x] 12.3 Create .dockerignore
- [x] 12.4 Add `.env.example` with documented variables

---

## Status: ALL TASKS COMPLETE

| Item | Status |
|------|--------|
| Database schema + seed | Done — 13 cities, 8 specialties, 10 procedures, 15 hospitals |
| API routes (chat, providers, cost, lender) | Done — all 4 endpoints functional |
| Frontend pages (home, navigator, results, cost-estimate) | Done — with GSAP animations |
| Leaflet map | Done — list/map toggle with custom markers |
| Docker | Done — multi-stage Dockerfile + docker-compose |
| Set `OPENROUTER_API_KEY` in `.env` | User must get a free key from openrouter.ai for chat to work |
