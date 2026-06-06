import { Suspense } from "react";
import { salaryFilterSchema } from "@/lib/validations/salary";
import {
  getSalaries,
  parseSalaryFiltersFromParams,
  getFilterOptions,
} from "@/lib/services/salary.service";
import { FilterBar, Pagination } from "@/components/filters/filter-bar";
import { SalaryTable } from "@/components/salary/salary-table";
import { EmptyState, Skeleton } from "@/components/ui/misc";

export const metadata = {
  title: "Salary Explorer",
  description: "Browse and filter salary submissions across companies, levels, and locations.",
};

interface ExplorerPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

async function ExplorerContent({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (typeof value === "string") params.set(key, value);
    else if (Array.isArray(value)) params.set(key, value.join(","));
  }

  const rawFilters = parseSalaryFiltersFromParams(params);
  const filters = salaryFilterSchema.parse(rawFilters);

  let result = { data: [] as Awaited<ReturnType<typeof getSalaries>>["data"], total: 0, page: 1, limit: 20 };
  let options = { companies: [], roles: [], levels: [], locations: [] } as Awaited<
    ReturnType<typeof getFilterOptions>
  >;

  try {
    [result, options] = await Promise.all([getSalaries(filters), getFilterOptions()]);
  } catch {
    // DB not connected
  }

  const totalPages = Math.max(1, Math.ceil(result.total / result.limit));

  return (
    <div className="space-y-6">
      <Suspense fallback={<Skeleton className="h-32 w-full" />}>
        <FilterBar options={options} />
      </Suspense>

      {result.data.length > 0 ? (
        <>
          <p className="text-sm text-slate-500">
            Showing {result.data.length} of {result.total} submissions
          </p>
          <SalaryTable
            data={result.data.map((s) => ({
              ...s,
              submittedAt: s.submittedAt.toISOString(),
            }))}
            sort={filters.sort}
            order={filters.order}
          />
          <Pagination
            page={result.page}
            totalPages={totalPages}
            hasNext={result.page < totalPages}
            hasPrev={result.page > 1}
          />
        </>
      ) : (
        <EmptyState
          title="No salary submissions found"
          description="Try adjusting your filters or be the first to submit data."
        />
      )}
    </div>
  );
}

export default async function ExplorerPage({ searchParams }: ExplorerPageProps) {
  const resolvedParams = await searchParams;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Salary Explorer</h1>
        <p className="mt-2 text-slate-500">
          Browse, filter, and sort compensation submissions across the platform.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        }
      >
        <ExplorerContent searchParams={resolvedParams} />
      </Suspense>
    </div>
  );
}
