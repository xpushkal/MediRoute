# MediRoute AI - Technical Design & Execution Plan

## 1. System Architecture & Tech Stack

### Core Technologies
- **Framework**: Next.js 15 (App Router) for Server-Side Rendering (SSR) and API routes.
- **Language**: TypeScript for end-to-end type safety.
- **Styling**: Tailwind CSS + `shadcn/ui` for accessible, premium, and responsive components. Framer Motion for micro-animations and smooth transitions.
- **State Management**: Zustand for client-side state (e.g., multi-step forms, chat history). Next.js Server Components for data fetching.
- **Database**: PostgreSQL (via Supabase or Neon) for structured data (hospitals, providers).
- **ORM**: Prisma for type-safe database access.
- **AI/LLM Engine**: Vercel AI SDK integrated with OpenAI (GPT-4o) or Anthropic (Claude 3.5) for NLP intent classification, clinical mapping, and conversational chat.
- **Search & Ranking**: PostgreSQL pgvector (if embedding-based search is needed) or direct SQL queries with a custom ranking algorithm.
- **Deployment**: Vercel for edge caching, CI/CD, and serverless functions.

---

## 2. Phase-by-Phase Execution Plan

### Phase 1: Foundation & Architecture Setup (Days 1-2)
**Goal:** Initialize the monorepo, configure the tech stack, and set up the database schema.

*   **Step 1.1:** Initialize Next.js 15 project (`npx create-next-app@latest`).
*   **Step 1.2:** Configure Tailwind CSS, setup custom color palettes (healthcare-focused: calm blues, clean whites, legible dark mode).
*   **Step 1.3:** Install and configure `shadcn/ui` (buttons, cards, dialogs, inputs, skeleton loaders).
*   **Step 1.4:** Define Prisma Schema:
    *   `Provider` (Hospitals/Clinics)
    *   `Procedure` (ICD-10/SNOMED CT mapping, base costs)
    *   `UserSession` (Anonymized chat histories)
*   **Step 1.5:** Set up Supabase/Neon database and run initial migrations. Seed the database with mock hospital and procedure data for Tier 1/2/3 cities.

### Phase 2: Core UI Components & Landing Experience (Days 3-4)
**Goal:** Build a high-fidelity, trustworthy user interface.

*   **Step 2.1:** Develop the Landing Page emphasizing the "Kayak for Healthcare" value proposition. Include hero section, trusted-by logos, and a clear call-to-action to start the assessment.
*   **Step 2.2:** Build the Global Layout: Header (Navigation, Theme Toggle), Footer (Disclaimers, Links).
*   **Step 2.3:** Implement a responsive, floating AI Chat Interface for the "Intake" phase.
*   **Step 2.4:** Build reusable UI components: `ProviderCard`, `CostBreakdownChart`, `ConfidenceBadge`.

### Phase 3: Conversational Intake & Clinical Mapping (Days 5-7)
**Goal:** Translate natural language into structured medical intent.

*   **Step 3.1:** Integrate Vercel AI SDK to create a streaming chat API route (`/api/chat`).
*   **Step 3.2:** Develop the System Prompt: Instruct the LLM to extract symptoms, age, location, and comorbidities. **Crucial:** Enforce strict guardrails to prevent diagnostic claims.
*   **Step 3.3:** Implement structured output parsing (using Zod) to map LLM responses to a structured JSON schema (Intent, Extracted Entities, mapped ICD-10 proxy, Confidence Score).
*   **Step 3.4:** Build the Clarification Engine: If the LLM confidence score is `< 0.6`, trigger the UI to ask 1-2 multiple-choice follow-up questions.

### Phase 4: Provider Discovery & Ranking Engine (Days 8-10)
**Goal:** Query the database and rank hospitals based on the 8-signal architecture.

*   **Step 4.1:** Create `/api/providers/search` endpoint that accepts the structured clinical pathway and user location.
*   **Step 4.2:** Implement the Ranking Algorithm in TypeScript:
    *   Fetch matching providers from PostgreSQL.
    *   Calculate composite score (0-100) based on PRD weights (Clinical Capability 35%, Reputation 35%, Accessibility 15%, Affordability 15%).
*   **Step 4.3:** Build the UI to display the ranked list. Include filtering capabilities (Cost tier, Distance, Accreditation).
*   **Step 4.4:** Integrate Mapbox or Google Maps to show visual representations of provider locations and distances.

### Phase 5: Treatment Cost Estimation Engine (Days 11-13)
**Goal:** Calculate and display dynamic, component-level cost ranges.

*   **Step 5.1:** Create `/api/cost-estimate` endpoint.
*   **Step 5.2:** Implement the Cost Engine logic:
    *   Base Cost calculation (Procedure lookup).
    *   Apply Multipliers: Geographic tier, Hospital tier, Patient age factor, Comorbidity modifiers (e.g., Diabetes +10%).
*   **Step 5.3:** Build the `CostBreakdown` UI component. Use visual progress bars or ranges (e.g., `₹2,00,000 – ₹3,68,000`) and clearly explain the adjustments (e.g., "Diabetes risk factored in").
*   **Step 5.4:** Implement the Confidence Score UI logic with color-coded badges (High: Green, Moderate: Yellow, Low: Orange).

### Phase 6: Lender API & Integrations (Days 14-15)
**Goal:** Provide structured data for NBFC pre-qualification.

*   **Step 6.1:** Develop a secure REST API endpoint (`/api/v1/lenders/pre-qualify`).
*   **Step 6.2:** Implement API key authentication for B2B partners.
*   **Step 6.3:** Format the API response to strictly adhere to the JSON schema defined in the PRD (Appendix 12.2).
*   **Step 6.4:** Build a simple "Lender Dashboard" (mockup) to demonstrate how a loan officer would consume this API data.

### Phase 7: Polish, Responsible AI & Deployment (Days 16-17)
**Goal:** Finalize the application, ensure compliance, and deploy.

*   **Step 7.1:** Implement pervasive disclaimers ("This is an estimate, not a medical diagnosis") across all views.
*   **Step 7.2:** Conduct end-to-end testing of the user journey (Riya, Suresh, Lakshmi personas).
*   **Step 7.3:** Optimize Core Web Vitals (image optimization, dynamic imports for heavy chart libraries).
*   **Step 7.4:** Deploy to Vercel. Set up environment variables (Database URL, AI API Keys).

---

## 3. Directory Structure (Next.js App Router)

```text
src/
├── app/
│   ├── (marketing)/
│   │   ├── page.tsx           # Landing page
│   ├── (app)/
│   │   ├── navigator/         # Conversational UI
│   │   ├── results/           # Provider list & Rankings
│   │   ├── cost-estimate/     # Detailed cost breakdown
│   ├── api/
│   │   ├── chat/              # Vercel AI SDK endpoint
│   │   ├── providers/         # Search & Ranking API
│   │   ├── cost/              # Cost Estimation API
│   │   ├── v1/lenders/        # B2B Integration API
├── components/
│   ├── ui/                    # shadcn/ui components
│   ├── chat/                  # Chatbot components
│   ├── providers/             # Provider card, filters
│   ├── estimation/            # Cost breakdown visuals
├── lib/
│   ├── prisma.ts              # DB client
│   ├── ranking-engine.ts      # Logic for provider scoring
│   ├── cost-engine.ts         # Logic for cost adjustments
│   ├── llm-prompts.ts         # System prompts & Zod schemas
├── store/
│   ├── useJourneyStore.ts     # Zustand store for user state
```
