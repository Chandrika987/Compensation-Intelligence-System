import { NextRequest } from "next/server";
import { apiSuccess, apiError, AppError } from "@/lib/api-utils";
import { getCompanyBySlug, getCompanyStats } from "@/lib/services/company.service";
import { getSalaries } from "@/lib/services/salary.service";
import { getLevelProgression } from "@/lib/services/compare.service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const company = await getCompanyBySlug(id);

    if (!company) {
      return apiError(new AppError("NOT_FOUND", "Company not found", 404));
    }

    const [stats, salaries, levelProgression] = await Promise.all([
      getCompanyStats(company.id),
      getSalaries({
        companies: [company.normalizedName],
        page: 1,
        limit: 50,
        sort: "totalCompensation",
        order: "desc",
      }),
      getLevelProgression(company.id),
    ]);

    return apiSuccess({
      company,
      stats,
      salaries: salaries.data,
      levelProgression,
    });
  } catch (error) {
    return apiError(error);
  }
}
