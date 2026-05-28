import { NextResponse } from "next/server";
import { z } from "zod";

import {
  AppAuthenticationError,
  requireAuthenticatedAppUser,
} from "@/lib/auth/app-user";
import { getRequestIpAddress } from "@/lib/http/request";
import {
  InvoicePipelineError,
  confirmReviewedInvoice,
} from "@/lib/invoices/invoice-pipeline";
import { invoiceReviewPayloadSchema } from "@/types/invoice";

const paramsSchema = z.object({
  id: z.string().min(1),
});

const toErrorResponse = (message: string, status: number) => {
  return NextResponse.json({ error: message }, { status });
};

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const appUser = await requireAuthenticatedAppUser();
    const parsedParams = paramsSchema.safeParse(await context.params);

    if (!parsedParams.success) {
      return toErrorResponse("Invalid invoice id.", 400);
    }

    const body = await request.json();
    const parsedBody = invoiceReviewPayloadSchema.safeParse(body);

    if (!parsedBody.success) {
      return toErrorResponse(
        parsedBody.error.issues[0]?.message ?? "Invalid review payload.",
        400,
      );
    }

    await confirmReviewedInvoice({
      invoiceId: parsedParams.data.id,
      userId: appUser.id,
      review: parsedBody.data,
      ipAddress: getRequestIpAddress(request),
    });

    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    if (error instanceof AppAuthenticationError) {
      return toErrorResponse(error.message, 401);
    }

    if (error instanceof InvoicePipelineError) {
      return toErrorResponse(error.message, 400);
    }

    return toErrorResponse("Failed to confirm invoice review.", 500);
  }
}
