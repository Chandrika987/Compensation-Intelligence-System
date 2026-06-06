# CompIntel — Compensation Intelligence Platform

A production-quality compensation intelligence platform inspired by Levels.fyi, 6figr, AmbitionBox, and Glassdoor. **This is not a job portal** — it helps users compare total compensation intelligently across companies, levels, locations, and roles.

> **Core Principle:** Levels matter more than job titles.

## Features

- 🔍 **Salary Explorer** — Browse, filter, and sort compensation data across companies, levels, locations, and roles
- 📊 **Visual Analytics** — 8+ interactive charts (salary distribution, compensation breakdown, trends, comparisons)
- 🏢 **Company Details** — View median salaries, compensation ranges, and detailed analytics per company
- ⚖️ **Multi-Dimensional Comparison** — Compare companies, levels, locations, and roles side-by-side
- 📈 **Insights Dashboard** — Platform-wide trends, distributions, and growth patterns
- ✏️ **Compensation Submission** — Submit anonymously with real-time total compensation preview
- 🔒 **Data Integrity** — Fingerprint-based deduplication and normalization to prevent spam
- ⚡ **Fast & Cached** — ISR (Incremental Static Regeneration) and Prisma indexing for sub-second queries
- 📱 **Responsive Design** — Mobile-first UI with TailwindCSS 4

## Tech Stack


- **Frontend:** Next.js 15 (App Router), React 19, TypeScript, TailwindCSS 4
- **Backend:** Next.js API Routes, Prisma ORM
- **Database:** PostgreSQL (Neon)
- **Charts:** Recharts
- **Validation:** Zod
- **Deployment:** Vercel
- **Testing:** Vitest + Testing Library

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database (Neon recommended)

### Setup

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Edit .env with your Neon DATABASE_URL

# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed sample data
npm run db:seed

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── app/                    # Pages & API routes
│   ├── api/               # REST API endpoints
│   ├── company/[slug]/    # Company detail page
│   ├── compare/           # Comparison tool
│   ├── explorer/          # Salary explorer with filters
│   ├── insights/          # Analytics dashboard
│   └── submit/            # Compensation submission
├── components/
│   ├── charts/            # Recharts visualizations
│   ├── filters/           # Multi-select filter bar
│   ├── layout/            # Header, Footer
│   ├── salary/            # Salary table, submit form
│   └── ui/                # Design system
├── lib/
│   ├── services/          # Business logic layer
│   ├── validations/       # Zod schemas
│   └── ...                # Utils, DB, compensation logic
docs/
├── PRD.md                 # Product requirements
├── ARCHITECTURE.md        # Architecture decisions
├── COMPETITIVE_ANALYSIS.md
└── PHASE_CHECKLISTS.md
prisma/
├── schema.prisma          # Database schema
└── seed.ts                # Sample data seeder
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/salaries` | List salaries with filtering, sorting, pagination |
| GET | `/api/salaries?options=true` | Get filter options |
| GET | `/api/companies` | List companies |
| GET | `/api/company/[slug]` | Company details + stats |
| POST | `/api/salary` | Submit compensation data |
| GET | `/api/compare` | Multi-dimensional comparison |
| GET | `/api/insights` | Platform analytics |
| GET | `/api/insights?stats=true` | Platform summary stats |

## Compensation Formula

```
Total Compensation = Base Salary + Bonus + Stock
```

Missing bonus/stock default to 0.

## Environment Variables

Create a `.env` file in the root directory:

```bash
# Database connection string (PostgreSQL)
DATABASE_URL="postgresql://user:password@host:5432/dbname"

# Optional: Neon-specific
DATABASE_URL_UNPOOLED="postgresql://user:password@host/dbname"

# Optional: App URL for metadata
NEXT_PUBLIC_APP_URL="https://your-app.vercel.app"
```

See `.env.example` for a complete template.

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run test` | Run unit tests |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema to DB |
| `npm run db:seed` | Seed sample data |
| `npm run db:studio` | Open Prisma Studio |

## Testing

```bash
# Run all tests
npm run test

# Watch mode
npm run test:watch
```

