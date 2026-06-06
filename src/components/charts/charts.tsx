"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { formatCompactCurrency } from "@/lib/utils";

const COLORS = ["#4f46e5", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

interface ChartTooltipProps {
  active?: boolean;
  payload?: { value: number; name: string; color: string }[];
  label?: string;
}

function CurrencyTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
      {label && <p className="mb-1 text-sm font-medium text-slate-900">{label}</p>}
      {payload.map((entry, i) => (
        <p key={i} className="text-sm" style={{ color: entry.color }}>
          {entry.name}: {formatCompactCurrency(entry.value)}
        </p>
      ))}
    </div>
  );
}

export function SalaryDistributionChart({
  data,
}: {
  data: { range: string; count: number }[];
}) {
  if (data.length === 0) return null;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="range" tick={{ fontSize: 12 }} stroke="#94a3b8" />
        <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
        <Tooltip content={<CurrencyTooltip />} />
        <Bar dataKey="count" name="Submissions" fill="#4f46e5" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function CompensationBreakdownChart({
  base,
  bonus,
  stock,
  isPercentage = false,
}: {
  base: number;
  bonus: number;
  stock: number;
  isPercentage?: boolean;
}) {
  const data = [
    { name: "Base", value: base, color: "#4f46e5" },
    { name: "Bonus", value: bonus, color: "#06b6d4" },
    { name: "Stock", value: stock, color: "#10b981" },
  ].filter((d) => d.value > 0);

  if (data.length === 0) return null;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={4}
          dataKey="value"
          label={({ name, percent }) =>
            isPercentage
              ? `${name} ${percent !== undefined ? (percent * 100).toFixed(0) : 0}%`
              : `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
          }
        >
          {data.map((entry, index) => (
            <Cell key={index} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) =>
            isPercentage
              ? `${Number(value)}%`
              : formatCompactCurrency(Number(value))
          }
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function CompanyComparisonChart({
  data,
}: {
  data: { entity: string; medianTotal: number; count: number }[];
}) {
  if (data.length === 0) return null;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="entity" tick={{ fontSize: 12 }} stroke="#94a3b8" />
        <YAxis
          tick={{ fontSize: 12 }}
          stroke="#94a3b8"
          tickFormatter={(v) => formatCompactCurrency(v)}
        />
        <Tooltip content={<CurrencyTooltip />} />
        <Bar dataKey="medianTotal" name="Median TC" fill="#4f46e5" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function LevelProgressionChart({
  data,
}: {
  data: { levelCode: string; levelName: string; median: number; count: number }[];
}) {
  if (data.length === 0) return null;

  const chartData = data.map((d) => ({
    level: d.levelCode,
    median: d.median,
    count: d.count,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="level" tick={{ fontSize: 12 }} stroke="#94a3b8" />
        <YAxis
          tick={{ fontSize: 12 }}
          stroke="#94a3b8"
          tickFormatter={(v) => formatCompactCurrency(v)}
        />
        <Tooltip content={<CurrencyTooltip />} />
        <Line
          type="monotone"
          dataKey="median"
          name="Median TC"
          stroke="#4f46e5"
          strokeWidth={2}
          dot={{ fill: "#4f46e5", r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function LocationComparisonChart({
  data,
}: {
  data: { name: string; median: number; count: number }[];
}) {
  if (data.length === 0) return null;

  return (
    <ResponsiveContainer width="100%" height={Math.max(200, data.length * 40)}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 5, right: 20, left: 80, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis
          type="number"
          tick={{ fontSize: 12 }}
          stroke="#94a3b8"
          tickFormatter={(v) => formatCompactCurrency(v)}
        />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fontSize: 12 }}
          stroke="#94a3b8"
          width={75}
        />
        <Tooltip content={<CurrencyTooltip />} />
        <Bar dataKey="median" name="Median TC" fill="#06b6d4" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function DistributionPieChart({
  data,
}: {
  data: { name: string; count: number; percentage: number }[];
}) {
  if (data.length === 0) return null;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data.slice(0, 6)}
          cx="50%"
          cy="50%"
          outerRadius={100}
          dataKey="count"
          label={({ name, payload }) =>
            `${name} (${(payload as { percentage?: number })?.percentage ?? 0}%)`
          }
        >
          {data.slice(0, 6).map((_, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function GrowthTrendChart({
  data,
}: {
  data: { month: string; median: number; count: number }[];
}) {
  if (data.length === 0) return null;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
        <YAxis
          tick={{ fontSize: 12 }}
          stroke="#94a3b8"
          tickFormatter={(v) => formatCompactCurrency(v)}
        />
        <Tooltip content={<CurrencyTooltip />} />
        <Line
          type="monotone"
          dataKey="median"
          name="Median TC"
          stroke="#10b981"
          strokeWidth={2}
          dot={{ fill: "#10b981", r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function StackedCompensationChart({
  data,
}: {
  data: { entity: string; medianBase: number; medianBonus: number; medianStock: number }[];
}) {
  if (data.length === 0) return null;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="entity" tick={{ fontSize: 12 }} stroke="#94a3b8" />
        <YAxis
          tick={{ fontSize: 12 }}
          stroke="#94a3b8"
          tickFormatter={(v) => formatCompactCurrency(v)}
        />
        <Tooltip content={<CurrencyTooltip />} />
        <Legend />
        <Bar dataKey="medianBase" name="Base" stackId="a" fill="#4f46e5" />
        <Bar dataKey="medianBonus" name="Bonus" stackId="a" fill="#06b6d4" />
        <Bar dataKey="medianStock" name="Stock" stackId="a" fill="#10b981" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
