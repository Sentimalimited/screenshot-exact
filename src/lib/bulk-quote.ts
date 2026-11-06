export const CARD_OPTIONS = ["PVC student ID card", "Laminated student ID card"] as const;
export const ACCESSORIES = ["Lanyard", "Card holder"] as const;
export type QuoteSelection = {
  students: number;
  card: string;
  doubleSided: boolean;
  labelsPerStudent: number;
  accessories: string[];
};
export type QuoteRates = {
  card: number | null;
  doubleSided: number | null;
  label: number | null;
  accessories: Record<string, number | null>;
  tiers: { minimum: number; discountPercent: number }[];
};
export type QuoteLine = { name: string; quantity: number; unitPrice: number | null; total: number | null };

export function calculateQuote(selection: QuoteSelection, rates: QuoteRates) {
  const students = Math.max(0, Math.floor(selection.students));
  const line = (name: string, quantity: number, price: number | null): QuoteLine => {
    const unitPrice = price !== null && Number.isFinite(price) && price >= 0 ? price : null;
    return { name, quantity, unitPrice, total: unitPrice === null ? null : Math.round(quantity * unitPrice * 100) / 100 };
  };
  const lines = [line(selection.card, students, rates.card)];
  if (selection.doubleSided) lines.push(line("Double-sided printing supplement", students, rates.doubleSided));
  if (selection.labelsPerStudent > 0) lines.push(line("Uniform labels", students * Math.floor(selection.labelsPerStudent), rates.label));
  for (const name of selection.accessories) lines.push(line(name, students, rates.accessories[name] ?? null));
  const tier = [...rates.tiers].filter(t => t.minimum > 0 && students >= t.minimum && t.discountPercent >= 0 && t.discountPercent <= 100)
    .sort((a, b) => b.minimum - a.minimum)[0];
  const discountPercent = tier?.discountPercent ?? 0;
  const complete = students > 0 && lines.every(l => l.total !== null);
  const subtotal = lines.reduce((sum, l) => sum + (l.total ?? 0), 0);
  const discount = Math.round(subtotal * discountPercent) / 100;
  return { lines, complete, discountPercent, subtotal, discount, total: complete ? Math.round((subtotal - discount) * 100) / 100 : null };
}

export function quoteText(school: string, selection: QuoteSelection, result: ReturnType<typeof calculateQuote>) {
  const money = (value: number) => `KSh ${value.toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  return ["SENTIMA — BULK QUOTATION REQUEST", school.trim() ? `School / organisation: ${school.trim()}` : "", `Student count: ${selection.students}`,
    ...result.lines.map(l => `${l.name}: ${l.quantity}${l.total === null ? " — price to be confirmed" : ` × ${money(l.unitPrice ?? 0)} = ${money(l.total)}`}`),
    ...(result.discountPercent ? [`Entered bulk discount: ${result.discountPercent}% (${money(result.discount)})`] : []),
    result.total === null ? "Total: awaiting confirmed prices" : `Estimated total: ${money(result.total)}`,
    "Rates entered by requester, not an approved Sentima quotation. Availability, VAT and delivery to be confirmed. Please confirm specifications and issue a written quotation."
  ].filter(Boolean).join("\n");
}