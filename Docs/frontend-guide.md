# MediRoute AI - Frontend UI/UX & Integration Guide

This document details the frontend architecture, page-by-page UI/UX breakdowns, and how each component integrates with the backend APIs.

---

## 1. Global Layout & State Management

### UI/UX Design System
*   **Color Palette:** Trust-inspiring colors. Deep blues (primary), clean whites/grays (backgrounds), and distinct semantic colors (Green for high confidence/success, Yellow for warnings/moderate confidence, Orange for alerts).
*   **Typography:** Clean, modern sans-serif (e.g., Inter or Roboto) for high readability across devices.
*   **Layout Structure:**
    *   **Header:** Sticky header featuring the MediRoute logo, primary navigation (Home, About), a Theme Toggle (Light/Dark mode), and a Language Selector (EN/HI). Includes a backdrop blur for a premium feel.
    *   **Footer:** Persistent medical disclaimers, Terms of Service, Privacy Policy, and copyright info.

### Global State & Integration
*   **Zustand Store (`useJourneyStore`):** Manages the user's journey state across pages.
    *   `chatHistory`: Array of message objects.
    *   `extractedClinicalState`: The structured JSON output from the AI (Symptoms, Age, Location, Comorbidities, mapped ICD-10 proxy, Confidence Score).
    *   `selectedProvider`: The hospital chosen from the ranking list.
*   **Preferences:** LocalStorage to persist language and theme preferences.

---

## 2. Landing Page (`/app/page.tsx`)

### UI/UX Elements
*   **Hero Section:**
    *   **Headline:** "Your Smart Guide to Healthcare & Costs" (or "The Kayak for Healthcare").
    *   **Subtitle:** "Understand your symptoms, find the right hospital, and get accurate cost estimates instantly."
    *   **CTA Button:** Large, pulsating primary button: "Start Assessment".
    *   **Visuals:** Premium 3D illustrations or abstract glassmorphism cards representing health and finance intersecting.
*   **Feature Grid:**
    *   3-column layout highlighting: "1. Clarify Symptoms", "2. Rank Providers", "3. Estimate Costs & Financing". Uses clean iconography.
*   **Trust Banner:**
    *   A scrolling marquee of mock partner logos (Hospitals, NBFCs) and an "Ensuring Data Privacy (DPDP Compliant)" badge.

### Backend Integration
*   This page is completely static/Server-Side Rendered (SSR). Clicking the CTA routes the user to `/navigator`.

---

## 3. Conversational Intake Page (`/app/navigator/page.tsx`)

### UI/UX Elements
*   **Chat Interface:**
    *   Designed like a modern messaging app (e.g., WhatsApp).
    *   **User Bubbles:** Right-aligned, colored with the primary brand color.
    *   **AI Bubbles:** Left-aligned, light gray, featuring a subtle "MediRoute AI" avatar.
    *   **Typing Indicator:** Smooth animated dots (Framer Motion) while the LLM generates the response.
*   **Input Area:**
    *   Text field with a send icon.
    *   *Micro-interaction:* The input field is disabled while the AI is typing to prevent race conditions.
*   **Interactive Clarification Widgets (Crucial UX):**
    *   Instead of making the user type out answers to clarification questions, the AI renders interactive "Quick Reply" chips below its message.
    *   *Example:* If the AI asks about pain duration, chips appear: `[Just today]`, `[A few days]`, `[More than a week]`. Clicking a chip automatically sends it as a user message.

### Backend Integration
*   **Endpoint:** `POST /api/chat` (using Vercel AI SDK).
*   **Flow:**
    1. User sends a message.
    2. Frontend streams the AI's conversational response.
    3. In the background, the AI also calls a **Tool/Function** (e.g., `extract_clinical_intent`).
    4. Once the AI hits a confidence score `> 0.8` that it has enough information, it triggers a UI event to transition the user to the Results page.
    5. The structured data is saved to the Zustand `useJourneyStore`.

---

## 4. Provider Discovery & Ranking Page (`/app/results/page.tsx`)

### UI/UX Elements
*   **Context Bar (Sticky Top):**
    *   Summarizes the AI's finding: "Showing results for: **Coronary Artery Disease Assessment** near **Pune**". Includes an "Edit" button to return to the chat.
*   **Filter Panel (Sidebar on Desktop, Drawer on Mobile):**
    *   **Distance:** Slider (e.g., 0-50 km).
    *   **Cost Tier:** Toggle buttons (₹ Budget, ₹₹ Mid, ₹₹₹ Premium).
    *   **Accreditation:** Checkboxes (NABH, JCI).
