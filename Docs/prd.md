# PRODUCT REQUIREMENTS DOCUMENT
## AI Healthcare Navigator & Cost Estimator
> "Kayak for Healthcare" — India's Decision-Intelligence Layer for Medical & Financial Choices

| **Document Attribute** | **Details** |
|---|---|
| Product Name | MediRoute AI — Healthcare Navigator & Cost Estimator |
| Version | 1.0 |
| Date | April 2025 |
| Prepared For | Hackathon Problem Statement 4(b) |
| Target Market | India — Tier 1, Tier 2, Tier 3 Cities |
| Primary Users | Patients, Caregivers, Healthcare Lenders, Insurers |
| Document Status | DRAFT — For Review |

---

## 1. Executive Summary

India's healthcare system presents a paradox: a rapidly growing medical infrastructure exists alongside a deep information asymmetry that leaves patients, caregivers, and financial institutions unable to make confident, well-informed decisions. Across Tier 1, Tier 2, and Tier 3 cities, patients struggle to identify the right hospital, understand what treatment will cost, and navigate the complex interplay between clinical need and financial reality.

MediRoute AI is a decision-intelligence platform that bridges this gap. It translates a patient's natural language description of symptoms or conditions into a structured clinical pathway, surfaces ranked hospital and doctor options based on transparent scoring criteria, and delivers a component-level cost estimate with confidence indicators — all in a single conversational interface.

> **The Core Value Proposition**
>
> Patient Intent → Clinical Pathway → Provider Selection → Cost Estimation
>
> MediRoute AI is not a search engine. It is a structured reasoning system that transforms ambiguous patient input into actionable medical-financial intelligence — empowering better decisions for patients, lenders, and insurers alike.

### 1.1 Problem Context

Three persistent and interconnected problems drive the need for MediRoute AI:

| **Problem** | **Impact** |
|---|---|
| Inability to identify the right provider for a specific condition | Suboptimal hospital selection, delayed treatment, worse health outcomes |
| Lack of cost transparency and pricing predictability | Financial anxiety, deferred care, surprise billing, loan defaults |
| Wide inter-hospital cost variation with no standardization | Inability to pre-approve healthcare loans; high insurer uncertainty |
| No structured mapping from symptom to procedure to cost | Decision paralysis for patients in Tier 2/3 markets |

### 1.2 Solution Summary

MediRoute AI delivers the following core capabilities in a single platform:

- Natural language intake with ICD-10 / SNOMED CT mapping
- Intelligent provider discovery and multi-signal ranking
- Component-level treatment cost estimation with geographic and comorbidity adjustments
- Transparent confidence scoring with risk disclosure
- Lender and insurer API layer for pre-qualification and pre-approval workflows

---

## 2. Goals, Objectives & Success Metrics

### 2.1 Product Goals

| **Goal** | **Description** |
|---|---|
| G1 — Clinical Clarity | Enable patients to move from a vague symptom description to a specific, structured treatment pathway in under 60 seconds |
| G2 — Provider Intelligence | Surface ranked, transparent provider recommendations grounded in clinical capability, reputation, and accessibility |
| G3 — Cost Transparency | Deliver realistic, component-level cost ranges with confidence scores, adjusted for location, age, and comorbidities |
| G4 — Financial Enablement | Support lenders and insurers in pre-qualifying healthcare financing with structured, machine-readable estimates |
| G5 — Responsible AI | Maintain strict decision-support positioning with no diagnostic claims, comprehensive disclaimers, and calibrated uncertainty |

### 2.2 Key Performance Indicators

| **Metric** | **Target (Year 1)** | **Measurement Method** |
|---|---|---|
| Clinical mapping accuracy (ICD-10) | >85% precision | Annotated test dataset |
| Cost estimate within ±20% of actual bill | >70% of cases | Post-treatment feedback loop |
| Provider ranking user satisfaction | NPS > 50 | In-app survey |
| Query-to-result latency | < 5 seconds | P95 backend monitoring |
| Lender API pre-qualification accuracy | >80% confidence calibration | Lender outcome tracking |
| DAU / MAU ratio | > 35% | Product analytics |
| Responsible AI disclaimer acknowledgement | 100% of sessions | Session audit log |

