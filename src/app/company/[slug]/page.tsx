import { notFound } from "next/navigation";
import Link from "next/link";
import { getCompanyBySlug, getCompanyStats } from "@/lib/services/company.service";
import { getSalaries } from "@/lib/services/salary.service";
import { getLevelProgression } from "@/lib/services/compare.service";
import { createSalaryBuckets } from "@/lib/compensation";
import { formatCurrency } from "@/lib/utils";
import { StatCard, SalaryTable } from "@/components/salary/salary-table";
import {
  SalaryDistributionChart,
  LevelProgressionChart,
  LocationComparisonChart,
  CompensationBreakdownChart,
} from "@/components/charts/charts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const revalidate = 60;

interface CompanyPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CompanyPageProps) {
  const { slug } = await params;
  const company = await getCompanyBySlug(slug).catch(() => null);
  return {
    title: company ? `${company.name} Compensation` : "Company Not Found",
    description: company
      ? `View compensation insights, salary distribution, and level comparison for ${company.name}.`
      : undefined,
  };
}

export default async function CompanyPage({ params }: CompanyPageProps) {
  const { slug } = await params;

  let company: Awaited<ReturnType<typeof getCompanyBySlug>> = null;
  let stats: Awaited<ReturnType<typeof getCompanyStats>> | null = null;
  let salaries: Awaited<ReturnType<typeof getSalaries>>["data"] = [];
  let levelProgression: Awaited<ReturnType<typeof getLevelProgression>> = [];

  try {
    company = await getCompanyBySlug(slug);
    if (!company) notFound();

    [stats, salaries, levelProgression] = await Promise.all([
      getCompanyStats(company.id),
      getSalaries({
        companies: [company.normalizedName],
        page: 1,
        limit: 50,
        sort: "totalCompensation",
        order: "desc",
      }).then((r) => r.data),
      getLevelProgression(company.id),
    ]);
  } catch {
    notFound();
  }

  const distributionBuckets = createSalaryBuckets(
    salaries.map((s) => s.totalCompensation)
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{company.name}</h1>
          <p className="mt-1 text-slate-500">
            {stats?.count ?? 0} compensation submissions
          </p>
          {company.website && (
            <a
              href={company.website}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-block text-sm text-indigo-600 hover:underline"
            >
              {company.website}
            </a>
          )}
        </div>
        <Link href={`/compare?type=company&entities=${company.normalizedName}`}>
          <Button variant="outline">Compare with others</Button>
        </Link>
      </div>

      {/* Stats */}
      {stats && stats.count > 0 && (
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Median Total Comp" value={formatCurrency(stats.medianTotal)} />
          <StatCard label="Average Total Comp" value={formatCurrency(stats.averageTotal)} />
          <StatCard label="Median Base" value={formatCurrency(stats.medianBase)} />
          <StatCard label="Median Stock" value={formatCurrency(stats.medianStock)} />
        </div>
      )}

      {/* Levels */}
      {company.levels.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-3 text-lg font-semibold text-slate-900">Levels</h2>
          <div className="flex flex-wrap gap-2">
            {company.levels.map((level) => (
              <Badge key={level.id} variant="secondary">
                {level.levelCode} — {level.levelName}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        {distributionBuckets.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Salary Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <SalaryDistributionChart data={distributionBuckets} />
            </CardContent>
          </Card>
        )}

        {stats && stats.count > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Compensation Breakdown (Median)</CardTitle>
            </CardHeader>
            <CardContent>
              <CompensationBreakdownChart
                base={stats.medianBase}
                bonus={stats.medianBonus}
                stock={stats.medianStock}
              />
            </CardContent>
          </Card>
        )}

        {levelProgression.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Level Progression</CardTitle>
            </CardHeader>
            <CardContent>
              <LevelProgressionChart data={levelProgression} />
            </CardContent>
          </Card>
        )}

        {stats && stats.byLocation.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>By Location</CardTitle>
            </CardHeader>
            <CardContent>
              <LocationComparisonChart data={stats.byLocation} />
            </CardContent>
          </Card>
        )}
      </div>

      {/* Salary Table */}
      {salaries.length > 0 && (
        <div>
          <h2 className="mb-4 text-lg font-semibold text-slate-900">All Submissions</h2>
          <SalaryTable
            data={salaries.map((s) => ({
              ...s,
              submittedAt: s.submittedAt.toISOString(),
            }))}
          />
        </div>
      )}
    </div>
  );
}
