import { parseExtractionModelOutput } from "@/lib/ai/extraction";

describe("parseExtractionModelOutput", () => {
  it("normalizes invoice extraction data and flags low-confidence fields", () => {
    const result = parseExtractionModelOutput({
      vendorName: {
        value: "Muster Lieferant GmbH",
        confidence: 0.96,
      },
      amount: {
        value: "1234,5 EUR",
        confidence: 0.92,
      },
      vatAmount: {
        value: "234,56",
        confidence: 0.78,
      },
      vatRate: {
        value: "19",
        confidence: 0.97,
      },
      date: {
        value: "2026-05-27",
        confidence: 0.95,
      },
      invoiceNumber: {
        value: null,
        confidence: 0.7,
      },
      overallConfidence: 0.82,
      rawText: "Muster Lieferant GmbH Rechnung 1234,50 EUR",
    });

    expect(result.amount.value).toBe("1234.50");
    expect(result.vatAmount.value).toBe("234.56");
    expect(result.date.value).toBe("2026-05-27T00:00:00.000Z");
    expect(result.invoiceNumber.value).toBeNull();
    expect(result.needsHumanReview).toBe(true);
  });
});