---

## 3. User Personas & Journeys

### 3.1 Primary Personas

| **Persona** | **Profile & Core Need** |
|---|---|
| Riya — Urban Patient (Tier 1) | 28-year-old working professional in Pune. Experiencing unexplained fatigue and joint pain. Needs: the right specialist, realistic cost, and can she afford it without a loan? |
| Suresh — Caregiver (Tier 2) | 52-year-old from Nagpur managing his father's heart condition. Needs: which hospital can handle angioplasty, what will it cost, and is a health loan viable? |
| Lakshmi — Rural Caregiver (Tier 3) | 40-year-old from a small town near Coimbatore. Limited digital literacy. Needs: simple language, WhatsApp-compatible chatbot, nearest hospital with affordable cancer care |
| Ravi — Healthcare Lender (NBFC) | Loan officer at a health-focused NBFC. Needs: structured, reliable cost estimates with confidence scores to pre-approve a health loan ticket of ₹2–5 lakhs |
| Ananya — Health Insurer Analyst | Claims analyst at a mid-size insurer. Needs: pre-authorization cost benchmarks to validate claims and flag outliers |

### 3.2 Primary User Journey — Patient (Riya)

| **Step** | **User Action** | **System Response** |
|---|---|---|
| 1. Intake | Types: 'chest pain when I climb stairs, I'm 34, diabetic' | NLP extracts: symptoms, age, comorbidity → maps to ICD-10 I20 (Angina Pectoris) |
| 2. Clarification | Answers 2 follow-up questions on duration and severity | Refines clinical pathway: Cardiology → Stress Test → Possible Angiography |
| 3. Discovery | Selects city: Pune, budget preference: mid-tier | Returns top 5 ranked hospitals with scores and distance |
| 4. Cost Estimate | Taps 'Show Cost Breakdown' for Apollo Clinic | Renders component-level cost range with confidence score |
| 5. Financing | Taps 'Check Loan Eligibility' | Passes structured data to partner NBFC API; returns pre-qualification status |
| 6. Action | Books appointment or shares summary with family | Sends PDF summary via WhatsApp / email |

---

## 4. Functional Requirements

### 4.1 FR-01: Natural Language Intake & Clinical Mapping

> **Module Purpose:** Translate free-text patient input — including symptoms, conditions, and preference-based queries — into structured clinical concepts using standard medical ontologies.

**Input Types Supported**

- Symptom descriptions: `'sharp pain in left knee when walking'`
- Condition names: `'diabetes management'`, `'knee replacement'`
- Procedure names: `'angioplasty'`, `'cataract surgery'`
- Preference queries: `'best cancer hospital near Nagpur under ₹5 lakh'`
- Comorbidity declarations: `'I have diabetes and high BP'`

**Processing Pipeline**

| **Stage** | **Function** |
|---|---|
| Intent Classification | Classify query as symptom / condition / procedure / preference |
| Entity Extraction | Extract body part, severity, duration, age, gender, comorbidities, location, budget |
| Clinical Mapping | Map extracted entities to ICD-10 codes and SNOMED CT concepts |
| Pathway Resolution | Determine likely clinical pathway: specialty → procedure(s) → care setting |
| Clarification Engine | Generate up to 3 targeted follow-up questions if confidence < 0.6 |
| Disambiguation | Handle multi-condition inputs and differential pathway suggestions |

**Acceptance Criteria**

- System maps >85% of common condition queries to correct ICD-10 at top-1
- Supports English, Hindi, Tamil, Telugu, Kannada, Marathi input (v1 scope: English + Hindi)
- Clarification questions are generated in user's preferred language
- All clinical mapping outputs include a confidence score between 0 and 1
- System must NOT return a diagnosis — only clinical category and pathway

---

### 4.2 FR-02: Provider Discovery & Ranking Engine

