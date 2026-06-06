import { Suspense } from "react";
import { ComparePageClient } from "@/components/compare/compare-client";
import { getFilterOptions } from "@/lib/services/salary.service";
import { Skeleton } from "@/components/ui/misc";

export const metadata = {
  title: "Compare Compensation",
  description: "Compare compensation across companies, levels, locations, and roles.",
};

export default async function ComparePage() {
  let options = {
    companies: [] as { id: string; name: string; normalizedName: string }[],
    roles: [] as { id: string; name: string }[],
    levels: [] as { id: string; levelCode: string; levelName: string; company: { name: string } }[],
    locations: [] as { id: string; city: string; state: string | null; country: string }[],
  };

  try {
    options = await getFilterOptions();
  } catch {
    // DB not connected
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Compare Compensation</h1>
        <p className="mt-2 text-slate-500">
          Side-by-side comparison across companies, levels, locations, or roles.
        </p>
      </div>

      <Suspense fallback={<Skeleton className="h-64 w-full" />}>
        <ComparePageClient
          companies={options.companies}
          levels={options.levels}
          locations={options.locations}
          roles={options.roles}
        />
      </Suspense>
    </div>
  );
}
