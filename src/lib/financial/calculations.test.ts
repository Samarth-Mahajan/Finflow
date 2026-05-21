import { describe, expect, it } from "@jest/globals";
import Decimal from "decimal.js";

import {
  VATRate,
  calculateNet,
  calculateVAT,
  formatCurrency,
  sumAmounts,
} from "@/lib/financial/calculations";

const normalizeCurrencyWhitespace = (value: string): string => {
  return value.replace(/\s+/g, " ").trim();
};

describe("financial calculations", () => {
  it("calculates German VAT rates accurately", () => {
    expect(calculateVAT(new Decimal("100.00"), VATRate.ZERO).toString()).toBe("0");
    expect(calculateVAT(new Decimal("100.00"), VATRate.SEVEN).toString()).toBe("7");
    expect(calculateVAT(new Decimal("100.00"), VATRate.NINETEEN).toString()).toBe("19");
  });

  it("derives net amounts from gross totals with half-up rounding", () => {
    expect(calculateNet(new Decimal("119.00"), VATRate.NINETEEN).toString()).toBe("100");
    expect(calculateNet(new Decimal("107.00"), VATRate.SEVEN).toString()).toBe("100");
    expect(calculateNet(new Decimal("0.00"), VATRate.ZERO).toString()).toBe("0");
  });

  it("formats euro amounts for German locales", () => {
    const formatted = formatCurrency(new Decimal("1234.56"), "de-DE");

    expect(normalizeCurrencyWhitespace(formatted)).toBe("1.234,56 €");
  });

  it("sums arrays of Decimal amounts without losing precision", () => {
    const total = sumAmounts([
      new Decimal("0.10"),
      new Decimal("0.20"),
      new Decimal("9999999.70"),
    ]);

    expect(total.toString()).toBe("10000000");
  });

  it("handles zero, large amounts, and rounding edge cases", () => {
    expect(calculateVAT(new Decimal("0.00"), VATRate.NINETEEN).toString()).toBe("0");
    expect(calculateVAT(new Decimal("999999999999.99"), VATRate.NINETEEN).toString()).toBe(
      "190000000000",
    );
    expect(calculateVAT(new Decimal("10.005"), VATRate.NINETEEN).toString()).toBe("1.9");
    expect(calculateNet(new Decimal("11.90"), VATRate.NINETEEN).toString()).toBe("10");
  });
});