> **Module Purpose:** Given a structured clinical query and user location, return a ranked list of hospitals and doctors with transparent, multi-signal scoring.

**Ranking Signal Architecture**

| **Signal Category** | **Signal** | **Weight** |
|---|---|---|
| Clinical Capability | Specialization relevance to condition | 20% |
| Clinical Capability | Procedure volume proxy (NABH tier, bed count) | 15% |
| Reputation | Aggregate public rating (Google, Practo, etc.) | 15% |
| Reputation | NLP-processed review sentiment (condition-specific) | 10% |
| Reputation | NABH / JCI accreditation status | 10% |
| Accessibility | Distance from user location (km) | 10% |
| Accessibility | Estimated appointment wait time (proxy) | 5% |
| Affordability | Hospital tier classification (budget / mid / premium) | 15% |

**Output Per Provider Listing**

- Hospital name, type, address, distance
- Composite ranking score (0–100) with breakdown
- NABH / accreditation badge (if applicable)
- Cost tier classification (₹ / ₹₹ / ₹₹₹)
- Estimated cost range for queried procedure
- Key strength tags: `'High Cardiac Volume'`, `'NABH Accredited'`, `'Budget-Friendly'`
- Estimated appointment availability (next 3 days / 1 week / 2+ weeks)

**Acceptance Criteria**

- Returns results in under 3 seconds for any Indian city with >5 hospitals
- Ranking logic is fully explainable — user can view score components
- No paid placement — rankings are purely signal-based
- Supports filtering by: distance, cost tier, accreditation, language

---

### 4.3 FR-03: Treatment Cost Estimation Engine

> **Module Purpose:** Produce a realistic, component-level cost range for a given procedure at a given provider, adjusted for the patient's geographic location, age, and clinical risk factors.

**Cost Components**

| **Cost Component** | **Description & Inputs** |
|---|---|
| Procedure / Surgery Cost | Base cost from procedure category benchmarks; adjusted for hospital tier |
| Surgeon / Specialist Fee | Estimated consultation and operative fee; varies by seniority and tier |
| Hospital Stay (Room) | Per-day rates by room type: General / Semi-Private / Private / ICU |
| Pre-procedure Diagnostics | Standard work-up: blood panel, ECG, imaging as applicable to procedure |
| Anaesthesia | Estimated as % of procedure cost; adjusted for duration |
| Post-procedure Medication | Discharge medication and first 30-day supply estimates |
| Post-procedure Follow-up | Standard follow-up consultations and tests |
| Complication Contingency | Additional buffer for comorbidity-driven risk (e.g., diabetes → +15% ICU risk) |

**Adjustment Variables**

- Geographic pricing factor: Metro vs Tier 2 vs Tier 3 multiplier (calibrated by city category)
- Hospital tier multiplier: Budget (0.6x) / Mid-tier (1.0x) / Premium (1.6x)
- Patient age adjustment: Elderly (>60) increases complication and stay cost by 15–25%
- Comorbidity risk adjustments: Diabetes +10%, Cardiac History +20%, Obesity +8%
- Urgency factor: Emergency / elective / planned — affects bed availability premium

**Sample Output**

```
Sample Cost Estimation Output — Angioplasty, Nagpur, Mid-tier Hospital

Condition: Coronary Artery Disease  |  Procedure: Angioplasty
Hospital: ABC Heart Institute, Nagpur  |  Tier: Mid-tier  |  Distance: 5.2 km

Procedure Cost:           ₹1,20,000 – ₹2,00,000
Hospital Stay (4–6 days): ₹30,000  – ₹60,000
Anaesthesia:              ₹12,000  – ₹20,000
Diagnostics (pre/post):   ₹8,000   – ₹18,000
Medication:               ₹15,000  – ₹30,000
Complication Contingency: ₹15,000  – ₹40,000
─────────────────────────────────────────────
TOTAL ESTIMATED RANGE:    ₹2,00,000 – ₹3,68,000

Confidence Score: 0.68  |  Notes: Costs may increase if ICU care is required.
Diabetes flag: Extended recovery likely — additional ₹15,000 – ₹25,000.
```