**Test Coverage:**
- ✅ Compensation calculations (total, by component)
- ✅ Company normalization and deduplication
- ✅ Statistical utilities (median, percentile, average)
- ✅ Zod validation schemas (valid, invalid, defaults)
- ✅ Salary bucketing and grouping
- ✅ Currency formatting

## Architecture Highlights

### Service Layer Separation
- **`company.service.ts`** — Company retrieval, normalization, and analytics
- **`salary.service.ts`** — Salary submission, filtering, and aggregation
- **`compare.service.ts`** — Multi-dimensional comparison logic
- **`insights.service.ts`** — Platform-wide analytics and trends

### Data Integrity
- **Fingerprint Hashing** — MD5 hash of `company + level + location + base + bonus + stock` prevents duplicate submissions
- **Normalization** — Company names are normalized (lowercase, trimmed) and deduplicated
- **Database Indexes** — 8 strategic indexes on `SalarySubmission` for fast queries
- **Unique Constraints** — Composite keys on `(company, level)` and `(company, location)`

### API Design
- **Standardized Responses** — All endpoints return `{ data, error, meta }` structure
- **Zod Validation** — Request/response validation at route level
- **Cache-Control Headers** — 60s s-maxage for public, paginated endpoints
- **Error Handling** — Graceful 400/404/500 responses with context

## Performance & Optimizations

- **ISR (Incremental Static Regeneration)** — Pages cached for 60–300s, background updates on next request
- **Prisma Query Optimization** — Select-based queries, indexed lookups, aggregation at database level
- **Pagination** — 50 records per page by default to reduce payload size
- **Connection Pooling** — PostgreSQL adapter with Neon best practices
- **Font Optimization** — Next.js auto-optimizes system fonts
- **Image Optimization** — Recharts charts rendered server-side where possible

## Troubleshooting

### "Cannot find Prisma client"
```bash
# Regenerate Prisma client
npm run db:generate
```

### "Connection refused" or "ECONNREFUSED"
- Verify `DATABASE_URL` in `.env` is correct
- Check Neon database is active (not paused)
- For local PostgreSQL: ensure service is running

### "Unique constraint violation"
- Indicates duplicate company/level or company/location combination
- Check seeded data vs. new submissions
- Use `npm run db:studio` to inspect the database

### "Build fails: 'prisma' not found"
- Ensure `postinstall` hook ran: `npm install`
- Manually generate: `npm run db:generate`

### Tests fail on CI/CD
- Set `DATABASE_URL` environment variable in CI config
- Tests use Vitest with jsdom (no real database required for unit tests)

## Deployment (Vercel + Neon)

1. Create a Neon PostgreSQL database at [neon.tech](https://neon.tech)
2. Push this repo to GitHub
3. Import to Vercel
4. Set environment variables:
   - `DATABASE_URL` — Neon connection string
   - `NEXT_PUBLIC_APP_URL` — Your Vercel URL
5. Deploy — Vercel runs `prisma generate && next build`

## Future Roadmap

- [ ] **User Authentication** — NextAuth.js for verified submissions
- [ ] **Multi-Currency Support** — Convert salaries to local currencies
- [ ] **AI Offer Analysis** — Analyze offers using OpenAI API
- [ ] **Email Verification** — Verify submissions via email
- [ ] **Admin Dashboard** — Moderate submissions, view analytics
- [ ] **Rate Limiting** — Prevent spam submissions
- [ ] **E2E Tests** — Playwright for full-flow testing
- [ ] **Mobile App** — React Native version

## Documentation

- [Product Requirements](docs/PRD.md)
- [Architecture Decisions](docs/ARCHITECTURE.md)
- [Competitive Analysis](docs/COMPETITIVE_ANALYSIS.md)
- [Phase Checklists](docs/PHASE_CHECKLISTS.md)

## Author

Built as a production-quality portfolio project showcasing full-stack development with **Next.js 15, React 19, TypeScript, PostgreSQL, and Vercel**.

**Connect:**
-  [Github-handle](https://github.com/Chandrika987)
-  [Linkedin](https://linkedin.com/in/chandrikapala)


## License

MIT License - Open Source

