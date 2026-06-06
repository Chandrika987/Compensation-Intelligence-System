# Competitive Analysis

## Feature Comparison Sheet

| Feature | Levels.fyi | 6figr | AmbitionBox | Glassdoor | **Our Platform** |
|---------|-----------|-------|-------------|-----------|------------------|
| **Primary Focus** | Level-normalized TC for tech | AI salary + career tools (India-heavy) | Reviews + salary (India) | Reviews + crowdsourced salaries | **Level-first compensation intelligence** |
| **Level Standardization** | ✅ Proprietary SWE framework (L3–L8) | ⚠️ Experience bands, not universal levels | ❌ Title + YOE only | ❌ Job title only | ✅ **Company-specific levels + cross-company comparison** |
| **Total Compensation Breakdown** | ✅ Base + Stock + Bonus | ✅ Full package analysis | ⚠️ CTC ranges (often opaque) | ⚠️ Base-heavy, inconsistent | ✅ **Base + Bonus + Stock = TC** |
| **Company Comparison** | ✅ By level | ✅ Cross-company | ✅ Side-by-side | ✅ VS compare tool | ✅ **Multi-dimensional compare** |
| **Location Comparison** | ✅ Salary heatmap | ✅ City/region filters | ✅ India cities | ✅ By location | ✅ **Location-aware filtering** |
| **Role Comparison** | ✅ Expanding beyond SWE | ✅ By skills/title | ✅ By department | ✅ By job title | ✅ **Role + Level matrix** |
| **Trends & Insights** | ✅ Annual pay reports | ✅ Market trends | ⚠️ Basic averages | ⚠️ Outdated averages | ✅ **Median, growth, distributions** |
| **Data Submission** | ✅ Anonymous | ✅ Verified profiles | ✅ Employee submissions | ✅ Anonymous | ✅ **Validated + deduplicated** |
| **Search & Filters** | ✅ Data explorer | ✅ Advanced search | ✅ Company/role filters | ⚠️ Basic | ✅ **Multi-select + URL persistence** |
| **Visualizations** | ✅ Heatmaps, charts | ⚠️ Limited public charts | ⚠️ Range tables | ❌ Minimal | ✅ **Distribution, breakdown, progression** |
| **Job Portal** | ❌ (offer tools only) | ✅ JobGPT auto-apply | ✅ Job search | ✅ Job listings | ❌ **Not a job portal** |
| **Reviews/Culture** | ❌ | ❌ | ✅ Core feature | ✅ Core feature | ❌ **Compensation-only focus** |
| **AI Features** | ⚠️ Offer tools | ✅ Offer GPT, Career Roast | ❌ | ❌ | 🔜 Phase 2 roadmap |
| **Data Quality** | ✅ Community-verified | ✅ Verified profiles | ⚠️ Self-reported ranges | ❌ Unverified, stale | ✅ **Normalization + validation + dedup** |

## Key Observations

### Levels.fyi
- **Strength:** Level normalization is the killer feature. Google L4 ≈ Meta E4 mapping makes cross-company comparison meaningful.
- **Strength:** Total compensation (not just base) with stock/bonus breakdown.
- **Strength:** Annual pay reports establish thought leadership and SEO.
- **Gap:** Heavy tech/SWE bias; limited India coverage.
- **Lesson:** **Levels > titles.** Our platform must treat level as a first-class dimension.

### 6figr
- **Strength:** Strong India market presence with verified salary profiles.
- **Strength:** AI-powered offer analysis and career path visualization ("Switch" talent flow).
- **Strength:** Percentile-based reporting (P25–P75, top 1%, top 10%).
- **Gap:** Conflates career tools with compensation data; job portal features dilute focus.
- **Lesson:** Percentile distributions and experience segmentation are valuable UX patterns.

### AmbitionBox
- **Strength:** Massive dataset (4Cr+ salary insights) in India.
- **Strength:** In-hand salary calculator adds practical utility.
- **Gap:** Salary data locked behind "Unlock" paywall for detailed ranges.
- **Gap:** Title-based, not level-based; CTC often bundles components opaquely.
- **Lesson:** Free access to breakdown data builds trust; experience-range tables are intuitive.

### Glassdoor
- **Strength:** Brand recognition; "Know Your Worth" calculator is simple and accessible.
- **Strength:** Community-driven salary sharing at scale.
- **Gap:** No level standardization — "Software Engineer" at Google ≠ "Software Engineer" at startup.
- **Gap:** Unverified, inconsistent self-reported data; averages skewed by outliers and stale entries.
- **Gap:** No component breakdown (base vs equity vs bonus often conflated).
- **Lesson:** **Avoid title-only aggregation.** Median > mean. Require structured submission fields.

## Our Differentiation Strategy

1. **Level-first architecture** — Every query, chart, and comparison centers on normalized levels within companies.
2. **Transparent TC formula** — `Total = Base + Bonus + Stock` with explicit defaults (0 for missing bonus/stock).
3. **Compensation-only focus** — No job listings, no reviews, no interview prep. Pure intelligence.
4. **Structured data quality** — Company normalization, duplicate prevention, Zod validation at every boundary.
5. **Multi-dimensional comparison** — Company × Level × Location × Role in one platform.
6. **URL-persisted filters** — Shareable, bookmarkable comparison views.
