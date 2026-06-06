import { NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/lib/api-utils";
import { compareSchema } from "@/lib/validations/salary";
import { compareEntities } from "@/lib/services/compare.service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    const input = compareSchema.parse({
      type: searchParams.get("type"),
      entities: searchParams.get("entities")?.split(",").filter(Boolean) ?? [],
      roleId: searchParams.get("roleId") ?? undefined,
      levelId: searchParams.get("levelId") ?? undefined,
      locationId: searchParams.get("locationId") ?? undefined,
      companyId: searchParams.get("companyId") ?? undefined,
    });

    const results = await compareEntities(input);
    return apiSuccess({ data: results, type: input.type });
  } catch (error) {
    return apiError(error);
  }
}