*   **Ranked Provider List:**
    *   A vertical list of `ProviderCard` components.
    *   **ProviderCard Layout:**
        *   **Header:** Hospital Name, Tier Indicator, Distance (km).
        *   **Body:** Badges for accreditations and key strengths (e.g., `High Volume`).
        *   **Scoring Ring:** A circular progress indicator (0-100) representing the composite ranking score. Hovering over the ring shows a tooltip with the score breakdown (Clinical, Reputation, Affordability).
        *   **Cost Preview:** A muted text showing the estimated base cost range.
        *   **Action:** Primary button "View Detailed Cost".
*   **Map View Toggle (Optional):**
    *   A floating action button (FAB) or toggle to switch the list view to a Map view (using Mapbox/Google Maps) with interactive pins.

### Backend Integration
*   **Endpoint:** `GET /api/providers/search`
*   **Payload:** Reads the condition, user location, and active filters from the Zustand store/URL search params.
*   **Response:** Returns a sorted JSON array of provider objects.
*   **State:** When "View Detailed Cost" is clicked, the selected provider ID is saved to the store, and the user routes to `/cost-estimate/[providerId]`.

---

## 5. Detailed Cost Estimation Page (`/app/cost-estimate/[providerId]/page.tsx`)

### UI/UX Elements
*   **Breadcrumbs:** `Home > Results > ABC Heart Institute > Cost Breakdown`.
*   **Hero Cost Banner:**
    *   Massive, clear typography displaying the total estimated range (e.g., **₹2,00,000 – ₹3,68,000**).
*   **Confidence Badge:**
    *   Located right below the total cost. E.g., a green badge reading "High Confidence (82%)". Includes an info icon that opens a popover explaining the score.
*   **Visual Breakdown (Chart):**
    *   A stacked horizontal bar chart or a clean donut chart showing the proportions of the cost (Procedure, Stay, Anaesthesia, Contingency).
*   **Itemized Accordion List:**
    *   Expandable rows for each component.
    *   *Example Row:* "Hospital Stay (4-6 days) ... ₹30k - ₹60k". Expanding it explains the daily room rate assumptions.
*   **Dynamic Risk/Comorbidity Alert:**
    *   If the user reported Diabetes during intake, a prominent Yellow/Orange alert box appears: *"Note: Your history of Diabetes indicates a higher likelihood of extended recovery, adding an estimated ₹15k - ₹25k contingency."*
*   **Action Panel (Financing):**
    *   A dedicated card at the bottom: "Need help financing this treatment?" with a primary button: **"Check Loan Eligibility"**.

### Backend Integration
*   **Endpoint:** `POST /api/cost-estimate`
*   **Payload:** Sends the `providerId`, the structured clinical intent, and the `comorbidities` array.
*   **Response:** Returns the itemized cost JSON array, total range, confidence score, and specific risk flags.

---

## 6. Financing Pre-Qualification Flow (Modal)

### UI/UX Elements
*   **Trigger:** Clicking "Check Loan Eligibility" opens a slide-over or modal.
*   **Consent Form:**
    *   Displays the estimated amount needed.
    *   Simple form: Name, Phone Number, PAN (optional for hackathon mock), and a strict consent checkbox for data sharing.
*   **Processing State:**
    *   A skeleton loader or a "scanning" animation while communicating with the NBFC API.
*   **Result View:**
    *   **Success:** "You are pre-qualified for up to ₹4,00,000 with our partner NBFC." CTA to "Proceed with Application".
    *   **Failure/Manual Review:** "We need more details. A representative will contact you."

### Backend Integration
*   **Endpoint:** `POST /api/v1/lenders/pre-qualify`
*   **Payload:** Sends user details and the structured cost estimate payload to the backend, which forwards it to the mock lender API.

---

## 7. Persistent Responsible AI Elements

### UI/UX Elements
*   **Intake Disclaimer:** At the start of the chat: "I am an AI assistant helping you estimate costs and find hospitals. I cannot diagnose medical conditions."
*   **Result Disclaimers:** A sticky footer banner on the Results and Cost pages: *"Costs shown are estimates based on available data and patient profiles. Actual hospital bills may vary. Always consult the hospital directly."*
*   **Low Confidence Handling:** If the mapping confidence is `< 0.4`, the UI blocks the cost estimation and instead shows a full-screen warning advising the user to visit a general physician first.
