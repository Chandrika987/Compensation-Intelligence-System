# Architecture Decisions

## System Overview

```
┌─────────────────────────────────────────────────────────┐
│                     Vercel Edge/CDN                      │
├─────────────────────────────────────────────────────────┤
│                  Next.js 15 App Router                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Server       │  │ Client       │  │ API Routes   │  │
│  │ Components   │  │ Components   │  │ (Route       │  │
│  │ (SSR/RSC)    │  │ (Charts,     │  │  Handlers)   │  │
│  │              │  │  Filters)    │  │              │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
│         │                 │                  │          │
│         └─────────────────┼──────────────────┘          │
│                           │                             │
│                    ┌──────▼──────┐                      │
│                    │  Service     │                      │
│                    │  Layer       │                      │
│                    │  (lib/       │                      │
│                    │   services/) │                      │
│                    └──────┬──────┘                      │
│                           │                             │
│                    ┌──────▼──────┐                      │
│                    │  Prisma ORM  │                      │
│                    └──────┬──────┘                      │
└───────────────────────────┼─────────────────────────────┘
                            │
                    ┌───────▼───────┐
                    │ Neon Postgres │
                    └───────────────┘
```

## Key Architecture Decisions

### ADR-1: Next.js App Router with Server Components

**Decision:** Use React Server Components for data-heavy pages (company, insights, explorer initial load).

**Rationale:** Reduces client bundle size, enables direct DB access without waterfall API calls, improves SEO for company pages.

**Trade-off:** Charts require `"use client"` boundary — we isolate client components to chart/filter wrappers.

### ADR-2: Prisma ORM with Neon PostgreSQL

**Decision:** Prisma 7 with Neon serverless Postgres.

**Rationale:** Type-safe queries, migration support, connection pooling via Neon, Vercel-native deployment.

**Indexing Strategy:**
- `Company.normalizedName` — unique, lookup by slug
- `SalarySubmission(companyId, levelId)` — company page queries
- `SalarySubmission(roleId, locationId)` — filter queries
- `SalarySubmission.totalCompensation` — sort/range filter
- `SalarySubmission.submittedAt` — trend queries
- `SalarySubmission.fingerprint` — duplicate prevention
- `Level(companyId, levelCode)` — unique per company

### ADR-3: Service Layer Pattern

**Decision:** Business logic in `src/lib/services/`, not in route handlers.

**Rationale:** Testable, reusable between SSR pages and API routes, single source of truth for query logic.

```
src/lib/services/
  salary.service.ts      — CRUD, filtering, pagination
  company.service.ts     — Company lookup, stats
  compare.service.ts     — Multi-dimensional comparison
  insights.service.ts    — Aggregations, trends
```

### ADR-4: Zod Validation at Boundaries

**Decision:** Every API input validated with Zod schemas in `src/lib/validations/`.

**Rationale:** Runtime type safety, consistent error messages, schema reuse on client forms.

### ADR-5: URL-Based Filter Persistence

**Decision:** All explorer/compare filters encoded in URL search params.

**Rationale:** Shareable links, browser back/forward support, SSR-compatible initial state.

**Format:** `?companies=google,meta&roles=swe&levels=L5&locations=sf&minSalary=200000&maxSalary=500000&page=1&sort=totalCompensation&order=desc`

### ADR-6: Company Normalization Pipeline

**Decision:** Normalize on write, store `normalizedName` as lowercase slug key.

```typescript
normalizeCompanyName("  GOOGLE  ") → { name: "Google", normalizedName: "google" }
slugFromNormalizedName("google") → "google"
```

**Duplicate Prevention:**
```typescript
fingerprint = sha256(companyId + roleId + levelId + locationId + baseSalary + bonus + stock + yearsExperience)
```

### ADR-7: Caching Strategy

**Decision:** 
- API routes: `Cache-Control: s-maxage=60, stale-while-revalidate=300`
- Server Components: `unstable_cache` with 60s revalidation for insights/company stats
- Static: Landing page hero/stats revalidated every 5 minutes

### ADR-8: Folder Structure

```
src/
├── app/                    # Next.js App Router pages + API
│   ├── api/               # Route handlers
│   ├── company/[slug]/    # Company detail page
│   ├── compare/           # Comparison page
│   ├── explorer/          # Salary explorer
│   ├── insights/          # Insights dashboard
│   ├── submit/            # Submission form
│   ├── layout.tsx
│   └── page.tsx           # Landing page
├── components/
│   ├── charts/            # Recharts visualizations
│   ├── filters/           # Filter bar, multi-select
│   ├── layout/            # Header, Footer, Shell
│   ├── salary/            # Salary table, cards
│   └── ui/                # Design system primitives
├── lib/
│   ├── services/          # Business logic
│   ├── validations/       # Zod schemas
│   ├── db.ts              # Prisma client singleton
│   ├── utils.ts           # cn(), formatters
│   ├── compensation.ts    # TC calculation
│   └── company-normalization.ts
├── types/                 # Shared TypeScript types
└── generated/prisma/      # Prisma generated client
```

### ADR-9: Chart Architecture

**Decision:** Recharts with responsive containers, lazy-loaded via dynamic import where needed.

**Charts:**
1. Salary Distribution (histogram/bar)
2. Compensation Breakdown (stacked bar: base/bonus/stock)
3. Company Comparison (grouped bar)
4. Level Progression (line/area)
5. Location Comparison (horizontal bar)

### ADR-10: Error Handling

**Decision:** Standardized API error response:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable message",
    "details": [{ "field": "baseSalary", "message": "Must be positive" }]
  }
}
```

HTTP status codes: 400 (validation), 404 (not found), 409 (duplicate), 500 (internal).

---

## Deployment Architecture

```
GitHub → Vercel (Preview + Production)
              │
              ├── Next.js Serverless Functions (API routes)
              ├── Edge Middleware (optional future: geo routing)
              └── Static Assets (CDN)

Neon PostgreSQL
  ├── Production branch
  └── Preview branches (future)
```

**Environment Variables:**
- `DATABASE_URL` — Neon connection string
- `NEXT_PUBLIC_APP_URL` — Canonical URL for OG tags
