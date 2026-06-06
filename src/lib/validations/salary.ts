import { z } from "zod";

export const salarySubmissionSchema = z.object({
  companyName: z.string().min(1, "Company name is required").max(100),
  roleName: z.string().min(1, "Role is required").max(100),
  levelCode: z.string().min(1, "Level code is required").max(20),
  levelName: z.string().min(1, "Level name is required").max(100),
  city: z.string().min(1, "City is required").max(100),
  state: z.string().max(100).optional(),
  country: z.string().min(1, "Country is required").max(100),
  baseSalary: z.number().int().min(0, "Base salary cannot be negative"),
  bonus: z.number().int().min(0, "Bonus cannot be negative").optional().default(0),
  stock: z.number().int().min(0, "Stock cannot be negative").optional().default(0),
  yearsExperience: z.number().int().min(0, "Experience cannot be negative").max(50),
});

export type SalarySubmissionInput = z.infer<typeof salarySubmissionSchema>;

export const salaryFilterSchema = z.object({
  companies: z.array(z.string()).optional(),
  roles: z.array(z.string()).optional(),
  levels: z.array(z.string()).optional(),
  locations: z.array(z.string()).optional(),
  minSalary: z.number().int().min(0).optional(),
  maxSalary: z.number().int().min(0).optional(),
  minExperience: z.number().int().min(0).optional(),
  maxExperience: z.number().int().min(0).optional(),
  sort: z
    .enum([
      "totalCompensation",
      "baseSalary",
      "bonus",
      "stock",
      "yearsExperience",
      "submittedAt",
    ])
    .optional()
    .default("totalCompensation"),
  order: z.enum(["asc", "desc"]).optional().default("desc"),
  page: z.number().int().min(1).optional().default(1),
  limit: z.number().int().min(1).max(100).optional().default(20),
  search: z.string().optional(),
});

export type SalaryFilterInput = z.infer<typeof salaryFilterSchema>;

export const compareSchema = z.object({
  type: z.enum(["company", "level", "location", "role"]),
  entities: z.array(z.string()).min(2, "Select at least 2 entities to compare").max(5),
  roleId: z.string().optional(),
  levelId: z.string().optional(),
  locationId: z.string().optional(),
  companyId: z.string().optional(),
});

export type CompareInput = z.infer<typeof compareSchema>;

export const insightsFilterSchema = z.object({
  companyId: z.string().optional(),
  roleId: z.string().optional(),
  locationId: z.string().optional(),
  period: z.enum(["3m", "6m", "1y", "all"]).optional().default("all"),
});

export type InsightsFilterInput = z.infer<typeof insightsFilterSchema>;
