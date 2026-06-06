"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/misc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { calculateTotalCompensation } from "@/lib/compensation";
import { formatCurrency } from "@/lib/utils";

export function SubmitForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    companyName: "",
    roleName: "",
    levelCode: "",
    levelName: "",
    city: "",
    state: "",
    country: "United States",
    baseSalary: "",
    bonus: "",
    stock: "",
    yearsExperience: "",
  });

  const base = parseInt(form.baseSalary) || 0;
  const bonus = parseInt(form.bonus) || 0;
  const stock = parseInt(form.stock) || 0;
  const total = calculateTotalCompensation(base, bonus, stock);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/salary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: form.companyName,
          roleName: form.roleName,
          levelCode: form.levelCode,
          levelName: form.levelName,
          city: form.city,
          state: form.state || undefined,
          country: form.country,
          baseSalary: parseInt(form.baseSalary),
          bonus: form.bonus ? parseInt(form.bonus) : 0,
          stock: form.stock ? parseInt(form.stock) : 0,
          yearsExperience: parseInt(form.yearsExperience),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error?.message || "Submission failed");
      }

      setSuccess(true);
      setTimeout(() => router.push("/explorer"), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
            <svg className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-900">Thank you!</h3>
          <p className="mt-1 text-sm text-slate-500">
            Your compensation data has been submitted. Redirecting to explorer...
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submit Your Compensation</CardTitle>
        <CardDescription>
          All submissions are anonymous. Help others make informed decisions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <fieldset className="space-y-4">
            <legend className="text-sm font-semibold text-slate-900">Company & Role</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="companyName">Company Name *</Label>
                <Input
                  id="companyName"
                  required
                  placeholder="e.g. Google"
                  value={form.companyName}
                  onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="roleName">Role *</Label>
                <Input
                  id="roleName"
                  required
                  placeholder="e.g. Software Engineer"
                  value={form.roleName}
                  onChange={(e) => setForm({ ...form, roleName: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="levelCode">Level Code *</Label>
                <Input
                  id="levelCode"
                  required
                  placeholder="e.g. L5"
                  value={form.levelCode}
                  onChange={(e) => setForm({ ...form, levelCode: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="levelName">Level Name *</Label>
                <Input
                  id="levelName"
                  required
                  placeholder="e.g. Senior Software Engineer"
                  value={form.levelName}
                  onChange={(e) => setForm({ ...form, levelName: e.target.value })}
                />
              </div>
            </div>
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="text-sm font-semibold text-slate-900">Location</legend>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  required
                  placeholder="e.g. San Francisco"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  placeholder="e.g. CA"
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="country">Country *</Label>
                <Input
                  id="country"
                  required
                  value={form.country}
                  onChange={(e) => setForm({ ...form, country: e.target.value })}
                />
              </div>
            </div>
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="text-sm font-semibold text-slate-900">Compensation (USD)</legend>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <Label htmlFor="baseSalary">Base Salary *</Label>
                <Input
                  id="baseSalary"
                  type="number"
                  required
                  min="0"
                  placeholder="150000"
                  value={form.baseSalary}
                  onChange={(e) => setForm({ ...form, baseSalary: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="bonus">Bonus</Label>
                <Input
                  id="bonus"
                  type="number"
                  min="0"
                  placeholder="20000"
                  value={form.bonus}
                  onChange={(e) => setForm({ ...form, bonus: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="stock">Stock (annual)</Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  placeholder="80000"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="yearsExperience">Years Experience *</Label>
                <Input
                  id="yearsExperience"
                  type="number"
                  required
                  min="0"
                  max="50"
                  placeholder="5"
                  value={form.yearsExperience}
                  onChange={(e) => setForm({ ...form, yearsExperience: e.target.value })}
                />
              </div>
            </div>

            {base > 0 && (
              <div className="rounded-lg bg-indigo-50 p-4">
                <p className="text-sm font-medium text-indigo-900">
                  Total Compensation: {formatCurrency(total)}
                </p>
                <p className="text-xs text-indigo-600">
                  Base ({formatCurrency(base)}) + Bonus ({formatCurrency(bonus)}) + Stock ({formatCurrency(stock)})
                </p>
              </div>
            )}
          </fieldset>

          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">
              {error}
            </div>
          )}

          <Button type="submit" disabled={loading} className="w-full sm:w-auto">
            {loading ? "Submitting..." : "Submit Compensation"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
