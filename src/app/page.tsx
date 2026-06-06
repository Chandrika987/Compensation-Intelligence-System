import Link from "next/link";
import { Search, TrendingUp, BarChart3, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/salary/salary-table";
import { getPlatformStats } from "@/lib/services/insights.service";
import { getTrendingCompanies } from "@/lib/services/company.service";
import { formatCurrency, formatCompactCurrency } from "@/lib/utils";

export const revalidate = 300;

export default async function LandingPage() {
  let stats = {
    submissionCount: 0,
    companyCount: 0,
    roleCount: 0,
    locationCount: 0,
    medianSalary: 0,
    averageSalary: 0,
  };
  let trending: Awaited<ReturnType<typeof getTrendingCompanies>> = [];

  try {
    [stats, trending] = await Promise.all([
      getPlatformStats(),
      getTrendingCompanies(8),
    ]);
  } catch {
    // Database not connected yet — show empty state
  }

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggIGQ9Ik0zNiAzNGg0djJoLTR6bS0xMC0xMGg0djJoLTR6bS0xMC0xMGg0djJoLTR6bTAgMjBoNHYyaC00em0xMC0xMGg0djJoLTR6bTAgMjBoNHYyaC00em0xMC0xMGg0djJoLTR6bTAgMjBoNHYyaC00em0xMCAxMGg0djJoLTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="max-w-3xl">
            <p className="mb-4 inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-sm text-indigo-100 backdrop-blur-sm">
              Compensation Intelligence — Not a job portal
            </p>
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Levels matter more than{" "}
              <span className="text-indigo-200">job titles</span>
            </h1>
            <p className="mt-6 text-lg text-indigo-100 sm:text-xl">
              Compare total compensation across companies, levels, locations, and roles.
              Make data-driven career decisions with transparent salary intelligence.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/explorer">
                <Button size="lg" className="w-full bg-white text-indigo-700 hover:bg-indigo-50 sm:w-auto">
                  <Search className="h-5 w-5" />
                  Explore Salaries
                </Button>
              </Link>
              <Link href="/submit">
                <Button size="lg" variant="outline" className="w-full border-white/30 bg-white/10 text-white hover:bg-white/20 sm:w-auto">
                  Submit Your Compensation
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Salary Submissions"
            value={stats.submissionCount.toLocaleString()}
          />
          <StatCard
            label="Companies"
            value={stats.companyCount.toLocaleString()}
          />
          <StatCard
            label="Median Total Comp"
            value={stats.medianSalary > 0 ? formatCurrency(stats.medianSalary) : "—"}
          />
          <StatCard
            label="Average Total Comp"
            value={stats.averageSalary > 0 ? formatCurrency(stats.averageSalary) : "—"}
          />
        </div>
      </section>

      {/* Trending Companies */}
      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Trending Companies</h2>
          <Link href="/explorer" className="flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {trending.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {trending.map((company) => {
              const totals = company.submissions.map((s) => s.totalCompensation);
              const median =
                totals.length > 0
                  ? totals.sort((a, b) => a - b)[Math.floor(totals.length / 2)]
                  : 0;

              return (
                <Link key={company.id} href={`/company/${company.normalizedName}`}>
                  <Card className="transition-shadow hover:shadow-md">
                    <CardContent className="p-5">
                      <h3 className="font-semibold text-slate-900">{company.name}</h3>
                      <p className="mt-1 text-sm text-slate-500">
                        {company._count.submissions} submissions
                      </p>
                      {median > 0 && (
                        <p className="mt-2 text-lg font-bold text-indigo-600">
                          {formatCompactCurrency(median)} median
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="py-8 text-center text-slate-500">
              <p>No company data yet. Be the first to{" "}
                <Link href="/submit" className="text-indigo-600 hover:underline">submit compensation</Link>.
              </p>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Features */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-bold text-slate-900">
            Compensation Intelligence, Not Salary Listings
          </h2>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            <Card>
              <CardHeader>
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100">
                  <BarChart3 className="h-5 w-5 text-indigo-600" />
                </div>
                <CardTitle>Level-First Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-500">
                  Compare L5 at Google vs E5 at Meta. Our level-centric model makes
                  cross-company comparison meaningful.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-100">
                  <TrendingUp className="h-5 w-5 text-cyan-600" />
                </div>
                <CardTitle>Total Compensation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-500">
                  Base + Bonus + Stock = Total Compensation. Full breakdown,
                  not just base salary.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
                  <Search className="h-5 w-5 text-emerald-600" />
                </div>
                <CardTitle>Multi-Dimensional Filters</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-500">
                  Filter by company, role, level, location, experience, and salary range.
                  Shareable URL-based filter state.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </>
  );
}
