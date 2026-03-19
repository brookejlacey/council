# 🏛️ COUNCIL — Your Personal Board of AI Advisors

> **"Every person deserves a board of advisors."**

COUNCIL is an AI-powered deliberation engine that gives every person access to a personal board of specialized advisors. Unlike single-perspective AI chatbots, COUNCIL convenes multiple AI experts who **deliberate, debate each other, and synthesize** their perspectives into actionable guidance — all in real-time.

**Built for the [DigitalOcean Gradient AI Hackathon](https://digitalocean.devpost.com/)**

---

## The Problem

Rich and powerful people have cabinets of advisors — lawyers, financial planners, career strategists, health consultants. Regular people get a single chatbot that gives one perspective and calls it done.

Complex life decisions — losing a job, navigating a legal dispute, planning a career change, managing debt — deserve **multiple expert perspectives** that challenge and build on each other. Not just one answer. A **deliberation**.

## The Solution

COUNCIL provides 8 specialized AI advisors, each with distinct expertise, personality, and reasoning style:

| Advisor | Expertise | Style |
|---------|-----------|-------|
| ♟️ **The Strategist** | Long-term planning, systems thinking | Calm, Socratic, methodical |
| ⚖️ **The Advocate** | Legal rights, bureaucracy, protections | Sharp, assertive, detail-oriented |
| 📊 **The Analyst** | Financial analysis, budgeting, data | Data-driven, blunt, precise |
| 🧭 **The Mentor** | Career growth, skill development | Warm, encouraging, experienced |
| 🔍 **The Critic** | Assumption testing, risk identification | Contrarian, rigorous, steelmanning |
| 💡 **The Creative** | Unconventional solutions, reframing | Playful, lateral, boundary-pushing |
| 🩺 **The Medic** | Health, wellness, stress management | Empathetic, evidence-based |
| 📚 **The Historian** | Precedents, patterns, context | Scholarly, narrative-driven |

### How It Works

1. **You bring a question** — any life decision, dilemma, or challenge
2. **Smart routing** — AI determines which 3-5 advisors are most relevant
3. **Initial perspectives** — each advisor gives their expert take (in parallel)
4. **Cross-examination** — advisors respond to each other, challenging assumptions and adding nuance
5. **Synthesis** — a meta-analysis identifies consensus, disagreements, actionable steps, and risks

You watch the entire deliberation unfold in real-time. The advisors don't just answer — they **think together**.

## DigitalOcean Gradient AI Usage

COUNCIL is built entirely on DigitalOcean's Gradient AI platform, leveraging the full stack:

| Gradient Feature | How COUNCIL Uses It |
|-----------------|-------------------|
| **Serverless Inference** | Powers all 8 advisor agents via the OpenAI-compatible API |
| **Multi-Model** | Llama 3.3 70B for advisors, Claude Sonnet 4.5 for synthesis |
| **Agent Architecture** | Each advisor is a specialized agent with system prompts, tools, and memory |
| **Smart Routing** | AI-powered routing determines which advisors respond to each query |
| **Guardrails** | Content safety for medical/legal/financial advice disclaimers |
| **App Platform** | Full-stack deployment (Python backend + Next.js frontend) |

## Tech Stack

### Backend
- **Python** with **FastAPI** — async WebSocket-based API
- **OpenAI SDK** → DigitalOcean Gradient Serverless Inference
- **SQLAlchemy** + **aiosqlite** — session and conversation persistence
- Multi-agent orchestration engine with parallel execution

### Frontend
- **Next.js 15** with App Router
- **Tailwind CSS v4** — dark-themed council chamber UI
- **Framer Motion** — smooth animations for advisor responses
- **WebSocket** — real-time streaming of deliberation

### Infrastructure
- **DigitalOcean App Platform** — production deployment
- **DigitalOcean Gradient AI** — serverless inference for all AI operations
- SQLite for MVP (ready for DO Managed PostgreSQL)

## Getting Started

### Prerequisites
- Python 3.12+
- Node.js 20+
- A [DigitalOcean account](https://mlh.link/digitalocean-signup) with Gradient AI access

### 1. Clone the repo
```bash
git clone https://github.com/brookejlacey/council.git
cd council
```

### 2. Backend setup
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # or .venv\Scripts\activate on Windows
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and add your DO_MODEL_ACCESS_KEY
```

### 3. Frontend setup
```bash
cd frontend
npm install
```

### 4. Run locally
```bash
# Terminal 1: Backend
cd backend
uvicorn app.main:app --reload --port 8000

# Terminal 2: Frontend
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and bring something to your Council.

### 5. Deploy to DigitalOcean
```bash
doctl apps create --spec app-spec.yaml
```

## Architecture

```
User Input
    │
    ▼
┌─────────────┐
│   Router     │  ← Determines which advisors are relevant
│  (Llama 70B) │
└──────┬──────┘
       │
       ▼
┌──────────────────────────────────────────┐
│         Phase 1: Perspectives            │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐   │
│  │ ♟️   │ │ ⚖️   │ │ 📊   │ │ 🔍   │   │  ← Parallel execution
│  │Strat.│ │Advoc.│ │Analy.│ │Critic│   │
│  └──┬───┘ └──┬───┘ └──┬───┘ └──┬───┘   │
└─────┼────────┼────────┼────────┼────────┘
      │        │        │        │
      ▼        ▼        ▼        ▼
┌──────────────────────────────────────────┐
│      Phase 2: Cross-Examination          │
│  Advisors respond to each other's        │
│  perspectives, challenge assumptions,    │
│  and add nuance                          │
└──────────────────┬───────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────┐
│         Phase 3: Synthesis               │
│  ┌────────────────────────────────────┐  │
│  │ Claude Sonnet 4.5                  │  │
│  │ Integrates all perspectives into:  │  │
│  │ • Areas of agreement               │  │
│  │ • Key disagreements                │  │
│  │ • Prioritized action steps         │  │
│  │ • Risks and caveats               │  │
│  └────────────────────────────────────┘  │
└──────────────────────────────────────────┘
```

## What Makes This Different

| Feature | Typical AI Chatbot | COUNCIL |
|---------|-------------------|---------|
| Perspectives | One perspective | 3-5 specialized perspectives |
| Reasoning | Single response | Multi-phase deliberation |
| Challenge | Agreeable | Built-in Critic who steelmans counterarguments |
| Transparency | Black box | Watch the entire deliberation unfold |
| Depth | Surface-level | Cross-examination reveals nuance |
| Output | Generic advice | Synthesized action plan with dissenting notes |

## License

MIT — see [LICENSE](./LICENSE)
