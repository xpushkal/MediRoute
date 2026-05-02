# 🏥 MediRoute AI — Healthcare Navigator & Cost Estimator

> **"Kayak for Healthcare"** — India's AI-powered decision-intelligence platform that maps patient intent to clinical pathways, ranked providers, and component-level cost estimates.

[![Status](https://img.shields.io/badge/Status-MVP%20Development-blue)]()
[![License](https://img.shields.io/badge/License-MIT-green)]()
[![Target Market](https://img.shields.io/badge/Market-India%20Tier%201%2F2%2F3-orange)]()
[![Responsible AI](https://img.shields.io/badge/Responsible%20AI-Decision%20Support%20Only-red)]()

---

## 🌟 What Is MediRoute AI?

MediRoute AI is a decision-intelligence platform that helps patients, caregivers, and healthcare financiers in India navigate the complex intersection of **medical need** and **financial reality**.

Given a natural language description of symptoms or a condition, MediRoute AI:

1. **Maps** the query to standardized clinical concepts (ICD-10 / SNOMED CT)
2. **Ranks** hospitals and doctors using 8 transparent signals
3. **Estimates** end-to-end treatment costs at a component level
4. **Adjusts** for geography, hospital tier, patient age, and comorbidities
5. **Flags** confidence and uncertainty — never pretends to know more than it does

> ⚠️ **Medical Disclaimer:** MediRoute AI is a decision-support tool only. It does **not** provide medical diagnoses or treatment recommendations. Always consult a qualified medical professional.

---

## 🎯 The Problem We Solve

| Problem | Impact |
|---------|--------|
| Can't identify the right hospital for a specific condition | Suboptimal care, delayed treatment |
| No transparency in treatment pricing | Financial anxiety, deferred care, surprise bills |
| Wide cost variation across hospitals | Lenders can't pre-approve; insurers can't benchmark |
| No structured symptom → procedure → cost mapping | Decision paralysis, especially in Tier 2/3 cities |

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                    │
│   React Native App │ Web PWA │ WhatsApp Bot │ Lender API │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│                  CONVERSATION ENGINE                     │
│   Intent Classifier │ Entity Extractor │ Clarification  │
└────────────────────────┬────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         ▼               ▼               ▼
┌────────────────┐ ┌─────────────┐ ┌────────────────────┐
│    CLINICAL    │ │  PROVIDER   │ │   COST ESTIMATION  │
│ INTELLIGENCE  │ │ INTELLIGENCE│ │      ENGINE        │
│ ICD-10 Mapper │ │ Rank Engine │ │ Component Calculator│
│ Pathway Engine│ │ NLP Reviews │ │ Confidence Scorer  │
└───────┬────────┘ └──────┬──────┘ └─────────┬──────────┘
        └─────────────────┼──────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────┐
│                      DATA LAYER                          │
│  Hospital Directory │ Procedure Benchmarks │ Review Index│
└─────────────────────────────────────────────────────────┘
```

---

## ✨ Core Features

### 🗣️ Natural Language Intake
- Understands symptoms, conditions, procedures, and preference queries
- Supports English and Hindi (v1); Tamil, Telugu, Kannada, Marathi (v2)
- Generates clarifying follow-up questions when confidence < 0.6
- Maps inputs to ICD-10 codes and SNOMED CT concepts

### 🏨 Provider Discovery & Ranking
- 8-signal transparent ranking algorithm
- No paid placement — purely merit-based
- Filters: distance, cost tier, NABH accreditation, language
- NLP-processed condition-specific review sentiment

### 💰 Cost Estimation Engine
- Component-level breakdown: procedure, stay, anaesthesia, diagnostics, medication, contingency
- Adjustments for: city tier, hospital tier, patient age, comorbidities (diabetes, cardiac history, obesity)
- Always outputs **ranges**, never single-point estimates
- Calibrated confidence scores (0–1) with user-facing interpretation

### 🔒 Responsible AI
- Mandatory disclaimers on every response
- Confidence thresholds with uncertainty disclosure
- No diagnostic language anywhere in the system
- DPDP Act 2023 compliant data handling

---

## 🛠️ Tech Stack

### Backend
```
Language:        Python 3.11+
Framework:       FastAPI
LLM:             Fine-tuned model (medical ontology + Indian healthcare corpus)
RAG:             LangChain + FAISS vector store
Clinical NLP:    spaCy + custom ICD-10/SNOMED CT pipeline
Database:        PostgreSQL (structured) + Elasticsearch (reviews/search)
Cache:           Redis
Queue:           Celery + RabbitMQ
```

### Frontend
```
Mobile:          React Native (iOS 14+ / Android 10+)
Web:             React + Next.js (PWA)
WhatsApp:        Twilio WhatsApp Business API
Styling:         Tailwind CSS
State:           Zustand
```

### Infrastructure
```
Cloud:           AWS (primary) / GCP (ML workloads)
Containers:      Docker + Kubernetes
CI/CD:           GitHub Actions
Monitoring:      Datadog + Sentry
Tracing:         OpenTelemetry
```

### AI / ML
```
Intent Classification:    Fine-tuned BERT (medical domain)
Clinical Mapping:         ICD-10 / SNOMED CT ontology + RAG
Review NLP:               Sentiment analysis pipeline (RoBERTa)
Cost Estimation:          Structured rules + calibrated regression ensemble
Ranking Engine:           Weighted multi-signal scoring (interpretable, no black-box ML)
```

---

## 🚀 Getting Started

### Prerequisites

```bash
# Required
Python 3.11+
Node.js 18+
Docker & Docker Compose
PostgreSQL 15+
Redis 7+
```

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/mediroute-ai.git
cd mediroute-ai
```

### 2. Environment Setup

```bash
cp .env.example .env
# Edit .env with your configuration (see Environment Variables below)
```

### 3. Start with Docker Compose (Recommended)

```bash
docker-compose up -d
```

This starts:
- FastAPI backend on `http://localhost:8000`
- PostgreSQL on `localhost:5432`
- Redis on `localhost:6379`
- Elasticsearch on `localhost:9200`

### 4. Manual Setup (Development)

```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
python scripts/seed_data.py     # Load hospital directory + procedure benchmarks
uvicorn main:app --reload --port 8000

# Frontend (Web)
cd frontend/web
npm install
npm run dev                     # http://localhost:3000

# Frontend (Mobile)
cd frontend/mobile
npm install
npx expo start
```

---

## ⚙️ Environment Variables

```env
# Application
APP_ENV=development
SECRET_KEY=your-secret-key-here
DEBUG=true

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/mediroute
REDIS_URL=redis://localhost:6379/0

# LLM / AI
OPENAI_API_KEY=your-key-here          # or self-hosted model endpoint
LLM_MODEL=gpt-4-turbo                  # or fine-tuned model name
EMBEDDING_MODEL=text-embedding-3-small

# Search
ELASTICSEARCH_URL=http://localhost:9200

# External APIs
GOOGLE_PLACES_API_KEY=your-key-here   # Hospital location data
TWILIO_ACCOUNT_SID=your-sid           # WhatsApp integration
TWILIO_AUTH_TOKEN=your-token

# Monitoring
SENTRY_DSN=your-dsn
DATADOG_API_KEY=your-key
```

---

## 📁 Project Structure

```
mediroute-ai/
├── backend/
│   ├── main.py                     # FastAPI app entry point
│   ├── api/
│   │   ├── routes/
│   │   │   ├── chat.py             # Conversation & intake endpoints
│   │   │   ├── providers.py        # Provider discovery & ranking
│   │   │   ├── costs.py            # Cost estimation endpoints
│   │   │   └── lender.py           # Lender/insurer API
│   ├── core/
│   │   ├── clinical/
│   │   │   ├── mapper.py           # ICD-10 / SNOMED CT mapping
│   │   │   ├── pathway.py          # Clinical pathway resolution
│   │   │   └── comorbidity.py      # Comorbidity risk adjustments
│   │   ├── providers/
│   │   │   ├── ranking.py          # 8-signal ranking engine
│   │   │   ├── nlp_reviews.py      # Review sentiment pipeline
│   │   │   └── discovery.py        # Hospital/doctor discovery
│   │   ├── costs/
│   │   │   ├── estimator.py        # Component cost calculator
│   │   │   ├── adjustments.py      # Geo/tier/age adjustments
│   │   │   └── confidence.py       # Confidence scoring
│   │   └── responsible_ai/
│   │       ├── disclaimers.py      # Mandatory disclaimer injection
│   │       └── guardrails.py       # No-diagnosis enforcement
│   ├── data/
│   │   ├── hospitals/              # Hospital directory data
│   │   ├── procedures/             # Procedure benchmark data
│   │   └── icd10/                  # ICD-10 ontology files
│   └── tests/
│       ├── test_clinical_mapping.py
│       ├── test_ranking.py
│       └── test_cost_estimation.py
│
├── frontend/
│   ├── web/                        # Next.js web app
│   └── mobile/                     # React Native app
│
├── infrastructure/
│   ├── docker-compose.yml
│   ├── k8s/                        # Kubernetes manifests
│   └── terraform/                  # IaC for AWS
│
├── docs/
│   ├── MediRoute_AI_PRD.docx       # Full Product Requirements Document
│   ├── README_PRD.md               # PRD navigation guide
│   ├── api/                        # OpenAPI / Swagger docs
│   └── architecture/               # Architecture diagrams
│
└── README.md                       # This file
```

---

## 📡 API Reference

Base URL: `https://api.mediroute.ai/v1` (production) | `http://localhost:8000/v1` (local)

### Core Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/chat/message` | Submit a natural language query |
| `GET`  | `/providers/search` | Search and rank providers |
| `POST` | `/costs/estimate` | Get component-level cost estimate |
| `GET`  | `/providers/{id}/profile` | Get full provider profile |
| `POST` | `/lender/pre-qualify` | Lender pre-qualification API |
| `GET`  | `/health` | Service health check |

### Sample Request

```bash
curl -X POST https://api.mediroute.ai/v1/chat/message \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "message": "chest pain when climbing stairs, I am 52 and diabetic",
    "location": { "city": "Nagpur", "pincode": "440001" },
    "preferences": { "budget_tier": "mid", "max_distance_km": 20 }
  }'
```

### Sample Response

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
          "anaesthesia": [12000, 20000],
          "diagnostics": [8000, 18000],
          "medication": [15000, 30000],
          "contingency": [15000, 40000]
        },
        "confidence_score": 0.68,
        "adjustments_applied": ["diabetes_complication_risk", "tier2_city_factor"]
      }
    }
  ],
  "risk_flags": ["diabetes_may_extend_recovery"],
  "disclaimer": "This is an informational estimate only. Not a medical diagnosis. Consult a qualified doctor before making medical or financial decisions."
}
```

---

## 🧪 Running Tests

```bash
# All tests
cd backend
pytest

# Specific module
pytest tests/test_clinical_mapping.py -v

# With coverage
pytest --cov=core --cov-report=html

# Clinical mapping accuracy benchmark
python scripts/eval_clinical_mapping.py --dataset data/test/annotated_queries.json
```

### Target Test Coverage

| Module | Target Coverage |
|--------|----------------|
| Clinical mapping | > 85% accuracy on annotated dataset |
| Cost estimation | ±20% of actual bill in > 70% of cases |
| Provider ranking | NPS > 50 in user testing |
| API response time | P95 < 5 seconds |

---

## 🛡️ Responsible AI Guidelines

All contributors must adhere to these principles:

1. **No diagnosis language** — Never use words like "you have", "you are diagnosed with", or "your condition is" in any output
2. **Always show confidence** — Every estimate must include a calibrated confidence score
3. **Always show ranges** — Cost outputs must be ranges, never single-point values
4. **Always show disclaimers** — The medical disclaimer must appear on every user-facing response
5. **Privacy first** — Health queries are anonymized by default; no PII stored without explicit consent
6. **Audit trail** — All clinical mapping decisions are logged for bias auditing

---

## 🗺️ Roadmap

| Phase | Timeline | Key Deliverables |
|-------|----------|-----------------|
| **Phase 1** — Foundation | Months 1–3 | Clinical mapping engine, hospital data pipeline, cost benchmark store |
| **Phase 2** — Launch | Months 4–6 | Mobile app, web PWA, WhatsApp bot, lender API, 50-city launch |
| **Phase 3** — Intelligence | Months 7–9 | NLP review pipeline, comorbidity refinement, insurer API |
| **Phase 4** — Scale | Months 10–12 | Regional languages, voice input, 200-city coverage |
| **Phase 5** — Ecosystem | Year 2 | Hospital partnerships, real-time pricing API, appointment booking |

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'feat: add your feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

Please read [CONTRIBUTING.md](CONTRIBUTING.md) and ensure all tests pass before submitting a PR.

---

## 📄 License

This project is licensed under the MIT License — see [LICENSE](LICENSE) for details.

---

## 👥 Team

Built for **Hackathon Problem Statement 4(b)** — AI Healthcare Navigator & Cost Estimator for India.

---

*MediRoute AI — Empowering informed medical and financial decisions across India.*