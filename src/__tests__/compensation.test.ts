import { describe, it, expect } from "vitest";
import { calculateTotalCompensation, getCompensationBreakdown, createSalaryBuckets } from "@/lib/compensation";
import { normalizeCompanyName, generateSubmissionFingerprint } from "@/lib/company-normalization";
import { median, average, percentile, formatCurrency } from "@/lib/utils";
import { salarySubmissionSchema } from "@/lib/validations/salary";

describe("calculateTotalCompensation", () => {
  it("calculates base + bonus + stock", () => {
    expect(calculateTotalCompensation(150000, 20000, 80000)).toBe(250000);
  });

  it("defaults missing bonus to 0", () => {
    expect(calculateTotalCompensation(150000, null, 80000)).toBe(230000);
  });

  it("defaults missing stock to 0", () => {
    expect(calculateTotalCompensation(150000, 20000, null)).toBe(170000);
  });

  it("defaults both missing to 0", () => {
    expect(calculateTotalCompensation(150000)).toBe(150000);
  });
});

describe("getCompensationBreakdown", () => {
  it("calculates percentages correctly", () => {
    const breakdown = getCompensationBreakdown(150000, 20000, 80000);
    expect(breakdown.totalCompensation).toBe(250000);
    expect(breakdown.basePercent).toBe(60);
    expect(breakdown.bonusPercent).toBe(8);
    expect(breakdown.stockPercent).toBe(32);
  });
});

describe("normalizeCompanyName", () => {
  it("normalizes GOOGLE to Google", () => {
    const result = normalizeCompanyName("GOOGLE");
    expect(result.name).toBe("Google");
    expect(result.normalizedName).toBe("google");
  });

  it("handles whitespace", () => {
    const result = normalizeCompanyName("  google  ");
    expect(result.name).toBe("Google");
    expect(result.normalizedName).toBe("google");
  });

  it("handles multi-word names", () => {
    const result = normalizeCompanyName("JPMORGAN CHASE");
    expect(result.name).toBe("Jpmorgan Chase");
    expect(result.normalizedName).toBe("jpmorgan chase");
  });
});

describe("generateSubmissionFingerprint", () => {
  it("generates consistent fingerprints", () => {
    const data = {
      companyId: "c1",
      roleId: "r1",
      levelId: "l1",
      locationId: "loc1",
      baseSalary: 150000,
      bonus: 20000,
      stock: 80000,
      yearsExperience: 5,
    };
    const fp1 = generateSubmissionFingerprint(data);
    const fp2 = generateSubmissionFingerprint(data);
    expect(fp1).toBe(fp2);
    expect(fp1).toHaveLength(64);
  });

  it("generates different fingerprints for different data", () => {
    const base = {
      companyId: "c1",
      roleId: "r1",
      levelId: "l1",
      locationId: "loc1",
      baseSalary: 150000,
      bonus: 20000,
      stock: 80000,
      yearsExperience: 5,
    };
    const fp1 = generateSubmissionFingerprint(base);
    const fp2 = generateSubmissionFingerprint({ ...base, baseSalary: 160000 });
    expect(fp1).not.toBe(fp2);
  });
});

describe("statistical utilities", () => {
  it("calculates median", () => {
    expect(median([1, 2, 3, 4, 5])).toBe(3);
    expect(median([1, 2, 3, 4])).toBe(3); // average of 2 and 3, rounded
  });

  it("calculates average", () => {
    expect(average([100, 200, 300])).toBe(200);
  });

  it("calculates percentile", () => {
    const values = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
    expect(percentile(values, 25)).toBe(30);
    expect(percentile(values, 75)).toBe(80);
  });
});

describe("salarySubmissionSchema", () => {
  it("validates correct submission", () => {
    const result = salarySubmissionSchema.safeParse({
      companyName: "Google",
      roleName: "Software Engineer",
      levelCode: "L5",
      levelName: "Senior Software Engineer",
      city: "San Francisco",
      state: "CA",
      country: "United States",
      baseSalary: 200000,
      bonus: 30000,
      stock: 100000,
      yearsExperience: 7,
    });
    expect(result.success).toBe(true);
  });

  it("rejects negative salary", () => {
    const result = salarySubmissionSchema.safeParse({
      companyName: "Google",
      roleName: "Software Engineer",
      levelCode: "L5",
      levelName: "Senior Software Engineer",
      city: "San Francisco",
      country: "United States",
      baseSalary: -100,
      yearsExperience: 5,
    });
    expect(result.success).toBe(false);
  });

  it("defaults bonus and stock to 0", () => {
    const result = salarySubmissionSchema.parse({
      companyName: "Google",
      roleName: "Software Engineer",
      levelCode: "L5",
      levelName: "Senior Software Engineer",
      city: "San Francisco",
      country: "United States",
      baseSalary: 200000,
      yearsExperience: 5,
    });
    expect(result.bonus).toBe(0);
    expect(result.stock).toBe(0);
  });
});

describe("createSalaryBuckets", () => {
  it("creates buckets from salary values", () => {
    const buckets = createSalaryBuckets([100000, 150000, 200000, 250000, 300000], 4);
    expect(buckets.length).toBe(4);
    expect(buckets.some((b) => b.count > 0)).toBe(true);
  });

  it("returns empty array for no values", () => {
    expect(createSalaryBuckets([])).toEqual([]);
  });
});

describe("formatCurrency", () => {
  it("formats USD amounts", () => {
    expect(formatCurrency(250000)).toBe("$250,000");
  });
});