**Acceptance Criteria**

- All cost outputs are ranges — never single-point estimates
- Every estimate includes a confidence score and key assumptions
- Comorbidity adjustments are surfaced to the user with plain-language explanation
- Estimates are updated as user provides more information (iterative refinement)

---

### 4.4 FR-04: Multi-Source Intelligence Layer

**Data Sources & Fusion Strategy**

| **Data Source** | **Usage** |
|---|---|
| Hospital directories (NHP, Practo, Google) | Provider discovery, contact, accreditation status |
| Public review platforms | NLP sentiment scoring for condition-specific reputation |
| NABH accreditation registry | Capability and quality signals |
| Procedure cost benchmarks (synthetic + public) | Base cost estimation by procedure category |
| Geographic pricing index (city-tier mapping) | Geographic adjustment factors |
| ICD-10 / SNOMED CT ontologies | Clinical concept mapping |
| Indian census & city-tier classification | Population density, tier classification |

**NLP Review Processing**

- Extract condition-specific review signals (e.g., reviews mentioning 'angioplasty' for cardiac queries)
- Sentiment classification: Positive / Neutral / Negative per review
- Aspect-based extraction: staff quality, wait times, cleanliness, cost transparency
- Fake review detection: flag providers with abnormal review patterns

---

## 5. Non-Functional Requirements

| **Category** | **Requirement** | **Target** |
|---|---|---|
| Performance | Query-to-result latency (P95) | < 5 seconds |
| Performance | API response time for lender integration | < 2 seconds |
| Scalability | Concurrent users supported (launch) | 10,000 |
| Scalability | Horizontal scaling architecture | Stateless microservices |
| Availability | Platform uptime | 99.5% monthly SLA |
| Security | Patient data encryption (at rest and in transit) | AES-256 / TLS 1.3 |
| Privacy | DPDP Act 2023 compliance | Full compliance |
| Accessibility | WCAG 2.1 AA compliance | Required |
| Localization | Language support at launch | English, Hindi |
| Device Support | Mobile-first responsive design | iOS 14+, Android 10+ |
| Offline | Basic chatbot functionality on low connectivity | Offline-first PWA |

---

## 6. Responsible AI & Trust Framework

### 6.1 Mandatory Safeguards

> **CRITICAL DESIGN CONSTRAINT**
>
> MediRoute AI is a decision-support tool. It does NOT provide medical diagnoses or treatment recommendations. All outputs are informational estimates intended to support — not replace — consultation with a qualified medical professional.

| **Risk** | **Safeguard Implemented** |
|---|---|
| Incorrect symptom-to-condition mapping | Confidence threshold: queries below 0.5 trigger explicit uncertainty disclosure and referral to doctor |
| User treating estimates as diagnosis | Persistent disclaimer on every response; no diagnostic language in any output |
| High cost variance between providers | Range-based outputs with explicit note on variance drivers |
| Vulnerable users (elderly, low literacy) | Simplified language mode; WhatsApp delivery channel; voice input support (v2) |
| Financial decisions based on estimates | Disclaimer: 'Actual costs may vary. Consult hospital for confirmed quote before financial commitment.' |
| Fake or biased provider rankings | Transparency panel showing ranking components; no paid placement policy |
| Data privacy of health queries | Queries anonymized by default; explicit opt-in for personalization; DPDP compliant |

### 6.2 Confidence Score Design

| **Confidence Range** | **User-Facing Message** |
|---|---|
| 0.8 – 1.0 (High) | Estimate based on strong data signals. Relatively reliable for planning. |
| 0.6 – 0.79 (Moderate) | Estimate based on available data. Actual costs may vary by 20–30%. |
| 0.4 – 0.59 (Low) | Limited data available. Use as a rough guide only. Verify directly with hospital. |
| < 0.4 (Very Low) | Insufficient data for reliable estimate. We strongly recommend calling the hospital. |

---

## 7. System Architecture & Technical Design

### 7.1 High-Level Architecture

