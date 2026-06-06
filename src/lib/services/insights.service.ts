import prisma from "@/lib/db";
import { median, average, percentile } from "@/lib/utils";
import type { InsightsFilterInput } from "@/lib/validations/salary";
import { subMonths } from "date-fns";

function getPeriodDate(period: string): Date | undefined {
  const now = new Date();
  switch (period) {
    case "3m":
      return subMonths(now, 3);
    case "6m":
      return subMonths(now, 6);
    case "1y":
      return subMonths(now, 12);
    default:
      return undefined;
  }
}

export async function getInsights(
  filters: InsightsFilterInput = { period: "all" }
) {
  const where: Record<string, unknown> = {};
  if (filters.companyId) where.companyId = filters.companyId;
  if (filters.roleId) where.roleId = filters.roleId;
  if (filters.locationId) where.locationId = filters.locationId;

  const periodDate = getPeriodDate(filters.period ?? "all");
  if (periodDate) {
    where.submittedAt = { gte: periodDate };
  }

  const submissions = await prisma.salarySubmission.findMany({
    where,
    include: { company: true, role: true, level: true, location: true },
    orderBy: { submittedAt: "asc" },
  });

  if (submissions.length === 0) {
    return {
      overview: {
        totalSubmissions: 0,
        medianSalary: 0,
        averageSalary: 0,
        p25: 0,
        p75: 0,
        p90: 0,
      },
      roleDistribution: [],
      locationDistribution: [],
      levelDistribution: [],
      companyDistribution: [],
      growthTrend: [],
      compensationBreakdown: { base: 0, bonus: 0, stock: 0 },
    };
  }

  const totals = submissions.map((s) => s.totalCompensation);
  const bases = submissions.map((s) => s.baseSalary);
  const bonuses = submissions.map((s) => s.bonus);
  const stocks = submissions.map((s) => s.stock);

  const roleMap = new Map<string, number>();
  const locationMap = new Map<string, number>();
  const levelMap = new Map<string, number>();
  const companyMap = new Map<string, number>();

  for (const s of submissions) {
    roleMap.set(s.role.name, (roleMap.get(s.role.name) ?? 0) + 1);
    const locKey = `${s.location.city}, ${s.location.country}`;
    locationMap.set(locKey, (locationMap.get(locKey) ?? 0) + 1);
    const levelKey = `${s.level.levelCode}`;
    levelMap.set(levelKey, (levelMap.get(levelKey) ?? 0) + 1);
    companyMap.set(s.company.name, (companyMap.get(s.company.name) ?? 0) + 1);
  }

  const toDistribution = (map: Map<string, number>) =>
    Array.from(map.entries())
      .map(([name, count]) => ({
        name,
        count,
        percentage: Math.round((count / submissions.length) * 100),
      }))
      .sort((a, b) => b.count - a.count);

  const monthMap = new Map<string, number[]>();
  for (const s of submissions) {
    const monthKey = s.submittedAt.toISOString().slice(0, 7);
    if (!monthMap.has(monthKey)) monthMap.set(monthKey, []);
    monthMap.get(monthKey)!.push(s.totalCompensation);
  }

  const growthTrend = Array.from(monthMap.entries())
    .map(([month, values]) => ({
      month,
      median: median(values),
      count: values.length,
    }))
    .sort((a, b) => a.month.localeCompare(b.month));

  const totalComp = totals.reduce((a, b) => a + b, 0);

  return {
    overview: {
      totalSubmissions: submissions.length,
      medianSalary: median(totals),
      averageSalary: average(totals),
      p25: percentile(totals, 25),
      p75: percentile(totals, 75),
      p90: percentile(totals, 90),
    },
    roleDistribution: toDistribution(roleMap),
    locationDistribution: toDistribution(locationMap),
    levelDistribution: toDistribution(levelMap),
    companyDistribution: toDistribution(companyMap),
    growthTrend,
    compensationBreakdown: {
      base: Math.round((bases.reduce((a, b) => a + b, 0) / totalComp) * 100),
      bonus: Math.round((bonuses.reduce((a, b) => a + b, 0) / totalComp) * 100),
      stock: Math.round((stocks.reduce((a, b) => a + b, 0) / totalComp) * 100),
    },
  };
}

export async function getPlatformStats() {
  const [submissionCount, companyCount, roleCount, locationCount] =
    await Promise.all([
      prisma.salarySubmission.count(),
      prisma.company.count(),
      prisma.role.count(),
      prisma.location.count(),
    ]);

  const avgResult = await prisma.salarySubmission.aggregate({
    _avg: { totalCompensation: true },
  });

  const allTotals = await prisma.salarySubmission.findMany({
    select: { totalCompensation: true },
  });

  return {
    submissionCount,
    companyCount,
    roleCount,
    locationCount,
    medianSalary: median(allTotals.map((s) => s.totalCompensation)),
    averageSalary: Math.round(avgResult._avg.totalCompensation ?? 0),
  };
}
