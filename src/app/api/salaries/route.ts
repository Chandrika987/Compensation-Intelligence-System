import { NextRequest } from "next/server";
import { apiSuccess, apiError, paginationMeta } from "@/lib/api-utils";
import { salaryFilterSchema } from "@/lib/validations/salary";
import {
  getSalaries,
  parseSalaryFiltersFromParams,
  getFilterOptions,
} from "@/lib/services/salary.service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    if (searchParams.get("options") === "true") {
      const options = await getFilterOptions();
      return apiSuccess(options);
    }

    const rawFilters = parseSalaryFiltersFromParams(searchParams);
    const filters = salaryFilterSchema.parse(rawFilters);
    const result = await getSalaries(filters);

    return apiSuccess({
      data: result.data,
      pagination: paginationMeta(result.page, result.limit, result.total),
    });
  } catch (error) {
    return apiError(error);
  }
}
