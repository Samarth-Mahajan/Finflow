import {
  AnomalySeverity,
  AuditAction,
  AuditEntityType,
  InvoiceStatus,
  type Prisma,
  VATRate,
} from "@prisma/client";
import Decimal from "decimal.js";

import { logAuditEvent } from "@/lib/db/audit";
import { prisma } from "@/lib/db/client";
import { detectAnomaly } from "@/lib/financial/anomaly";
import {
  extractionResultSchema,
  type ExtractionResult,
  type InvoiceReviewPayload,
} from "@/types/invoice";

export class InvoicePipelineError extends Error {
  readonly code = "INVOICE_PIPELINE_ERROR";

  constructor(message: string) {
    super(message);
    this.name = "InvoicePipelineError";
  }
}

export const mapVatRateStringToEnum = (value: "0" | "7" | "19"): VATRate => {
  switch (value) {
    case "0":
      return VATRate.ZERO;
    case "7":
      return VATRate.SEVEN;
    case "19":
      return VATRate.NINETEEN;
  }
};

export const mapInvoiceStatusToClientStatus = (
  status: InvoiceStatus,
): "queued" | "processing" | "completed" | "failed" | "needs_review" => {
  switch (status) {
    case InvoiceStatus.QUEUED:
      return "queued";
    case InvoiceStatus.PROCESSING:
      return "processing";
    case InvoiceStatus.COMPLETED:
      return "completed";
    case InvoiceStatus.FAILED:
      return "failed";
    case InvoiceStatus.NEEDS_REVIEW:
      return "needs_review";
  }
};

export const parseExtractionData = (
  value: Prisma.JsonValue | null,
): ExtractionResult | null => {
  if (value === null) {
    return null;
  }

  const parsed = extractionResultSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
};

const normalizeMoneyValue = (value: string): string => {
  return new Decimal(value).toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toFixed(2);
};

const normalizeDateValue = (value: string): Date => {
  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    throw new InvoicePipelineError("Invoice date must be a valid ISO date.");
  }

  return parsedDate;
};

const buildExtractionData = (
  extraction: ExtractionResult,
  overrides?: Partial<InvoiceReviewPayload>,
): ExtractionResult => {
  const merged: ExtractionResult = {
    ...extraction,
    vendorName: {
      ...extraction.vendorName,
      value: overrides?.vendorName ?? extraction.vendorName.value,
    },
    amount: {
      ...extraction.amount,
      value: overrides?.amount ?? extraction.amount.value,
    },
    vatAmount: {
      ...extraction.vatAmount,
      value: overrides?.vatAmount ?? extraction.vatAmount.value,
    },
    vatRate: {
      ...extraction.vatRate,
      value: overrides?.vatRate ?? extraction.vatRate.value,
    },
    date: {
      ...extraction.date,
      value: overrides?.date ?? extraction.date.value,
    },
    invoiceNumber: {
      ...extraction.invoiceNumber,
      value: overrides?.invoiceNumber ?? extraction.invoiceNumber.value,
    },
    needsHumanReview: false,
  };

  return extractionResultSchema.parse(merged);
};

export const writeInvoiceStatusAuditLog = async (params: {
  invoiceId: string;
  userId: string;
  previousStatus: InvoiceStatus | null;
  nextStatus: InvoiceStatus;
  ipAddress: string | null;
  metadata?: Prisma.InputJsonValue;
}): Promise<void> => {
  await logAuditEvent({
    entityType: AuditEntityType.INVOICE,
    entityId: params.invoiceId,
    action: params.previousStatus === null ? AuditAction.CREATE : AuditAction.UPDATE,
    userId: params.userId,
    ipAddress: params.ipAddress,
    oldValue:
      params.previousStatus === null
        ? undefined
        : {
            status: params.previousStatus,
          },
    newValue: {
      status: params.nextStatus,
      ...(params.metadata !== undefined ? { metadata: params.metadata } : {}),
    },
  });
};

