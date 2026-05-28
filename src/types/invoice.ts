import { z } from "zod";

export const invoiceFieldSchema = z.object({
  value: z.string().nullable(),
  confidence: z.number().min(0).max(1),
});

export const vatRateFieldSchema = z.object({
  value: z.enum(["0", "7", "19"]),
  confidence: z.number().min(0).max(1),
});

export const extractionResultSchema = z.object({
  vendorName: z.object({
    value: z.string().min(1),
    confidence: z.number().min(0).max(1),
  }),
  amount: z.object({
    value: z.string().min(1),
    confidence: z.number().min(0).max(1),
  }),
  vatAmount: z.object({
    value: z.string().min(1),
    confidence: z.number().min(0).max(1),
  }),
  vatRate: vatRateFieldSchema,
  date: z.object({
    value: z.string().min(1),
    confidence: z.number().min(0).max(1),
  }),
  invoiceNumber: invoiceFieldSchema,
  overallConfidence: z.number().min(0).max(1),
  needsHumanReview: z.boolean(),
  rawText: z.string().min(1),
});

export type ExtractionResult = z.infer<typeof extractionResultSchema>;

export const invoiceReviewPayloadSchema = z.object({
  vendorName: z.string().trim().min(1),
  amount: z.string().trim().min(1),
  vatAmount: z.string().trim().min(1),
  vatRate: z.enum(["0", "7", "19"]),
  date: z.string().trim().min(1),
  invoiceNumber: z.string().trim().nullable(),
});

export type InvoiceReviewPayload = z.infer<typeof invoiceReviewPayloadSchema>;

export type InvoiceStatusResponse = Readonly<{
  invoiceId: string;
  status: "queued" | "processing" | "completed" | "failed" | "needs_review";
  processingError: string | null;
  extraction: ExtractionResult | null;
  anomaly: {
    isAnomaly: boolean;
    severity: "LOW" | "MEDIUM" | "HIGH" | null;
    reason: string | null;
  } | null;
}>;
