import { getInsights } from "@/lib/services/insights.service";
import { formatCurrency } from "@/lib/utils";
import { StatCard } from "@/components/salary/salary-table";
import {
  DistributionPieChart,
  GrowthTrendChart,
  CompensationBreakdownChart,
} from "@/components/charts/charts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const revalidate = 60;

export const metadata = {
  title: "Insights Dashboard",
  description: "Platform-wide compensation insights, trends, and distributions.",
};

export default async function InsightsPage() {
  let insights: Awaited<ReturnType<typeof getInsights>> | null = null;

  try {
    insights = await getInsights();
  } catch {
    // DB not connected
  }

  const overview = insights?.overview ?? {
    totalSubmissions: 0,
    medianSalary: 0,
    averageSalary: 0,
    p25: 0,
    p75: 0,
    p90: 0,
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Insights Dashboard</h1>
        <p className="mt-2 text-slate-500">
          Platform-wide compensation analytics and trends.
        </p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Submissions"
          value={overview.totalSubmissions.toLocaleString()}
        />
        <StatCard
          label="Median Salary"
          value={overview.medianSalary > 0 ? formatCurrency(overview.medianSalary) : "—"}
        />
        <StatCard
          label="Average Salary"
          value={overview.averageSalary > 0 ? formatCurrency(overview.averageSalary) : "—"}
        />
        <StatCard
          label="P75 Salary"
          value={overview.p75 > 0 ? formatCurrency(overview.p75) : "—"}
          subtext={`P25: ${overview.p25 > 0 ? formatCurrency(overview.p25) : "—"}`}
        />
      </div>

      {insights && insights.overview.totalSubmissions > 0 && (
        <div className="grid gap-6 lg:grid-cols-2">
          {insights.growthTrend.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Compensation Growth Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <GrowthTrendChart data={insights.growthTrend} />
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Compensation Mix</CardTitle>
            </CardHeader>
            <CardContent>
              <CompensationBreakdownChart
                base={insights.compensationBreakdown.base}
                bonus={insights.compensationBreakdown.bonus}
                stock={insights.compensationBreakdown.stock}
                isPercentage
              />
            </CardContent>
          </Card>

          {insights.roleDistribution.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Role Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <DistributionPieChart data={insights.roleDistribution} />
              </CardContent>
            </Card>
          )}

          {insights.locationDistribution.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Location Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <DistributionPieChart data={insights.locationDistribution} />
              </CardContent>
            </Card>
          )}

          {insights.companyDistribution.length > 0 && (
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Top Companies by Submissions</CardTitle>
              </CardHeader>
              <CardContent>
                <DistributionPieChart data={insights.companyDistribution} />
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
