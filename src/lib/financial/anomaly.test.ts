import { Decimal } from "@/lib/financial/calculations";
import { evaluateInvoiceAnomaly } from "@/lib/financial/anomaly";

describe("evaluateInvoiceAnomaly", () => {
  it("flags invoices above 2.5x the vendor baseline", () => {
    const result = evaluateInvoiceAnomaly({
      amount: "900.00",
      vendorName: "AWS",
      baseline: {
        average: new Decimal("250.00"),
        standardDeviation: new Decimal("30.00"),
        sampleSize: 6,
      },
    });

    expect(result.isAnomaly).toBe(true);
    expect(result.severity).toBe("MEDIUM");
    expect(result.reason).toContain("3.60x");
  });

  it("does not flag when there is no vendor baseline", () => {
    const result = evaluateInvoiceAnomaly({
      amount: "900.00",
      vendorName: "AWS",
      baseline: {
        average: new Decimal("0"),
        standardDeviation: new Decimal("0"),
        sampleSize: 0,
      },
    });

    expect(result.isAnomaly).toBe(false);
    expect(result.severity).toBeNull();
  });
});
