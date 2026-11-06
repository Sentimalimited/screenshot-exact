import { describe, expect, it } from "vitest";
import { calculateQuote, quoteText, type QuoteRates, type QuoteSelection } from "@/lib/bulk-quote";

// Test fixtures only, not Sentima commercial prices.
const selection: QuoteSelection = { students: 100, card: "PVC student ID card", doubleSided: false, labelsPerStudent: 0, accessories: [] };
const rates: QuoteRates = { card: 10, doubleSided: 2, label: 3, accessories: { Lanyard: 4 }, tiers: [{ minimum: 100, discountPercent: 10 }, { minimum: 200, discountPercent: 20 }] };
describe("Bulk quotations", () => {
  it("applies the highest qualifying whole-order tier at its boundary", () => {
    expect(calculateQuote({ ...selection, students: 99 }, rates).total).toBe(990);
    expect(calculateQuote(selection, rates).total).toBe(900);
    expect(calculateQuote({ ...selection, students: 200 }, rates).total).toBe(1600);
  });
  it("multiplies labels per student and accessories by student count", () => {
    const result = calculateQuote({ ...selection, doubleSided: true, labelsPerStudent: 2, accessories: ["Lanyard"] }, rates);
    expect(result.lines.map(l => l.quantity)).toEqual([100, 100, 200, 100]);
    expect(result.subtotal).toBe(2200);
    expect(result.total).toBe(1980);
  });
  it("never treats missing commercial rates as a free quotation", () => {
    expect(calculateQuote(selection, { ...rates, card: null }).total).toBeNull();
    expect(calculateQuote({ ...selection, accessories: ["Card holder"] }, rates).total).toBeNull();
  });
  it("does not produce a quotation total for zero students", () => {
    expect(calculateQuote({ ...selection, students: 0 }, rates).total).toBeNull();
  });
  it("preserves selected quantities and estimate in export data", () => {
    const result = calculateQuote(selection, rates);
    const text = quoteText("Example school", selection, result);
    expect(text).toContain("Student count: 100");
    expect(text).toContain("Estimated total: KSh 900.00");
  });
});