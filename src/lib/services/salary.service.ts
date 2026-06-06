import prisma from "@/lib/db";
import { Prisma } from "@/generated/prisma/client";
import type { SalaryFilterInput } from "@/lib/validations/salary";

export type SalaryWithRelations = Prisma.SalarySubmissionGetPayload<{
  include: {
    company: true;
    role: true;
    level: true;
    location: true;
  };
}>;

function buildWhereClause(filters: SalaryFilterInput): Prisma.SalarySubmissionWhereInput {
  const where: Prisma.SalarySubmissionWhereInput = {};

  if (filters.companies?.length) {
    where.company = { normalizedName: { in: filters.companies.map((c) => c.toLowerCase()) } };
  }
  if (filters.roles?.length) {
    where.role = { name: { in: filters.roles } };
  }
  if (filters.levels?.length) {
    where.level = { levelCode: { in: filters.levels } };
  }
  if (filters.locations?.length) {
    where.location = {
      OR: filters.locations.map((loc) => {
        const parts = loc.split(",").map((p) => p.trim());
        return parts.length > 1
          ? { city: parts[0], country: parts[parts.length - 1] }
          : { city: { contains: loc, mode: "insensitive" as const } };
      }),
    };
  }
  if (filters.minSalary !== undefined || filters.maxSalary !== undefined) {
    where.totalCompensation = {};
    if (filters.minSalary !== undefined) where.totalCompensation.gte = filters.minSalary;
    if (filters.maxSalary !== undefined) where.totalCompensation.lte = filters.maxSalary;
  }
  if (filters.minExperience !== undefined || filters.maxExperience !== undefined) {
    where.yearsExperience = {};
    if (filters.minExperience !== undefined) where.yearsExperience.gte = filters.minExperience;
    if (filters.maxExperience !== undefined) where.yearsExperience.lte = filters.maxExperience;
  }
  if (filters.search) {
    where.OR = [
      { company: { name: { contains: filters.search, mode: "insensitive" } } },
      { role: { name: { contains: filters.search, mode: "insensitive" } } },
      { level: { levelName: { contains: filters.search, mode: "insensitive" } } },
      { location: { city: { contains: filters.search, mode: "insensitive" } } },
    ];
  }

  return where;
}

export async function getSalaries(filters: SalaryFilterInput) {
  const where = buildWhereClause(filters);
  const orderBy = { [filters.sort ?? "totalCompensation"]: filters.order ?? "desc" };
  const skip = ((filters.page ?? 1) - 1) * (filters.limit ?? 20);
  const take = filters.limit ?? 20;

  const [data, total] = await Promise.all([
    prisma.salarySubmission.findMany({
      where,
      include: { company: true, role: true, level: true, location: true },
      orderBy,
      skip,
      take,
    }),
    prisma.salarySubmission.count({ where }),
  ]);

  return { data, total, page: filters.page ?? 1, limit: take };
}

export async function getSalaryById(id: string) {
  return prisma.salarySubmission.findUnique({
    where: { id },
    include: { company: true, role: true, level: true, location: true },
  });
}

export async function getFilterOptions() {
  const [companies, roles, levels, locations] = await Promise.all([
    prisma.company.findMany({
      select: { id: true, name: true, normalizedName: true },
      orderBy: { name: "asc" },
    }),
    prisma.role.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.level.findMany({
      select: { id: true, levelCode: true, levelName: true, companyId: true, company: { select: { name: true } } },
      orderBy: { levelCode: "asc" },
    }),
    prisma.location.findMany({
      select: { id: true, city: true, state: true, country: true },
      orderBy: { city: "asc" },
    }),
  ]);

  return { companies, roles, levels, locations };
}

export function parseSalaryFiltersFromParams(
  searchParams: URLSearchParams
): SalaryFilterInput {
  return {
    companies: searchParams.get("companies")?.split(",").filter(Boolean),
    roles: searchParams.get("roles")?.split(",").filter(Boolean),
    levels: searchParams.get("levels")?.split(",").filter(Boolean),
    locations: searchParams.get("locations")?.split(",").filter(Boolean),
    minSalary: searchParams.get("minSalary")
      ? parseInt(searchParams.get("minSalary")!, 10)
      : undefined,
    maxSalary: searchParams.get("maxSalary")
      ? parseInt(searchParams.get("maxSalary")!, 10)
      : undefined,
    minExperience: searchParams.get("minExperience")
      ? parseInt(searchParams.get("minExperience")!, 10)
      : undefined,
    maxExperience: searchParams.get("maxExperience")
      ? parseInt(searchParams.get("maxExperience")!, 10)
      : undefined,
    sort: (searchParams.get("sort") as SalaryFilterInput["sort"]) ?? "totalCompensation",
    order: (searchParams.get("order") as SalaryFilterInput["order"]) ?? "desc",
    page: parseInt(searchParams.get("page") || "1", 10),
    limit: parseInt(searchParams.get("limit") || "20", 10),
    search: searchParams.get("search") ?? undefined,
  };
}