export const persistExtractionOutcome = async (params: {
  invoiceId: string;
  userId: string;
  extraction: ExtractionResult;
  ipAddress: string | null;
  statusOverride?: InvoiceStatus;
}): Promise<void> => {
  const anomaly = await detectAnomaly({
    amount: params.extraction.amount.value,
    vendorName: params.extraction.vendorName.value,
    userId: params.userId,
    invoiceId: params.invoiceId,
  });

  const status =
    params.statusOverride ??
    (params.extraction.needsHumanReview
      ? InvoiceStatus.NEEDS_REVIEW
      : InvoiceStatus.COMPLETED);

  const previousInvoice = await prisma.invoice.findUnique({
    where: { id: params.invoiceId },
    select: { status: true },
  });

  if (!previousInvoice) {
    throw new InvoicePipelineError("Invoice not found while saving extraction results.");
  }

  await prisma.invoice.update({
    where: { id: params.invoiceId },
    data: {
      vendorName: params.extraction.vendorName.value,
      amount: normalizeMoneyValue(params.extraction.amount.value),
      vatAmount: normalizeMoneyValue(params.extraction.vatAmount.value),
      vatRate: mapVatRateStringToEnum(params.extraction.vatRate.value),
      invoiceDate: normalizeDateValue(params.extraction.date.value),
      invoiceNumber: params.extraction.invoiceNumber.value,
      rawText: params.extraction.rawText,
      overallConfidence: params.extraction.overallConfidence.toFixed(2),
      extractionData: params.extraction as unknown as Prisma.InputJsonValue,
      extractedAt: new Date(),
      processingError: null,
      status,
      isAnomaly: anomaly.isAnomaly,
      anomalySeverity: anomaly.severity as AnomalySeverity | null,
      anomalyReason: anomaly.reason,
      ...(status === InvoiceStatus.COMPLETED ? { reviewedAt: new Date() } : {}),
    },
  });

  await writeInvoiceStatusAuditLog({
    invoiceId: params.invoiceId,
    userId: params.userId,
    previousStatus: previousInvoice.status,
    nextStatus: status,
    ipAddress: params.ipAddress,
    metadata: {
      overallConfidence: params.extraction.overallConfidence,
      needsHumanReview: params.extraction.needsHumanReview,
      isAnomaly: anomaly.isAnomaly,
      anomalySeverity: anomaly.severity,
      anomalyReason: anomaly.reason,
    },
  });
};

export const confirmReviewedInvoice = async (params: {
  invoiceId: string;
  userId: string;
  review: InvoiceReviewPayload;
  ipAddress: string | null;
}): Promise<void> => {
  const invoice = await prisma.invoice.findUnique({
    where: { id: params.invoiceId },
    select: {
      id: true,
      userId: true,
      status: true,
      extractionData: true,
      rawText: true,
    },
  });

  if (!invoice || invoice.userId !== params.userId) {
    throw new InvoicePipelineError("Invoice not found.");
  }

  const extraction =
    parseExtractionData(invoice.extractionData) ??
    extractionResultSchema.parse({
      vendorName: { value: params.review.vendorName, confidence: 1 },
      amount: { value: params.review.amount, confidence: 1 },
      vatAmount: { value: params.review.vatAmount, confidence: 1 },
      vatRate: { value: params.review.vatRate, confidence: 1 },
      date: { value: params.review.date, confidence: 1 },
      invoiceNumber: { value: params.review.invoiceNumber, confidence: 1 },
      overallConfidence: 1,
      needsHumanReview: false,
      rawText: invoice.rawText ?? "Manually reviewed invoice.",
    });

  const reviewedExtraction = buildExtractionData(extraction, params.review);

  await persistExtractionOutcome({
    invoiceId: invoice.id,
    userId: invoice.userId,
    extraction: {
      ...reviewedExtraction,
      overallConfidence: 1,
      needsHumanReview: false,
    },
    ipAddress: params.ipAddress,
    statusOverride: InvoiceStatus.COMPLETED,
  });
};
