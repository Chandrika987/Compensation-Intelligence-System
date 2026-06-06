"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Label, Select } from "@/components/ui/misc";
import { Button } from "@/components/ui/button";
import { buildSearchParams, parseArrayParam } from "@/lib/utils";
import { Search, X } from "lucide-react";

interface FilterOptions {
  companies: { id: string; name: string; normalizedName: string }[];
  roles: { id: string; name: string }[];
  levels: { id: string; levelCode: string; levelName: string; company: { name: string } }[];
  locations: { id: string; city: string; state: string | null; country: string }[];
}

interface FilterBarProps {
  options: FilterOptions;
}

export function FilterBar({ options }: FilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentCompanies = parseArrayParam(searchParams.get("companies"));
  const currentRoles = parseArrayParam(searchParams.get("roles"));
  const currentLevels = parseArrayParam(searchParams.get("levels"));
  const currentLocations = parseArrayParam(searchParams.get("locations"));

  const updateFilters = useCallback(
    (updates: Record<string, string | string[] | undefined>) => {
      const params: Record<string, string | string[] | undefined> = {};
      searchParams.forEach((value, key) => {
        params[key] = value;
      });
      Object.assign(params, updates);
      if (!updates.page) params.page = "1";

      const qs = buildSearchParams(params);
      startTransition(() => {
        router.push(`?${qs}`);
      });
    },
    [router, searchParams]
  );

  const toggleArrayFilter = (
    key: string,
    value: string,
    current: string[]
  ) => {
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    updateFilters({ [key]: next.length > 0 ? next.join(",") : undefined });
  };

  const clearFilters = () => {
    startTransition(() => {
      router.push(window.location.pathname);
    });
  };

  const hasFilters =
    currentCompanies.length > 0 ||
    currentRoles.length > 0 ||
    currentLevels.length > 0 ||
    currentLocations.length > 0 ||
    searchParams.get("minSalary") ||
    searchParams.get("maxSalary") ||
    searchParams.get("search");

  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search companies, roles, locations..."
            className="pl-9"
            defaultValue={searchParams.get("search") ?? ""}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                updateFilters({ search: (e.target as HTMLInputElement).value || undefined });
              }
            }}
            aria-label="Search salary records"
          />
        </div>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4" />
            Clear
          </Button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Label>Company</Label>
          <Select
            value=""
            onChange={(e) => {
              if (e.target.value) toggleArrayFilter("companies", e.target.value, currentCompanies);
            }}
            aria-label="Filter by company"
          >
            <option value="">Select company...</option>
            {options.companies.map((c) => (
              <option key={c.id} value={c.normalizedName}>
                {c.name}
              </option>
            ))}
          </Select>
          {currentCompanies.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1">
              {currentCompanies.map((c) => (
                <button
                  key={c}
                  onClick={() => toggleArrayFilter("companies", c, currentCompanies)}
                  className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs text-indigo-700 hover:bg-indigo-200"
                >
                  {c} ×
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <Label>Role</Label>
          <Select
            value=""
            onChange={(e) => {
              if (e.target.value) toggleArrayFilter("roles", e.target.value, currentRoles);
            }}
            aria-label="Filter by role"
          >
            <option value="">Select role...</option>
            {options.roles.map((r) => (
              <option key={r.id} value={r.name}>{r.name}</option>
            ))}
          </Select>
          {currentRoles.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1">
              {currentRoles.map((r) => (
                <button
                  key={r}
                  onClick={() => toggleArrayFilter("roles", r, currentRoles)}
                  className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs text-indigo-700 hover:bg-indigo-200"
                >
                  {r} ×
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <Label>Level</Label>
          <Select
            value=""
            onChange={(e) => {
              if (e.target.value) toggleArrayFilter("levels", e.target.value, currentLevels);
            }}
            aria-label="Filter by level"
          >
            <option value="">Select level...</option>
            {options.levels.map((l) => (
              <option key={l.id} value={l.levelCode}>
                {l.company.name} {l.levelCode}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <Label>Location</Label>
          <Select
            value=""
            onChange={(e) => {
              if (e.target.value) toggleArrayFilter("locations", e.target.value, currentLocations);
            }}
            aria-label="Filter by location"
          >
            <option value="">Select location...</option>
            {options.locations.map((l) => (
              <option key={l.id} value={`${l.city}, ${l.country}`}>
                {l.city}, {l.country}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Label htmlFor="minSalary">Min Salary</Label>
          <Input
            id="minSalary"
            type="number"
            placeholder="e.g. 100000"
            defaultValue={searchParams.get("minSalary") ?? ""}
            onBlur={(e) =>
              updateFilters({ minSalary: e.target.value || undefined })
            }
          />
        </div>
        <div>
          <Label htmlFor="maxSalary">Max Salary</Label>
          <Input
            id="maxSalary"
            type="number"
            placeholder="e.g. 500000"
            defaultValue={searchParams.get("maxSalary") ?? ""}
            onBlur={(e) =>
              updateFilters({ maxSalary: e.target.value || undefined })
            }
          />
        </div>
        <div>
          <Label htmlFor="minExp">Min Experience</Label>
          <Input
            id="minExp"
            type="number"
            placeholder="Years"
            defaultValue={searchParams.get("minExperience") ?? ""}
            onBlur={(e) =>
              updateFilters({ minExperience: e.target.value || undefined })
            }
          />
        </div>
        <div>
          <Label htmlFor="maxExp">Max Experience</Label>
          <Input
            id="maxExp"
            type="number"
            placeholder="Years"
            defaultValue={searchParams.get("maxExperience") ?? ""}
            onBlur={(e) =>
              updateFilters({ maxExperience: e.target.value || undefined })
            }
          />
        </div>
      </div>

      {isPending && (
        <p className="text-sm text-slate-400" aria-live="polite">
          Updating results...
        </p>
      )}
    </div>
  );
}

export function Pagination({
  page,
  totalPages,
  hasNext,
  hasPrev,
}: {
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const goToPage = (p: number) => {
    const params: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });
    params.page = String(p);
    router.push(`?${buildSearchParams(params)}`);
  };

  return (
    <nav className="flex items-center justify-between" aria-label="Pagination">
      <p className="text-sm text-slate-500">
        Page {page} of {totalPages}
      </p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={!hasPrev}
          onClick={() => goToPage(page - 1)}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={!hasNext}
          onClick={() => goToPage(page + 1)}
        >
          Next
        </Button>
      </div>
    </nav>
  );
}
