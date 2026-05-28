import { NextResponse } from "next/server";
import { InvoiceStatus } from "@prisma/client";
import { z } from "zod";

import {
  AppAuthenticationError,
  requireAuthenticatedAppUser,
} from "@/lib/auth/app-user";
import { prisma } from "@/lib/db/client";
import { getRequestIpAddress } from "@/lib/http/request";
import { writeInvoiceStatusAuditLog } from "@/lib/invoices/invoice-pipeline";
import { enqueueInvoiceExtraction } from "@/lib/queue/invoice-queue";

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

    const invoice = await prisma.invoice.findUnique({
      where: { id: parsedParams.data.id },
      select: {
        id: true,
        userId: true,
        status: true,
        fileUrl: true,
      },
    });

    if (!invoice || invoice.userId !== appUser.id) {
      return toErrorResponse("Invoice not found.", 404);
    }

    if (invoice.status !== InvoiceStatus.FAILED) {
      return toErrorResponse("Only failed invoices can be retried.", 409);
    }

    await prisma.invoice.update({
      where: { id: invoice.id },
      data: {
        status: InvoiceStatus.QUEUED,
        processingError: null,
      },
    });

    await writeInvoiceStatusAuditLog({
      invoiceId: invoice.id,
      userId: appUser.id,
      previousStatus: InvoiceStatus.FAILED,
      nextStatus: InvoiceStatus.QUEUED,
      ipAddress: getRequestIpAddress(request),
      metadata: {
        source: "retry-api",
      },
    });

    await enqueueInvoiceExtraction({
      invoiceId: invoice.id,
      fileUrl: invoice.fileUrl,
      userId: appUser.id,
    });

    return NextResponse.json({ ok: true, status: "queued" as const });
  } catch (error: unknown) {
    if (error instanceof AppAuthenticationError) {
      return toErrorResponse(error.message, 401);
    }

    return toErrorResponse("Failed to retry invoice extraction.", 500);
  }
}
