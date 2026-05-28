import { NextResponse } from "next/server";
import { z } from "zod";

import {
  AppAuthenticationError,
  requireAuthenticatedAppUser,
} from "@/lib/auth/app-user";
import { prisma } from "@/lib/db/client";
import {
  mapInvoiceStatusToClientStatus,
  parseExtractionData,
} from "@/lib/invoices/invoice-pipeline";
import type { InvoiceStatusResponse } from "@/types/invoice";

const paramsSchema = z.object({
  id: z.string().min(1),
});

const toErrorResponse = (message: string, status: number) => {
  return NextResponse.json({ error: message }, { status });
};

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const appUser = await requireAuthenticatedAppUser();
    const parsedParams = paramsSchema.safeParse(await context.params);

    if (!parsedParams.success) {
      return toErrorResponse("Invalid invoice id.", 400);
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id: parsedParams.data.id },
      select: {
        id: true,
        userId: true,
        status: true,
        extractionData: true,
        processingError: true,
        isAnomaly: true,
        anomalySeverity: true,
        anomalyReason: true,
      },
    });

    if (!invoice || invoice.userId !== appUser.id) {
      return toErrorResponse("Invoice not found.", 404);
    }

    const response: InvoiceStatusResponse = {
      invoiceId: invoice.id,
      status: mapInvoiceStatusToClientStatus(invoice.status),
      processingError: invoice.processingError,
      extraction: parseExtractionData(invoice.extractionData),
      anomaly: {
        isAnomaly: invoice.isAnomaly,
        severity: invoice.anomalySeverity,
        reason: invoice.anomalyReason,
      },
    };

    return NextResponse.json(response);
  } catch (error: unknown) {
    if (error instanceof AppAuthenticationError) {
      return toErrorResponse(error.message, 401);
    }

    return toErrorResponse("Failed to load invoice status.", 500);
  }
}
