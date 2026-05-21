# FinFlow — AI Financial Platform

## Project Context
This is a B2B SaaS fintech application for German SMEs.
It is a RESUME/PORTFOLIO project demonstrating senior-level
engineering decisions. Code quality, architecture, and
documentation matter more than feature completeness.

## Stack
- Next.js 14 App Router + TypeScript (strict mode, zero `any`)
- PostgreSQL via Prisma ORM
- Clerk for authentication
- OpenAI GPT-4o for AI features
- BullMQ + Redis for job queues
- Tailwind CSS + shadcn/ui
- Decimal.js for ALL monetary values (never native float)
- Zod for ALL validation (API + forms)

## Non-negotiables
- NEVER use `any` TypeScript type
- NEVER use native float for money — always Decimal.js
- ALL API routes must have Zod validation
- ALL financial operations must write to audit_log table
- Use `npm ci` not `npm i` in any scripts
- Conventional commits format
- German VAT rates only: 0%, 7%, 19%

## File Structure
src/
  app/          → Next.js App Router pages
  components/   → UI components
  lib/
    financial/  → domain logic (calculations, formatting)
    ai/         → AI extraction, chat logic
    queue/      → BullMQ job definitions
    db/         → Prisma client singleton
  server/       → API route handlers
  types/        → shared TypeScript types

## Done When (always verify)
- TypeScript compiles with zero errors: `npm run build`
- ESLint passes: `npm run lint`
- No `any` types in src/