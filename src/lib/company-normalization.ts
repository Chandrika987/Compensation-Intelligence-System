import { createHash } from "crypto";

export function normalizeCompanyName(input: string): {
  name: string;
  normalizedName: string;
} {
  const trimmed = input.trim().replace(/\s+/g, " ");
  const normalizedName = trimmed.toLowerCase();
  const name = trimmed
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
  return { name, normalizedName };
}

export function generateSubmissionFingerprint(data: {
  companyId: string;
  roleId: string;
  levelId: string;
  locationId: string;
  baseSalary: number;
  bonus: number;
  stock: number;
  yearsExperience: number;
}): string {
  const payload = [
    data.companyId,
    data.roleId,
    data.levelId,
    data.locationId,
    data.baseSalary,
    data.bonus,
    data.stock,
    data.yearsExperience,
  ].join("|");

  return createHash("sha256").update(payload).digest("hex");
}

export const KNOWN_COMPANIES: Record<string, { name: string; website: string; logo?: string }> = {
  google: { name: "Google", website: "https://google.com", logo: "https://logo.clearbit.com/google.com" },
  meta: { name: "Meta", website: "https://meta.com", logo: "https://logo.clearbit.com/meta.com" },
  amazon: { name: "Amazon", website: "https://amazon.com", logo: "https://logo.clearbit.com/amazon.com" },
  apple: { name: "Apple", website: "https://apple.com", logo: "https://logo.clearbit.com/apple.com" },
  microsoft: { name: "Microsoft", website: "https://microsoft.com", logo: "https://logo.clearbit.com/microsoft.com" },
  netflix: { name: "Netflix", website: "https://netflix.com", logo: "https://logo.clearbit.com/netflix.com" },
  stripe: { name: "Stripe", website: "https://stripe.com", logo: "https://logo.clearbit.com/stripe.com" },
  uber: { name: "Uber", website: "https://uber.com", logo: "https://logo.clearbit.com/uber.com" },
  airbnb: { name: "Airbnb", website: "https://airbnb.com", logo: "https://logo.clearbit.com/airbnb.com" },
  coinbase: { name: "Coinbase", website: "https://coinbase.com", logo: "https://logo.clearbit.com/coinbase.com" },
};
