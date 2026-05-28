import { InvoiceStatus } from "@prisma/client";

import { prisma } from "@/lib/db/client";
import { Decimal } from "@/lib/financial/calculations";

export type VendorBaseline = Readonly<{
  average: Decimal;
  standardDeviation: Decimal;
  sampleSize: number;
}>;

export type InvoiceAnomalyInput = Readonly<{
  amount: string;
  vendorName: string;
  userId: string;
  invoiceId?: string;
}>;

export type InvoiceAnomalyResult = Readonly<{
  isAnomaly: boolean;
  severity: "LOW" | "MEDIUM" | "HIGH" | null;
  reason: string | null;
  baseline: VendorBaseline;
}>;

const toDecimal = (value: string): Decimal => {
  return new Decimal(value).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
};

export const getVendorBaseline = async (
  userId: string,
  vendorName: string,
  excludeInvoiceId?: string,
): Promise<VendorBaseline> => {
  const invoices = await prisma.invoice.findMany({
    where: {
      userId,
      vendorName,
      status: InvoiceStatus.COMPLETED,
      amount: { not: null },
      ...(excludeInvoiceId ? { id: { not: excludeInvoiceId } } : {}),
    },
    select: {
      amount: true,
    },
  });

  if (invoices.length === 0) {
    return {
      average: new Decimal(0),
      standardDeviation: new Decimal(0),
      sampleSize: 0,
    };
  }

  const amounts = invoices
    .map((invoice) => invoice.amount)
    .filter((amount): amount is string => amount !== null)
    .map(toDecimal);

  const total = amounts.reduce((sum, amount) => sum.plus(amount), new Decimal(0));
  const average = total.div(amounts.length).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

  const variance =
    amounts.length > 1
      ? amounts
          .reduce((sum, amount) => {
            const delta = amount.minus(average);
            return sum.plus(delta.mul(delta));
          }, new Decimal(0))
          .div(amounts.length)
      : new Decimal(0);

  return {
    average,
    standardDeviation: variance.sqrt().toDecimalPlaces(2, Decimal.ROUND_HALF_UP),
    sampleSize: amounts.length,
  };
};

export const detectAnomaly = async (
  invoice: InvoiceAnomalyInput,
): Promise<InvoiceAnomalyResult> => {
  const baseline = await getVendorBaseline(
    invoice.userId,
    invoice.vendorName,
    invoice.invoiceId,
  );

  return evaluateInvoiceAnomaly({
    amount: invoice.amount,
    vendorName: invoice.vendorName,
    baseline,
  });
};

export const evaluateInvoiceAnomaly = (params: {
  amount: string;
  vendorName: string;
  baseline: VendorBaseline;
}): InvoiceAnomalyResult => {
  if (params.baseline.sampleSize === 0 || params.baseline.average.isZero()) {
    return {
      isAnomaly: false,
      severity: null,
      reason: null,
      baseline: params.baseline,
    };
  }

  const amount = toDecimal(params.amount);
  const ratio = amount.div(params.baseline.average);
  const isAnomaly = ratio.greaterThan(2.5);

  if (!isAnomaly) {
    return {
      isAnomaly: false,
      severity: null,
      reason: null,
      baseline: params.baseline,
    };
  }

  const severity: "LOW" | "MEDIUM" | "HIGH" =
    ratio.greaterThanOrEqualTo(4)
      ? "HIGH"
      : ratio.greaterThanOrEqualTo(3)
        ? "MEDIUM"
        : "LOW";

  return {
    isAnomaly: true,
    severity,
    reason: `Invoice amount is ${ratio.toFixed(2)}x the historical average for ${params.vendorName}.`,
    baseline: params.baseline,
  };
};
