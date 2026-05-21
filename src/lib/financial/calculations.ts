import Decimal from "decimal.js";

import { VATRate } from "@prisma/client";

export { Decimal, VATRate };

export type MonetaryAmount = Decimal;
export type MonetaryAmountInput = Decimal.Value;

const VAT_PERCENTAGES: Record<VATRate, Decimal> = {
  [VATRate.ZERO]: new Decimal(0),
  [VATRate.SEVEN]: new Decimal(7),
  [VATRate.NINETEEN]: new Decimal(19),
};

const CURRENCY = "EUR";

export const formatCurrency = (
  amount: Decimal,
  locale: string,
): string => {
  const normalizedAmount = amount.toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: CURRENCY,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(normalizedAmount.toString()));
};

export const calculateVAT = (
  net: Decimal,
  rate: VATRate,
): Decimal => {
  const vatPercentage = VAT_PERCENTAGES[rate];

  return net.mul(vatPercentage).div(100).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
};

export const calculateNet = (
  gross: Decimal,
  rate: VATRate,
): Decimal => {
  const vatPercentage = VAT_PERCENTAGES[rate];

  if (vatPercentage.isZero()) {
    return gross.toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
  }

  return gross
    .div(vatPercentage.div(100).plus(1))
    .toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
};

export const sumAmounts = (
  amounts: Decimal[],
): Decimal => {
  return amounts.reduce(
    (total, amount) => total.plus(amount),
    new Decimal(0),
  );
};
