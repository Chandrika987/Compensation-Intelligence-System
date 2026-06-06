# Product Requirements Document

## Compensation Intelligence Platform

**Version:** 1.0  
**Status:** Phase 1 Complete  
**Last Updated:** June 2026

---

## 1. Vision

Build a production-quality compensation intelligence platform that helps professionals compare total compensation across companies, levels, locations, and roles — with **levels mattering more than job titles**.

This is **NOT** a job portal or salary listing website. It is a data-driven compensation comparison engine.

---

## 2. Target Users

| Persona | Need |
|---------|------|
| **Software Engineer** | Compare TC at L5 across FAANG vs startup |
| **Product Manager** | Understand level progression compensation curves |
| **HR / Comp Analyst** | Benchmark against peer companies by level |
| **Job Switcher** | Evaluate offer against market median for their level + location |

---

## 3. Core User Stories

### US-1: Browse Salary Submissions
> As a user, I want to browse anonymized salary submissions with filters so I can explore market data.

**Acceptance Criteria:**
- Paginated table with company, role, level, location, base, bonus, stock, TC
- Sort by any numeric column
- Multi-select filters with URL persistence

### US-2: Compare Compensation Across Companies
> As a user, I want to select 2+ companies and see side-by-side compensation metrics.

**Acceptance Criteria:**
- Median/average TC per company
- Bar chart comparison
- Filterable by role, level, location

### US-3: Compare Compensation Across Levels
> As a user, I want to see how compensation progresses across levels within a company.

**Acceptance Criteria:**
- Level progression chart
- Median TC per level
- Sample size indicators

### US-4: Compare Compensation Across Locations
> As a user, I want to compare the same role/level across different cities.

**Acceptance Criteria:**
- Location comparison chart
- City-level median TC

### US-5: Compare Compensation Across Roles
> As a user, I want to compare compensation between roles (e.g., SWE vs PM) at the same level.

### US-6: Company Compensation Insights
> As a user, I want a dedicated company page showing distribution, charts, and salary table.

**Route:** `/company/[slug]`

### US-7: Compensation Trends
> As a user, I want to see median salary, growth trends, and distribution on an insights dashboard.

**Route:** `/insights`

### US-8: Search Salary Records
> As a user, I want instant search across companies, roles, and locations.

### US-9: Submit Compensation
> As a user, I want to anonymously submit my compensation with validation.

**Route:** `/submit`

---

## 4. Compensation Model

```
Total Compensation = Base Salary + Bonus + Stock

Defaults:
  bonus = 0 (if missing)
  stock = 0 (if missing)
```

All monetary values stored as integers (USD cents or whole USD — we use whole USD integers for simplicity).

---

## 5. Data Quality Requirements

| Rule | Implementation |
|------|----------------|
| Company normalization | `Google`, `google`, `GOOGLE` → `Google` |
| Negative salary rejection | Zod `.min(0)` |
| Invalid location rejection | Required city + country |
| Invalid level rejection | Must belong to company |
| Duplicate prevention | SHA-256 fingerprint unique constraint |
| Auto TC calculation | Server-side on create |

---

## 6. Non-Functional Requirements

- Mobile responsive (Tailwind breakpoints)
- SSR for company pages and insights
- API pagination (default 20, max 100)
- Response caching (60s revalidation)
- Loading, empty, and error states on all pages
- WCAG 2.1 AA accessibility (semantic HTML, ARIA labels, keyboard nav)

---

## 7. Out of Scope (v1)

- User authentication / accounts
- Job listings
- Company reviews
- Interview questions
- AI offer analysis
- Multi-currency conversion

---

## 8. Success Metrics

| Metric | Target |
|--------|--------|
| Page load (LCP) | < 2.5s |
| API p95 latency | < 300ms |
| Submission validation pass rate | > 95% |
| Filter-to-result time | < 500ms |
