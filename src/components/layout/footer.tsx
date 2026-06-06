import Link from "next/link";
import { BarChart3 } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
                <BarChart3 className="h-5 w-5 text-white" aria-hidden="true" />
              </div>
              <span className="text-lg font-bold text-slate-900">CompIntel</span>
            </div>
            <p className="mt-3 max-w-md text-sm text-slate-500">
              Compensation intelligence platform. Compare total compensation across
              companies, levels, locations, and roles. Levels matter more than job titles.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-900">Explore</h4>
            <ul className="mt-3 space-y-2">
              <li><Link href="/explorer" className="text-sm text-slate-500 hover:text-indigo-600">Salary Explorer</Link></li>
              <li><Link href="/compare" className="text-sm text-slate-500 hover:text-indigo-600">Compare</Link></li>
              <li><Link href="/insights" className="text-sm text-slate-500 hover:text-indigo-600">Insights</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-900">Contribute</h4>
            <ul className="mt-3 space-y-2">
              <li><Link href="/submit" className="text-sm text-slate-500 hover:text-indigo-600">Submit Salary</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-200 pt-8 text-center text-sm text-slate-400">
          &copy; {new Date().getFullYear()} CompIntel. Compensation intelligence, not a job portal.
        </div>
      </div>
    </footer>
  );
}