MediRoute AI is designed as a modular, API-first microservices platform with the following core layers:

| **Layer** | **Components** |
|---|---|
| Presentation Layer | React Native mobile app, Web PWA (responsive), WhatsApp Business API bot, Lender/Insurer integration portal |
| Conversation Engine | Dialogue manager, intent classifier, entity extractor, clarification engine, session state manager |
| Clinical Intelligence | ICD-10 / SNOMED CT mapper, clinical pathway resolver, comorbidity risk engine, differential suggestions |
| Provider Intelligence | Hospital data aggregator, ranking engine, NLP review processor, geolocation service |
| Cost Estimation Engine | Procedure benchmark store, adjustment factor engine, component cost calculator, confidence scorer |
| Data Layer | Hospital directory DB, procedure benchmark store, review index, user session store (anonymized) |
| API Gateway | REST + GraphQL; versioned; rate-limited; OAuth 2.0; lender / insurer webhook endpoints |
| Observability | Distributed tracing, real-time dashboards, model performance monitoring, bias audit pipeline |

### 7.2 Key Technical Decisions

- **LLM backbone:** Fine-tuned model on medical ontology + Indian healthcare corpus for clinical mapping
- **Retrieval-Augmented Generation (RAG):** Hospital profiles and procedure benchmarks retrieved at inference time for accuracy
- **Ranking engine:** Weighted multi-signal scoring with configurable weights; no black-box ML for provider ranking
- **Cost engine:** Structured rules + regression model ensemble; outputs calibrated confidence intervals
- **Data freshness:** Hospital data refreshed weekly; review data refreshed daily via API
- **No proprietary transaction data assumed:** Public data, synthetic benchmarks, and reasoned assumptions only

---

## 8. Product Scope & Release Roadmap

### 8.1 MVP Scope (v1.0)

| **Feature** | **MVP Scope** |
|---|---|
| Natural language intake | English and Hindi; top 20 condition categories |
| Clinical mapping | ICD-10 mapping; top 50 procedures; single-condition queries |
| Provider discovery | Web scraper + public API data; top 50 Indian cities |
| Ranking engine | 5-signal ranking model; transparent score breakdown |
| Cost estimation | Component-level ranges; 4 hospital tiers; metro + Tier 2 cities |
| Confidence scoring | Calibrated 0–1 score with user-facing interpretation |
| User interface | Web PWA + Android app; WhatsApp basic flow |
| Lender API | REST API; JSON output; 3 pilot NBFC integrations |
| Responsible AI | All mandatory disclaimers; confidence thresholds; no diagnostic language |

### 8.2 Release Roadmap

| **Phase** | **Timeline** | **Key Deliverables** |
|---|---|---|
| Phase 1 — Foundation | Months 1–3 | Clinical mapping engine, hospital data pipeline, cost benchmark store, MVP API |
| Phase 2 — Product Launch | Months 4–6 | Mobile app, web PWA, WhatsApp bot, lender API, 50-city launch |
| Phase 3 — Intelligence Layer | Months 7–9 | NLP review pipeline, personalization, comorbidity refinement, insurer API |
| Phase 4 — Scale & Reach | Months 10–12 | Regional language support (Tamil, Telugu, Kannada), voice input, 200-city coverage |
| Phase 5 — Ecosystem | Year 2 | Hospital direct partnerships, real-time pricing API, appointment booking, EMR integration |

---

## 9. Explicit Out of Scope (v1.0)

- Medical diagnosis or treatment prescription of any kind
- Real-time hospital bed or OT availability (requires hospital system API partnerships)
- Actual appointment booking engine (v2 scope)
- Processing of proprietary hospital pricing datasets
- Electronic Health Record (EHR) integration (v2 scope)
- Insurance claim processing or adjudication
- Direct patient-doctor video consultation
- Drug interaction checking or medication management

---

## 10. Alignment with Hackathon Evaluation Criteria

