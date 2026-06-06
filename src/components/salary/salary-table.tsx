"use client";

import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface SalaryRow {
  id: string;
  company: { name: string; normalizedName: string };
  role: { name: string };
  level: { levelCode: string; levelName: string };
  location: { city: string; state: string | null; country: string };
  baseSalary: number;
  bonus: number;
  stock: number;
  totalCompensation: number;
  yearsExperience: number;
  submittedAt: string | Date;
}

interface SalaryTableProps {
  data: SalaryRow[];
  sort?: string;
  order?: "asc" | "desc";
  onSort?: (field: string) => void;
}

export function SalaryTable({ data, sort, order, onSort }: SalaryTableProps) {
  const columns = [
    { key: "company", label: "Company" },
    { key: "role", label: "Role" },
    { key: "level", label: "Level" },
    { key: "location", label: "Location" },
    { key: "baseSalary", label: "Base", numeric: true },
    { key: "bonus", label: "Bonus", numeric: true },
    { key: "stock", label: "Stock", numeric: true },
    { key: "totalCompensation", label: "Total", numeric: true },
    { key: "yearsExperience", label: "YOE", numeric: true },
  ];

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200">
      <table className="w-full text-sm" aria-label="Salary submissions">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-4 py-3 text-left font-medium text-slate-600"
                aria-sort={
                  sort === col.key
                    ? order === "asc"
                      ? "ascending"
                      : "descending"
                    : undefined
                }
              >
                {col.numeric && onSort ? (
                  <button
                    onClick={() => onSort(col.key)}
                    className="flex items-center gap-1 hover:text-indigo-600"
                  >
                    {col.label}
                    {sort === col.key && (
                      <span aria-hidden="true">{order === "asc" ? "↑" : "↓"}</span>
                    )}
                  </button>
                ) : (
                  col.label
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.map((row) => (
            <tr key={row.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-4 py-3 font-medium text-slate-900">
                {row.company.name}
              </td>
              <td className="px-4 py-3 text-slate-600">{row.role.name}</td>
              <td className="px-4 py-3">
                <Badge variant="secondary">{row.level.levelCode}</Badge>
                <span className="ml-1 text-xs text-slate-400">{row.level.levelName}</span>
              </td>
              <td className="px-4 py-3 text-slate-600">
                {row.location.city}
                {row.location.state ? `, ${row.location.state}` : ""}
              </td>
              <td className="px-4 py-3 tabular-nums text-slate-900">
                {formatCurrency(row.baseSalary)}
              </td>
              <td className="px-4 py-3 tabular-nums text-slate-600">
                {formatCurrency(row.bonus)}
              </td>
              <td className="px-4 py-3 tabular-nums text-slate-600">
                {formatCurrency(row.stock)}
              </td>
              <td className="px-4 py-3 tabular-nums font-semibold text-indigo-600">
                {formatCurrency(row.totalCompensation)}
              </td>
              <td className="px-4 py-3 tabular-nums text-slate-600">
                {row.yearsExperience}y
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function StatCard({
  label,
  value,
  subtext,
}: {
  label: string;
  value: string;
  subtext?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
      {subtext && <p className="mt-1 text-xs text-slate-400">{subtext}</p>}
    </div>
  );
}
