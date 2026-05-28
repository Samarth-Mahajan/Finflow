import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText, Output } from "ai";
import Decimal from "decimal.js";
import { z } from "zod";

import {
  extractionResultSchema,
  type ExtractionResult,
} from "@/types/invoice";

const HUMAN_REVIEW_THRESHOLD = 0.85;

const extractionModelSchema = z.object({
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
  vatRate: z.object({
    value: z.enum(["0", "7", "19"]),
    confidence: z.number().min(0).max(1),
  }),
  date: z.object({
    value: z.string().min(1),
    confidence: z.number().min(0).max(1),
  }),
  invoiceNumber: z.object({
    value: z.string().trim().min(1).nullable(),
    confidence: z.number().min(0).max(1),
  }),
  overallConfidence: z.number().min(0).max(1),
  rawText: z.string().min(1),
});

type ExtractionModelOutput = z.infer<typeof extractionModelSchema>;

export type { ExtractionResult } from "@/types/invoice";

export class InvoiceExtractionError extends Error {
  readonly code:
    | "INVOICE_EXTRACTION_CONFIG_ERROR"
    | "INVOICE_EXTRACTION_MODEL_ERROR"
    | "INVOICE_EXTRACTION_VALIDATION_ERROR";
  readonly causeValue: unknown;

  constructor(
    code: InvoiceExtractionError["code"],
    message: string,
    causeValue?: unknown,
  ) {
    super(message);
    this.name = "InvoiceExtractionError";
    this.code = code;
    this.causeValue = causeValue;
  }
}

const normalizeMoney = (value: string): string => {
  const sanitized = value.replace(/[^\d,.-]/g, "").replace(",", ".");
  return new Decimal(sanitized).toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toFixed(2);
};

const normalizeDate = (value: string): string => {
  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    throw new InvoiceExtractionError(
      "INVOICE_EXTRACTION_VALIDATION_ERROR",
      "Gemini returned an invalid invoice date.",
      value,
    );
  }

  return parsedDate.toISOString();
};

const calculateNeedsHumanReview = (result: ExtractionModelOutput): boolean => {
  return [
    result.vendorName.confidence,
    result.amount.confidence,
    result.vatAmount.confidence,
    result.vatRate.confidence,
    result.date.confidence,
    result.invoiceNumber.confidence,
    result.overallConfidence,
  ].some((confidence) => confidence < HUMAN_REVIEW_THRESHOLD);
};

export const parseExtractionModelOutput = (
  result: ExtractionModelOutput,
): ExtractionResult => {
  const normalized = {
    ...result,
    amount: {
      ...result.amount,
      value: normalizeMoney(result.amount.value),
    },
    vatAmount: {
      ...result.vatAmount,
      value: normalizeMoney(result.vatAmount.value),
    },
    date: {
      ...result.date,
      value: normalizeDate(result.date.value),
    },
    invoiceNumber: {
      ...result.invoiceNumber,
      value: result.invoiceNumber.value?.trim() ?? null,
    },
    needsHumanReview: calculateNeedsHumanReview(result),
  };

  return extractionResultSchema.parse(normalized);
};

export const extractInvoiceData = async (params: {
  fileUrl: string;
  mimeType: string;
  fileName?: string | null;
}): Promise<ExtractionResult> => {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  if (!apiKey) {
    throw new InvoiceExtractionError(
      "INVOICE_EXTRACTION_CONFIG_ERROR",
      "GOOGLE_GENERATIVE_AI_API_KEY is not configured.",
    );
  }

  try {
    const google = createGoogleGenerativeAI({ apiKey });
    const { output } = await generateText({
      model: google("gemini-1.5-flash"),
      temperature: 0,
      system: [
        "You extract structured data from German SME invoices.",
        "Assume amounts are in EUR unless the document clearly states otherwise.",
        "German VAT rates allowed in this system are only 0, 7, or 19.",
        "Return ISO 8601 dates for invoice dates.",
        "Confidence values must be decimals between 0 and 1.",
        "If invoice number is missing, return null with an honest confidence score.",
        "Include OCR-style raw text from the document in rawText.",
      ].join(" "),
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: [
                "Extract the vendor name, gross amount, VAT amount, VAT rate, invoice date, invoice number, and raw text.",
                "If the document is ambiguous, keep the most plausible value and lower the confidence.",
              ].join(" "),
            },
            {
              type: "file",
              data: new URL(params.fileUrl),
              mediaType: params.mimeType,
              ...(params.fileName ? { filename: params.fileName } : {}),
            },
          ],
        },
      ],
      output: Output.object({
        schema: extractionModelSchema,
      }),
    });

    return parseExtractionModelOutput(output);
  } catch (error: unknown) {
    if (error instanceof InvoiceExtractionError) {
      throw error;
    }

    throw new InvoiceExtractionError(
      "INVOICE_EXTRACTION_MODEL_ERROR",
      "Gemini failed to extract structured invoice data.",
      error,
    );
  }
};
