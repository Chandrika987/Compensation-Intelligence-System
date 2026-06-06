import prisma from "@/lib/db";
import { normalizeCompanyName, generateSubmissionFingerprint } from "@/lib/company-normalization";
import { calculateTotalCompensation } from "@/lib/compensation";
import { AppError } from "@/lib/api-utils";
import type { SalarySubmissionInput } from "@/lib/validations/salary";

export async function createSalarySubmission(input: SalarySubmissionInput) {
  const { name, normalizedName } = normalizeCompanyName(input.companyName);

  const company = await prisma.company.upsert({
    where: { normalizedName },
    create: { name, normalizedName },
    update: {},
  });

  const role = await prisma.role.upsert({
    where: { name: input.roleName },
    create: { name: input.roleName },
    update: {},
  });

  const level = await prisma.level.upsert({
    where: { companyId_levelCode: { companyId: company.id, levelCode: input.levelCode } },
    create: {
      companyId: company.id,
      levelCode: input.levelCode,
      levelName: input.levelName,
    },
    update: { levelName: input.levelName },
  });

  const location = await prisma.location.upsert({
    where: {
      city_state_country: {
        city: input.city,
        state: input.state ?? "",
        country: input.country,
      },
    },
    create: {
      city: input.city,
      state: input.state ?? "",
      country: input.country,
    },
    update: {},
  });

  const bonus = input.bonus ?? 0;
  const stock = input.stock ?? 0;
  const totalCompensation = calculateTotalCompensation(input.baseSalary, bonus, stock);

  const fingerprint = generateSubmissionFingerprint({
    companyId: company.id,
    roleId: role.id,
    levelId: level.id,
    locationId: location.id,
    baseSalary: input.baseSalary,
    bonus,
    stock,
    yearsExperience: input.yearsExperience,
  });

  const existing = await prisma.salarySubmission.findUnique({
    where: { fingerprint },
  });

  if (existing) {
    throw new AppError(
      "DUPLICATE_SUBMISSION",
      "A similar compensation submission already exists",
      409
    );
  }

  return prisma.salarySubmission.create({
    data: {
      companyId: company.id,
      roleId: role.id,
      levelId: level.id,
      locationId: location.id,
      baseSalary: input.baseSalary,
      bonus,
      stock,
      totalCompensation,
      yearsExperience: input.yearsExperience,
      fingerprint,
    },
    include: { company: true, role: true, level: true, location: true },
  });
}

export async function getCompanies(search?: string, limit = 50) {
  return prisma.company.findMany({
    where: search
      ? { name: { contains: search, mode: "insensitive" } }
      : undefined,
    include: {
      _count: { select: { submissions: true } },
    },
    orderBy: { submissions: { _count: "desc" } },
    take: limit,
  });
}

export async function getCompanyBySlug(slug: string) {
  return prisma.company.findUnique({
    where: { normalizedName: slug.toLowerCase() },
    include: {
      levels: { orderBy: { levelCode: "asc" } },
      _count: { select: { submissions: true } },
    },
  });
}

export async function getCompanyStats(companyId: string) {
  const submissions = await prisma.salarySubmission.findMany({
    where: { companyId },
    include: { role: true, level: true, location: true },
  });

  if (submissions.length === 0) {
    return {
      count: 0,
      medianTotal: 0,
      averageTotal: 0,
      medianBase: 0,
      medianBonus: 0,
      medianStock: 0,
      byLevel: [],
      byRole: [],
      byLocation: [],
    };
  }

  const totals = submissions.map((s) => s.totalCompensation);
  const sorted = [...totals].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const medianTotal =
    sorted.length % 2 !== 0
      ? sorted[mid]
      : Math.round((sorted[mid - 1] + sorted[mid]) / 2);

  const levelMap = new Map<string, number[]>();
  const roleMap = new Map<string, number[]>();
  const locationMap = new Map<string, number[]>();

  for (const s of submissions) {
    const levelKey = `${s.level.levelCode} - ${s.level.levelName}`;
    const roleKey = s.role.name;
    const locationKey = `${s.location.city}, ${s.location.country}`;

    if (!levelMap.has(levelKey)) levelMap.set(levelKey, []);
    if (!roleMap.has(roleKey)) roleMap.set(roleKey, []);
    if (!locationMap.has(locationKey)) locationMap.set(locationKey, []);

    levelMap.get(levelKey)!.push(s.totalCompensation);
    roleMap.get(roleKey)!.push(s.totalCompensation);
    locationMap.get(locationKey)!.push(s.totalCompensation);
  }

  const computeMedian = (arr: number[]) => {
    const s = [...arr].sort((a, b) => a - b);
    const m = Math.floor(s.length / 2);
    return s.length % 2 !== 0 ? s[m] : Math.round((s[m - 1] + s[m]) / 2);
  };

  return {
    count: submissions.length,
    medianTotal,
    averageTotal: Math.round(totals.reduce((a, b) => a + b, 0) / totals.length),
    medianBase: computeMedian(submissions.map((s) => s.baseSalary)),
    medianBonus: computeMedian(submissions.map((s) => s.bonus)),
    medianStock: computeMedian(submissions.map((s) => s.stock)),
    byLevel: Array.from(levelMap.entries()).map(([name, values]) => ({
      name,
      median: computeMedian(values),
      count: values.length,
    })),
    byRole: Array.from(roleMap.entries()).map(([name, values]) => ({
      name,
      median: computeMedian(values),
      count: values.length,
    })),
    byLocation: Array.from(locationMap.entries()).map(([name, values]) => ({
      name,
      median: computeMedian(values),
      count: values.length,
    })),
  };
}

export async function getTrendingCompanies(limit = 8) {
  return prisma.company.findMany({
    include: {
      _count: { select: { submissions: true } },
      submissions: {
        select: { totalCompensation: true },
        take: 100,
      },
    },
    orderBy: { submissions: { _count: "desc" } },
    take: limit,
  });
}
