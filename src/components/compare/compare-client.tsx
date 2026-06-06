"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label, Select } from "@/components/ui/misc";
import { Button } from "@/components/ui/button";
import { CompanyComparisonChart, StackedCompensationChart } from "@/components/charts/charts";
import { StatCard } from "@/components/salary/salary-table";
import { formatCurrency } from "@/lib/utils";
import { EmptyState } from "@/components/ui/misc";

interface ComparePageClientProps {
  companies: { id: string; name: string; normalizedName: string }[];
  levels: { id: string; levelCode: string; levelName: string; company: { name: string } }[];
  locations: { id: string; city: string; state: string | null; country: string }[];
  roles: { id: string; name: string }[];
}

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

export function ComparePageClient({
  companies,
  levels,
  locations,
  roles,
}: ComparePageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [compareType, setCompareType] = useState(
    searchParams.get("type") || "company"
  );
  const [selected, setSelected] = useState<string[]>(
    searchParams.get("entities")?.split(",").filter(Boolean) ?? []
  );
  const [results, setResults] = useState<ComparisonResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasCompared, setHasCompared] = useState(false);

  const entityOptions = {
    company: companies.map((c) => ({ id: c.normalizedName, label: c.name })),
    level: levels.map((l) => ({
      id: l.id,
      label: `${l.company.name} ${l.levelCode} - ${l.levelName}`,
    })),
    location: locations.map((l) => ({
      id: l.id,
      label: l.state ? `${l.city}, ${l.state}` : `${l.city}, ${l.country}`,
    })),
    role: roles.map((r) => ({ id: r.id, label: r.name })),
  };

  const handleCompare = async () => {
    if (selected.length < 2) return;
    setLoading(true);
    setHasCompared(true);

    const params = new URLSearchParams({
      type: compareType,
      entities: selected.join(","),
    });

    router.push(`/compare?${params.toString()}`);

    try {
      const res = await fetch(`/api/compare?${params.toString()}`);
      const data = await res.json();
      setResults(data.data ?? []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleEntity = (id: string) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((s) => s !== id)
        : prev.length < 5
          ? [...prev, id]
          : prev
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Configure Comparison</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Compare By</Label>
            <Select
              value={compareType}
              onChange={(e) => {
                setCompareType(e.target.value);
                setSelected([]);
                setResults([]);
                setHasCompared(false);
              }}
            >
              <option value="company">Company vs Company</option>
              <option value="level">Level vs Level</option>
              <option value="location">Location vs Location</option>
              <option value="role">Role vs Role</option>
            </Select>
          </div>

          <div>
            <Label>Select entities (2–5)</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {entityOptions[compareType as keyof typeof entityOptions]?.map(
                (opt) => (
                  <button
                    key={opt.id}
                    onClick={() => toggleEntity(opt.id)}
                    className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                      selected.includes(opt.id)
                        ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    {opt.label}
                  </button>
                )
              )}
            </div>
          </div>

          <Button
            onClick={handleCompare}
            disabled={selected.length < 2 || loading}
          >
            {loading ? "Comparing..." : "Compare"}
          </Button>
        </CardContent>
      </Card>

      {hasCompared && results.length === 0 && !loading && (
        <EmptyState
          title="No comparison data"
          description="No salary submissions found for the selected entities."
        />
      )}

      {results.length > 0 && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((r) => (
              <StatCard
                key={r.entityId}
                label={r.entity}
                value={formatCurrency(r.medianTotal)}
                subtext={`${r.count} submissions · Avg ${formatCurrency(r.averageTotal)}`}
              />
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Median Total Compensation</CardTitle>
            </CardHeader>
            <CardContent>
              <CompanyComparisonChart
                data={results.map((r) => ({
                  entity: r.entity,
                  medianTotal: r.medianTotal,
                  count: r.count,
                }))}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Compensation Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <StackedCompensationChart
                data={results.map((r) => ({
                  entity: r.entity,
                  medianBase: r.medianBase,
                  medianBonus: r.medianBonus,
                  medianStock: r.medianStock,
                }))}
              />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
