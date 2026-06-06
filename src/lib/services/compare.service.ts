import prisma from "@/lib/db";
import { average, median } from "@/lib/utils";
import type { CompareInput } from "@/lib/validations/salary";

interface ComparisonResult {
  entity: string;
  entityId: string;
  count: number;
  medianTotal: number;
  averageTotal: number;
  medianBase: number;
  medianBonus: number;
  medianStock: number;
  p25: number;
  p75: number;
}

function computeStats(values: number[], bases: number[], bonuses: number[], stocks: number[]): Omit<ComparisonResult, "entity" | "entityId"> {
  const sorted = [...values].sort((a, b) => a - b);
  const p25Idx = Math.floor(sorted.length * 0.25);
  const p75Idx = Math.floor(sorted.length * 0.75);

  return {
    count: values.length,
    medianTotal: median(values),
    averageTotal: average(values),
    medianBase: median(bases),
    medianBonus: median(bonuses),
    medianStock: median(stocks),
    p25: sorted[p25Idx] ?? 0,
    p75: sorted[p75Idx] ?? 0,
  };
}

export async function compareEntities(input: CompareInput): Promise<ComparisonResult[]> {
  const baseWhere: Record<string, unknown> = {};
  if (input.roleId) baseWhere.roleId = input.roleId;
  if (input.levelId) baseWhere.levelId = input.levelId;
  if (input.locationId) baseWhere.locationId = input.locationId;
  if (input.companyId) baseWhere.companyId = input.companyId;

  const results: ComparisonResult[] = [];

  switch (input.type) {
    case "company": {
      for (const slug of input.entities) {
        const company = await prisma.company.findUnique({
          where: { normalizedName: slug.toLowerCase() },
        });
        if (!company) continue;

        const submissions = await prisma.salarySubmission.findMany({
          where: { ...baseWhere, companyId: company.id },
        });

        if (submissions.length === 0) {
          results.push({
            entity: company.name,
            entityId: company.id,
            count: 0,
            medianTotal: 0,
            averageTotal: 0,
            medianBase: 0,
            medianBonus: 0,
            medianStock: 0,
            p25: 0,
            p75: 0,
          });
          continue;
        }

        results.push({
          entity: company.name,
          entityId: company.id,
          ...computeStats(
            submissions.map((s) => s.totalCompensation),
            submissions.map((s) => s.baseSalary),
            submissions.map((s) => s.bonus),
            submissions.map((s) => s.stock)
          ),
        });
      }
      break;
    }

    case "level": {
      for (const levelId of input.entities) {
        const level = await prisma.level.findUnique({
          where: { id: levelId },
          include: { company: true },
        });
        if (!level) continue;

        const submissions = await prisma.salarySubmission.findMany({
          where: { ...baseWhere, levelId: level.id },
        });

        results.push({
          entity: `${level.company.name} ${level.levelCode}`,
          entityId: level.id,
          ...submissions.length > 0
            ? computeStats(
                submissions.map((s) => s.totalCompensation),
                submissions.map((s) => s.baseSalary),
                submissions.map((s) => s.bonus),
                submissions.map((s) => s.stock)
              )
            : {
                count: 0,
                medianTotal: 0,
                averageTotal: 0,
                medianBase: 0,
                medianBonus: 0,
                medianStock: 0,
                p25: 0,
                p75: 0,
              },
        });
      }
      break;
    }

    case "location": {
      for (const locationId of input.entities) {
        const location = await prisma.location.findUnique({
          where: { id: locationId },
        });
        if (!location) continue;

        const submissions = await prisma.salarySubmission.findMany({
          where: { ...baseWhere, locationId: location.id },
        });

        const label = location.state
          ? `${location.city}, ${location.state}`
          : `${location.city}, ${location.country}`;

        results.push({
          entity: label,
          entityId: location.id,
          ...submissions.length > 0
            ? computeStats(
                submissions.map((s) => s.totalCompensation),
                submissions.map((s) => s.baseSalary),
                submissions.map((s) => s.bonus),
                submissions.map((s) => s.stock)
              )
            : {
                count: 0,
                medianTotal: 0,
                averageTotal: 0,
                medianBase: 0,
                medianBonus: 0,
                medianStock: 0,
                p25: 0,
                p75: 0,
              },
        });
      }
      break;
    }

    case "role": {
      for (const roleId of input.entities) {
        const role = await prisma.role.findUnique({
          where: { id: roleId },
        });
        if (!role) continue;

        const submissions = await prisma.salarySubmission.findMany({
          where: { ...baseWhere, roleId: role.id },
        });

        results.push({
          entity: role.name,
          entityId: role.id,
          ...submissions.length > 0
            ? computeStats(
                submissions.map((s) => s.totalCompensation),
                submissions.map((s) => s.baseSalary),
                submissions.map((s) => s.bonus),
                submissions.map((s) => s.stock)
              )
            : {
                count: 0,
                medianTotal: 0,
                averageTotal: 0,
                medianBase: 0,
                medianBonus: 0,
                medianStock: 0,
                p25: 0,
                p75: 0,
              },
        });
      }
      break;
    }
  }

  return results;
}

export async function getLevelProgression(companyId: string, roleId?: string) {
  const where: Record<string, unknown> = { companyId };
  if (roleId) where.roleId = roleId;

  const submissions = await prisma.salarySubmission.findMany({
    where,
    include: { level: true },
  });

  const levelMap = new Map<string, { levelCode: string; levelName: string; values: number[] }>();

  for (const s of submissions) {
    const key = s.level.levelCode;
    if (!levelMap.has(key)) {
      levelMap.set(key, {
        levelCode: s.level.levelCode,
        levelName: s.level.levelName,
        values: [],
      });
    }
    levelMap.get(key)!.values.push(s.totalCompensation);
  }

  return Array.from(levelMap.values())
    .map((l) => ({
      levelCode: l.levelCode,
      levelName: l.levelName,
      median: median(l.values),
      count: l.values.length,
    }))
    .sort((a, b) => a.levelCode.localeCompare(b.levelCode));
}
