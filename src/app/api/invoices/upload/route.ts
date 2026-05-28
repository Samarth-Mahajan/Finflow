import { NextResponse } from "next/server";
import { AuditAction, AuditEntityType, InvoiceStatus } from "@prisma/client";
import { z } from "zod";

import {
  AppAuthenticationError,
  requireAuthenticatedAppUser,
} from "@/lib/auth/app-user";
import { logAuditEvent } from "@/lib/db/audit";
import { prisma } from "@/lib/db/client";
import { getRequestIpAddress } from "@/lib/http/request";
import { writeInvoiceStatusAuditLog } from "@/lib/invoices/invoice-pipeline";
import { enqueueInvoiceExtraction } from "@/lib/queue/invoice-queue";
import {
  UploadThingConfigurationError,
  getUploadThingApi,
} from "@/lib/uploadthing/utapi";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const allowedMimeTypes = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
]);

const uploadInvoiceSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => allowedMimeTypes.has(file.type), {
      message: "Only PDF, PNG, and JPG files are allowed.",
    })
    .refine((file) => file.size <= MAX_FILE_SIZE_BYTES, {
      message: "File size must be 10MB or smaller.",
    }),
});

const toErrorResponse = (message: string, status: number) => {
  return NextResponse.json({ error: message }, { status });
};

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const parsed = uploadInvoiceSchema.safeParse({
      file: formData.get("file"),
    });

    if (!parsed.success) {
      return toErrorResponse(parsed.error.issues[0]?.message ?? "Invalid upload.", 400);
    }

    const appUser = await requireAuthenticatedAppUser();
    const uploadResult = await getUploadThingApi().uploadFiles(parsed.data.file);

    if (uploadResult.error || uploadResult.data === null) {
      return toErrorResponse(
        uploadResult.error?.message ?? "UploadThing upload failed.",
        502,
      );
    }

    const invoice = await prisma.invoice.create({
      data: {
        userId: appUser.id,
        fileUrl: uploadResult.data.ufsUrl,
        fileName: uploadResult.data.name,
        mimeType: uploadResult.data.type,
        status: InvoiceStatus.QUEUED,
      },
    });

    const ipAddress = getRequestIpAddress(request);

    await logAuditEvent({
      entityType: AuditEntityType.INVOICE,
      entityId: invoice.id,
      action: AuditAction.CREATE,
      userId: appUser.id,
      ipAddress,
      newValue: {
        fileUrl: invoice.fileUrl,
        fileName: invoice.fileName,
        mimeType: invoice.mimeType,
        status: invoice.status,
      },
    });

    await writeInvoiceStatusAuditLog({
      invoiceId: invoice.id,
      userId: appUser.id,
      previousStatus: null,
      nextStatus: InvoiceStatus.QUEUED,
      ipAddress,
      metadata: {
        source: "upload-api",
      },
    });

    await enqueueInvoiceExtraction({
      invoiceId: invoice.id,
      fileUrl: invoice.fileUrl,
      userId: appUser.id,
    });

    return NextResponse.json({
      invoiceId: invoice.id,
      status: "queued" as const,
    });
  } catch (error: unknown) {
    if (error instanceof AppAuthenticationError) {
      return toErrorResponse(error.message, 401);
    }

    if (error instanceof UploadThingConfigurationError) {
      return toErrorResponse(error.message, 500);
    }

    return toErrorResponse("Failed to queue invoice upload.", 500);
  }
}
