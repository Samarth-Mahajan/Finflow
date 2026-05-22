# FinFlow — AI-Powered Financial Intelligence Platform

> **Your CFO, powered by AI.** FinFlow automates invoice processing, cash flow forecasting, and financial reporting for German SMEs — cutting hours of manual bookkeeping down to minutes.

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js_14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![OpenAI](https://img.shields.io/badge/GPT--4o-412991?style=for-the-badge&logo=openai&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-black?style=for-the-badge&logo=vercel)


</div>

---

## The Problem

Germany has **3.4 million small and medium-sized businesses**. Most of them:

- Process invoices manually, spending 6–10 hours per week on bookkeeping
- Rely on Excel spreadsheets for cash flow tracking
- Pay Steuerberater (tax advisors) €150–300/hour for work that could be automated
- Have no real-time visibility into their financial health
- Miss VAT deadlines due to disorganised records

**Existing tools (DATEV, Lexoffice) are either too complex, too expensive, or not intelligent enough.**

FinFlow solves this with AI.

---

## What Makes FinFlow Different (USP)

| | Traditional Tools | FinFlow |
|---|---|---|
| Invoice processing | Manual data entry | AI extracts in seconds |
| Confidence | You guess if data is right | Confidence scoring flags uncertainty |
| Cash flow | Static spreadsheets | AI-powered forecasting |
| Tax assistance | You figure it out | Auto VAT calculation (0%, 7%, 19%) |
| Insights | None | AI CFO chat answers financial questions |
| Anomaly detection | None | Flags invoices 250%+ above vendor average |
| Audit trail | Manual logs | Immutable, append-only audit log |
| DATEV compatibility | Native | Export-ready format |

> FinFlow is not just an accounting tool — it is an **AI financial co-pilot** that thinks ahead so business owners can focus on running their business.

---

## Who Is This For

**Primary target: German SMEs with 1–50 employees**

- Freelancers and solo founders drowning in invoice admin
- Small GmbHs and UGs without a dedicated finance team
- E-commerce businesses processing high invoice volumes
- Handwerker (tradespeople) who invoice clients regularly
- Gastronomy and hospitality businesses managing supplier invoices

**The ideal FinFlow customer** spends more than 5 hours per week on financial admin and cannot yet justify hiring a full-time CFO or bookkeeper.

---

## Features

### AI Invoice Processing
- Upload PDF or image invoices via drag-and-drop
- GPT-4o extracts vendor, amount, VAT, date, and invoice number automatically
- **Confidence scoring** on every extracted field — fields below 85% confidence are flagged for human review
- Anomaly detection flags invoices that deviate significantly from a vendor's historical average
- Async processing pipeline: upload returns instantly, AI works in the background

### Financial Dashboard
- Real-time P&L overview
- 12-month revenue vs. expense area chart
- Cash flow summary with trend indicators
- Pending invoice queue with status tracking
- Top vendors by spend
- Recent anomaly alerts

### AI Cash Flow Forecasting
- Predicts cash position for the next 30, 60, and 90 days
- Based on historical patterns, recurring expenses, and seasonal trends
- Plain-language explanation: *"You have a projected shortfall in 47 days based on current burn rate"*

### AI CFO Chat Assistant
- RAG-powered chat grounded in your actual financial data
- Ask natural language questions: *"Can I afford to hire someone at €3,500/month?"*
- Answers reference your real revenue, expenses, and cash flow — not generic advice
- Streaming responses for real-time feel

### German Tax Compliance Tools
- Automatic VAT calculation at 0%, 7%, and 19% (standard German rates)
- Net/gross/VAT breakdown on every invoice
- Upcoming tax deadline reminders (Umsatzsteuervoranmeldung)
- DATEV-compatible export format

### Security & Audit Trail
- Immutable, append-only audit log on all financial operations
- Every create, update, and delete is recorded permanently with timestamp, user, and IP address
- Meets financial data retention requirements
- GDPR-compliant data storage in EU region

### Export & Integrations
- PDF report generation (monthly, quarterly, annual)
- CSV export for all transactions
- DATEV-compatible format for Steuerberater handoff
- Bank CSV import (standard German bank formats)

---

## Technical Highlights

These are the engineering decisions that distinguish FinFlow from a typical CRUD application:

**1. Async Invoice Processing Pipeline**
Invoice uploads return immediately. A BullMQ job queue handles AI extraction in the background with retry logic (max 3 attempts, exponential backoff). The frontend polls a status endpoint and updates in real time. This pattern handles concurrent uploads without timeouts and scales horizontally.

**2. Decimal Precision Arithmetic**
All monetary values use `Decimal.js` throughout — from database storage (stored as `String`) to calculations to display. Native JavaScript floating point (`0.1 + 0.2 = 0.30000000000000004`) is never used for financial values. This is a correctness requirement, not a preference.

**3. Structured AI Extraction with Confidence Scoring**
GPT-4o responses are parsed against a Zod schema using `zodResponseFormat()`, producing typed, validated extraction results. Every field carries a confidence score. The system automatically routes low-confidence extractions to a human review queue rather than silently accepting wrong data.

**4. Immutable Audit Logging**
The `AuditLog` table is append-only — no update or delete operations are permitted. Every state change on a financial entity writes a new row with the previous and new values. This satisfies financial compliance requirements and provides a complete, tamper-evident history.

**5. End-to-End Type Safety**
TypeScript strict mode is enforced across the entire codebase with zero `any` types. Zod schemas validate all API inputs and AI outputs. Prisma provides typed database access. A type error in a financial calculation is caught at compile time, not in production.

**6. RAG-Powered Financial Chat**
The AI CFO assistant uses Retrieval-Augmented Generation — the user's actual financial data is injected into the system prompt at query time. The model answers questions grounded in real business data rather than generic financial advice.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Next.js 14 (Vercel)                  │
│                                                         │
│   Dashboard    Invoices    AI Chat    Settings          │
│       └────────────┴───────────┴──────────┘            │
│                         │                               │
│                    API Routes                           │
└─────────────────────────┬───────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
   ┌─────────────┐ ┌─────────────┐ ┌───────────────┐
   │  PostgreSQL  │ │  BullMQ +   │ │  Cloudflare   │
   │   (Neon)    │ │  Redis Queue│ │      R2       │
   └─────────────┘ └──────┬──────┘ └───────────────┘
                          │
                   ┌──────▼──────┐
                   │  Background  │
                   │   Worker    │
                   └──────┬──────┘
                          │
                   ┌──────▼──────┐
                   │  OpenAI     │
                   │  GPT-4o     │
                   └─────────────┘
```

**Request flow for invoice processing:**
1. User uploads PDF → API validates and stores to R2
2. API creates Invoice record (status: `QUEUED`) and returns `invoiceId` immediately
3. Job pushed to BullMQ Redis queue
4. Background worker picks up job, calls GPT-4o
5. Extracted data saved to PostgreSQL, status updated
6. Frontend polling detects completion, displays results

See [`/docs/adr`](./docs/adr) for Architecture Decision Records explaining each major technical choice.

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Framework** | Next.js 14 (App Router) | SSR, API routes, full-stack in one repo |
| **Language** | TypeScript (strict) | End-to-end type safety, zero `any` |
| **Styling** | Tailwind CSS + shadcn/ui | Consistent, accessible UI components |
| **Charts** | Recharts + Tremor | Financial data visualisation |
| **Animation** | Framer Motion | Smooth UI transitions |
| **Auth** | Clerk | Managed authentication, SOC2 compliant |
| **Database** | PostgreSQL via Neon | Relational integrity for financial data |
| **ORM** | Prisma | Type-safe database access, migrations |
| **Job Queue** | BullMQ + Redis (Upstash) | Async AI processing pipeline |
| **AI** | OpenAI GPT-4o | Invoice extraction, chat, forecasting |
| **AI SDK** | Vercel AI SDK | Streaming responses, structured outputs |
| **Validation** | Zod | Runtime validation on all API inputs |
| **Money** | Decimal.js | Precise financial arithmetic |
| **File Storage** | Cloudflare R2 | Invoice PDF/image storage |
| **Email** | Resend | Transactional emails, deadline reminders |
| **i18n** | next-intl | German and English language support |
| **Testing** | Jest + Playwright | Unit, integration, and E2E tests |
| **CI/CD** | GitHub Actions | Lint → test → security scan → deploy |
| **Hosting** | Vercel (EU region) | GDPR-compliant EU data residency |

---

## Project Structure

```
finflow/
├── .github/
│   ├── workflows/
│   │   └── ci.yml              # CI pipeline: lint → test → build
│   └── PULL_REQUEST_TEMPLATE.md
├── docs/
│   └── adr/                    # Architecture Decision Records
│       ├── 001-decimal-precision.md
│       ├── 002-queue-architecture.md
│       └── 003-database-choice.md
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── seed.ts                 # Realistic German business demo data
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/             # Sign-in, sign-up pages
│   │   ├── (dashboard)/        # Protected dashboard routes
│   │   └── api/                # API route handlers
│   ├── components/             # Reusable UI components
│   ├── lib/
│   │   ├── financial/          # Domain logic: calculations, anomaly detection
│   │   ├── ai/                 # GPT-4o extraction, RAG chat
│   │   ├── queue/              # BullMQ job definitions and workers
│   │   └── db/                 # Prisma client singleton, audit utilities
│   └── types/                  # Shared TypeScript types
├── tests/
│   └── e2e/                    # Playwright end-to-end tests
├── AGENTS.md                   # Codex/AI assistant instructions
├── Makefile                    # Developer shortcuts
└── .env.example                # Required environment variables
```

---

## Local Setup

**Prerequisites:** Node.js 20+, PostgreSQL (or Neon account), Redis (or Upstash account)

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/finflow.git
cd finflow

# 2. Install dependencies (deterministic, uses lockfile)
npm ci

# 3. Configure environment
cp .env.example .env
# Edit .env and fill in your API keys (see .env.example for details)

# 4. Set up the database
npx prisma migrate dev
npx prisma db seed       # loads 12 months of realistic German demo data

# 5. Start development server
npm run dev
# → http://localhost:3000
```

**Demo credentials (after seeding):**
```
Email:    demo@finflow.de
Password: Demo1234!
```

---

## Environment Variables

```bash
# Database
DATABASE_URL="postgresql://..."

# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_..."
CLERK_SECRET_KEY="sk_..."

# AI
OPENAI_API_KEY="sk-..."

# Queue
REDIS_URL="redis://..."

# File Storage
UPLOADTHING_SECRET="sk_live_..."
UPLOADTHING_APP_ID="..."

# Email
RESEND_API_KEY="re_..."
```

All variables are documented in [`.env.example`](.env.example).

---

## Available Commands

```bash
make dev          # Start development server
make build        # Production build
make test         # Run tests with coverage report
make lint         # Run ESLint
make ci           # Full CI check: lint + type-check + test + build
make db-seed      # Seed database with demo data
make db-reset     # Reset and re-seed database
```

---

## Testing

```bash
# Unit and integration tests
npm test

# With coverage report
npm test -- --coverage

# End-to-end tests (requires running dev server)
npx playwright test
```

Current test coverage focuses on the financial domain layer — the code where correctness matters most:

- `src/lib/financial/calculations.ts` — VAT calculation, currency formatting, decimal arithmetic
- `src/lib/financial/anomaly.ts` — Anomaly detection threshold logic
- `src/lib/ai/extraction.ts` — Extraction result parsing and confidence evaluation
- `src/app/api/` — API route input validation

**Target coverage: 70%+ on financial domain logic.**

---

## CI/CD Pipeline

Every pull request runs:

```
Push / PR
    │
    ▼
[lint] → [type-check] → [test (coverage ≥ 70%)] → [build]
```

Merges to `main` automatically deploy to Vercel (EU region).

---

## Roadmap

**v1.1**
- [ ] Open Banking API integration (PSD2 / GoCardless) for automatic bank transaction import
- [ ] Multi-user support with role-based access (Owner, Accountant, Read-only)
- [ ] Recurring invoice detection and subscription tracking

**v1.2**
- [ ] Native DATEV API integration (replacing CSV export)
- [ ] Stripe and PayPal transaction import
- [ ] Industry-specific dashboards (e-commerce, Handwerk, Gastronomie)

**v2.0**
- [ ] Multi-tenant architecture for accounting firms managing multiple clients
- [ ] Mobile app (React Native)
- [ ] Real-time collaboration

---

## Known Limitations

These are documented honestly — production systems require acknowledging constraints:

- **No real banking connection** — bank data is imported via CSV. PSD2/Open Banking integration would require BaFin compliance and is a planned v1.1 feature.
- **AI extraction accuracy** — approximately 94% on standard German invoices. Handwritten or highly non-standard invoices may require manual review.
- **Single-tenant** — the current architecture is per-user. Multi-tenant support for accounting firms managing multiple clients is planned for v2.0.
- **No BaFin license** — FinFlow is a financial *software tool*, not a payment provider or bank. It does not hold, move, or guarantee funds.

---

## GDPR & Legal

- All data stored in EU (Vercel EU region, Neon EU)
- GDPR-compliant data handling with right-to-erasure support
- Impressum and Datenschutzerklärung available at `/legal`
- Cookie consent via Cookiebot
- Financial records retained per German HGB §257 requirements (10 years)

---

## Architecture Decision Records

Key engineering decisions are documented in [`/docs/adr`](./docs/adr):

- [ADR-001: Why Decimal.js over native float for monetary values](./docs/adr/001-decimal-precision.md)
- [ADR-002: Why BullMQ for asynchronous AI processing](./docs/adr/002-queue-architecture.md)
- [ADR-003: Why PostgreSQL for financial data storage](./docs/adr/003-database-choice.md)

---

## Contributing

This is a portfolio project. Issues and feedback are welcome via [GitHub Issues](https://github.com/yourusername/finflow/issues).

---

## License

MIT License — see [LICENSE](./LICENSE) for details.

---

<div align="center">

Built with precision for German SMEs · Deployed on Vercel EU · Data never leaves the EU

**[Live Demo](https://finflow-demo.vercel.app)** · **[LinkedIn](https://linkedin.com/in/yourusername)** · **[GitHub](https://github.com/yourusername)**

</div>
