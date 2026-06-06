export function calculateTotalCompensation(
  baseSalary: number,
  bonus?: number | null,
  stock?: number | null
): number {
  const bonusAmount = bonus ?? 0;
  const stockAmount = stock ?? 0;
  return baseSalary + bonusAmount + stockAmount;
}

export interface CompensationBreakdown {
  baseSalary: number;
  bonus: number;
  stock: number;
  totalCompensation: number;
  basePercent: number;
  bonusPercent: number;
  stockPercent: number;
}

export function getCompensationBreakdown(
  baseSalary: number,
  bonus: number = 0,
  stock: number = 0
): CompensationBreakdown {
  const totalCompensation = calculateTotalCompensation(baseSalary, bonus, stock);
  if (totalCompensation === 0) {
    return {
      baseSalary,
      bonus,
      stock,
      totalCompensation: 0,
      basePercent: 0,
      bonusPercent: 0,
      stockPercent: 0,
    };
  }
  return {
    baseSalary,
    bonus,
    stock,
    totalCompensation,
    basePercent: Math.round((baseSalary / totalCompensation) * 100),
    bonusPercent: Math.round((bonus / totalCompensation) * 100),
    stockPercent: Math.round((stock / totalCompensation) * 100),
  };
}

export function createSalaryBuckets(
  values: number[],
  bucketCount: number = 8
): { range: string; min: number; max: number; count: number }[] {
  if (values.length === 0) return [];

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;
  const bucketSize = Math.max(Math.ceil(range / bucketCount), 10000);

  const buckets: { range: string; min: number; max: number; count: number }[] = [];
  for (let i = 0; i < bucketCount; i++) {
    const bucketMin = min + i * bucketSize;
    const bucketMax = bucketMin + bucketSize;
    const count = values.filter(
      (v) => v >= bucketMin && (i === bucketCount - 1 ? v <= bucketMax : v < bucketMax)
    ).length;
    buckets.push({
      range: `$${Math.round(bucketMin / 1000)}K–$${Math.round(bucketMax / 1000)}K`,
      min: bucketMin,
      max: bucketMax,
      count,
    });
  }
  return buckets;
}