| **Evaluation Dimension** | **Weight** | **How MediRoute AI Addresses It** |
|---|---|---|
| Clinical mapping accuracy | 20% | ICD-10 + SNOMED CT pipeline; confidence scoring; clarification engine; 85% precision target |
| Cost estimation logic | 25% | Component-level breakdown; geographic + comorbidity adjustments; range outputs; calibrated confidence |
| Provider ranking quality | 20% | 8-signal transparent ranking; NLP review processing; no paid placement; fully explainable |
| Multi-source intelligence | 15% | Structured + unstructured data fusion; synthetic benchmarks; RAG architecture |
| User experience & clarity | 10% | Conversational interface; plain-language outputs; mobile-first; WhatsApp channel; low-literacy mode |
| Responsible AI practices | 10% | Mandatory disclaimers; confidence thresholds; DPDP compliance; no diagnostic claims; bias audit |

---

## 11. Risks & Mitigations

| **Risk** | **Likelihood** | **Mitigation** |
|---|---|---|
| Low-quality or stale hospital data in Tier 3 cities | High | Hybrid: web scraping + crowdsourced corrections + quarterly data refresh; low-confidence flag for sparse data |
| Users over-relying on cost estimates for financial decisions | Medium | Persistent disclaimers; confidence thresholds; mandatory 'Verify with hospital' CTA |
| Clinical mapping errors for rare or complex conditions | Medium | Scope MVP to top 50 common procedures; confidence floor; explicit referral to specialist for low-confidence queries |
| Regulatory scrutiny on medical advice positioning | Medium | Legal review; strict decision-support framing; no diagnostic language in any prompt or output |
| Data privacy breach of health queries | Low-Medium | Query anonymization by default; no PII stored without consent; DPDP compliance; regular pen-testing |
| Gaming of provider rankings by hospitals | Low | No paid placement policy; ranking algorithm not public; anomaly detection on rating patterns |

---

## 12. Appendix

### 12.1 Glossary

| **Term** | **Definition** |
|---|---|
| ICD-10 | International Classification of Diseases, 10th Revision — WHO standard for medical condition coding |
| SNOMED CT | Systematized Nomenclature of Medicine — Clinical Terms; comprehensive clinical ontology |
| NABH | National Accreditation Board for Hospitals and Healthcare Providers — Indian hospital quality accreditation |
| RAG | Retrieval-Augmented Generation — LLM architecture that retrieves relevant data at inference time |
| DPDP Act 2023 | India's Digital Personal Data Protection Act — data privacy regulatory framework |
| NLP | Natural Language Processing — AI technique for understanding and generating human language |
| Confidence Score | A calibrated 0–1 score representing the system's certainty in its estimate |
| Clinical Pathway | Standardized sequence of care steps for a specific condition or procedure |

### 12.2 Sample API Response Schema

```json
{
  "query_id": "mrai_20250401_xyz789",
  "condition": {
    "name": "Coronary Artery Disease",
    "icd10": "I25.1",
    "confidence": 0.82
  },
  "recommended_procedure": "Percutaneous Coronary Intervention (Angioplasty)",
  "providers": [
    {
      "name": "ABC Heart Institute",
      "city": "Nagpur",
      "distance_km": 5.2,
      "ranking_score": 78,
      "tier": "mid",
      "accreditation": ["NABH"],
      "cost_estimate": {
        "total_range": [200000, 368000],
        "components": {
          "procedure": [120000, 200000],
          "hospital_stay": [30000, 60000],
          "medication": [15000, 30000],
          "contingency": [15000, 40000]
        },
        "confidence_score": 0.68,
        "adjustments_applied": [
          "diabetes_complication_risk",
          "tier2_city_factor"
        ]
      }
    }
  ],
  "risk_flags": ["diabetes_may_extend_recovery"],
  "disclaimer": "This is an estimate for informational purposes only. Not a medical diagnosis."
}
```

---

*MediRoute AI — Product Requirements Document v1.0*
*Prepared for Hackathon Problem Statement 4(b) — AI Healthcare Navigator & Cost Estimator*

> This document is a decision-support tool. MediRoute AI does not provide medical diagnoses.