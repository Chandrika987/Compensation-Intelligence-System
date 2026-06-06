import { NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/lib/api-utils";
import { salarySubmissionSchema } from "@/lib/validations/salary";
import { createSalarySubmission } from "@/lib/services/company.service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = salarySubmissionSchema.parse(body);
    const submission = await createSalarySubmission(input);

    return apiSuccess({ data: submission }, 201, 0);
  } catch (error) {
    return apiError(error);
  }
}
