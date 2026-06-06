import { NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/lib/api-utils";
import { getCompanies } from "@/lib/services/company.service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const search = searchParams.get("search") ?? undefined;
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    const companies = await getCompanies(search, limit);
    return apiSuccess({ data: companies });
  } catch (error) {
    return apiError(error);
  }
}
