import { NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/lib/api-utils";
import { insightsFilterSchema } from "@/lib/validations/salary";
import { getInsights, getPlatformStats } from "@/lib/services/insights.service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    if (searchParams.get("stats") === "true") {
      const stats = await getPlatformStats();
      return apiSuccess(stats);
    }

    const filters = insightsFilterSchema.parse({
      companyId: searchParams.get("companyId") ?? undefined,
      roleId: searchParams.get("roleId") ?? undefined,
      locationId: searchParams.get("locationId") ?? undefined,
      period: searchParams.get("period") ?? "all",
    });

    const insights = await getInsights(filters);
    return apiSuccess(insights);
  } catch (error) {
    return apiError(error);
  }
}
