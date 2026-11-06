import { useState } from "react";
import { Download, MessageCircle, Minus, Plus, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CARD_OPTIONS, ACCESSORIES, calculateQuote, quoteText, type QuoteRates, type QuoteSelection } from "@/lib/bulk-quote";
import { whatsappLink, type SiteSettings } from "@/lib/site";
import idCards from "@/assets/service-id-cards.jpg";

const money = (n: number) => `KSh ${n.toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function BulkQuoteCalculator({ settings }: { settings: SiteSettings | null }) {
  const [school, setSchool] = useState("");
  const [students, setStudents] = useState("100");
  const [card, setCard] = useState<string>(CARD_OPTIONS[0]);
  const [doubleSided, setDoubleSided] = useState(false);
  const [labels, setLabels] = useState("0");
  const [accessories, setAccessories] = useState<string[]>([]);
  const [rateValues, setRateValues] = useState<Record<string, string>>({});
  const [tiers, setTiers] = useState<{ minimum: string; discount: string }[]>([]);
  const valid = /^\d+$/.test(students) && Number(students) > 0 && Number.isSafeInteger(Number(students));
  const rate = (key: string) => rateValues[key]?.trim() ? Number(rateValues[key]) : null;
  const selection: QuoteSelection = { students: valid ? Number(students) : 0, card, doubleSided, labelsPerStudent: Number(labels), accessories };
  const rates: QuoteRates = { card: rate(card), doubleSided: rate("doubleSided"), label: rate("label"), accessories: Object.fromEntries(ACCESSORIES.map(a => [a, rate(a)])), tiers: tiers.filter(t => t.minimum && t.discount).map(t => ({ minimum: Number(t.minimum), discountPercent: Number(t.discount) })) };
  const result = calculateQuote(selection, rates);
  const text = quoteText(school, selection, result);
  const download = () => {
    const url = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "sentima-quotation-request.txt";
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const rateInput = (key: string, label: string) => <div key={key} className="space-y-2"><Label htmlFor={`rate-${key}`}>{label} (KSh / item)</Label><Input id={`rate-${key}`} type="number" min="0" step="0.01" placeholder="Not confirmed" value={rateValues[key] ?? ""} onChange={e => setRateValues(v => ({ ...v, [key]: e.target.value }))} /></div>;

  return <section id="bulk-quotation" className="border-y border-border bg-card">
    <div className="mx-auto max-w-7xl px-5 py-16 md:px-8">
      <p className="eyebrow">School orders</p>
      <h2 className="mt-3 text-4xl">Bulk quotation calculator</h2>
      <div className="mt-10 grid gap-10 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-8">
          <div className="space-y-2"><Label htmlFor="quote-school">School / organisation (optional)</Label><Input id="quote-school" value={school} onChange={e => setSchool(e.target.value)} maxLength={160} placeholder="School name" /></div>
          <div className="space-y-2"><Label htmlFor="quote-students">Student count</Label><div className="flex items-center gap-2">
            <Button variant="outline" size="icon" aria-label="Decrease student count" disabled={!valid || Number(students) <= 1} onClick={() => setStudents(String(Number(students) - 1))}><Minus /></Button>
            <Input id="quote-students" className="max-w-40 text-center" type="number" min="1" step="1" value={students} onChange={e => setStudents(e.target.value)} aria-invalid={!valid} />
            <Button variant="outline" size="icon" aria-label="Increase student count" disabled={!valid} onClick={() => setStudents(String(Number(students) + 1))}><Plus /></Button>
          </div>{!valid && <p role="alert" className="text-sm text-destructive">Enter a positive whole student count.</p>}</div>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2"><Label htmlFor="quote-card">Student ID card</Label><Select value={card} onValueChange={setCard}><SelectTrigger id="quote-card"><SelectValue /></SelectTrigger><SelectContent>{CARD_OPTIONS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-2"><Label htmlFor="quote-labels">Uniform labels per student</Label><Select value={labels} onValueChange={setLabels}><SelectTrigger id="quote-labels"><SelectValue /></SelectTrigger><SelectContent>{[0, 1, 2, 3, 4, 5, 6].map(n => <SelectItem key={n} value={String(n)}>{n === 0 ? "No uniform labelling" : String(n)}</SelectItem>)}</SelectContent></Select></div>
          </div>
          <fieldset className="space-y-4"><legend className="mb-4 font-semibold">Printing & accessories</legend>
            <div className="flex items-center gap-3"><Checkbox id="quote-double" checked={doubleSided} onCheckedChange={v => setDoubleSided(v === true)} /><Label htmlFor="quote-double">Double-sided printing</Label></div>
            {ACCESSORIES.map(a => <div key={a} className="flex items-center gap-3"><Checkbox id={`accessory-${a}`} checked={accessories.includes(a)} onCheckedChange={v => setAccessories(prev => v === true ? [...prev, a] : prev.filter(item => item !== a))} /><Label htmlFor={`accessory-${a}`}>{a} · one per student</Label></div>)}
          </fieldset>
          <details className="border-t border-border pt-5"><summary className="cursor-pointer font-semibold">Agreed rates & bulk discounts (optional)</summary>
            <p className="mt-3 text-sm text-muted-foreground">No published rates are available. Enter only rates and discounts already agreed with Sentima. An estimate is not an order confirmation.</p>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">{rateInput(card, card)}{doubleSided && rateInput("doubleSided", "Double-sided supplement")}{Number(labels) > 0 && rateInput("label", "Uniform label")}{accessories.map(a => rateInput(a, a))}</div>
            <p className="mt-6 text-sm text-muted-foreground">The highest qualifying student-count tier applies to all selected items. VAT and delivery are excluded pending confirmation.</p>
            <div className="mt-4 space-y-3">{tiers.map((t, i) => <div key={i} className="grid grid-cols-[1fr_1fr_auto] items-end gap-3">
              <div className="space-y-2"><Label htmlFor={`tier-min-${i}`}>Minimum students</Label><Input id={`tier-min-${i}`} type="number" min="1" step="1" value={t.minimum} onChange={e => setTiers(prev => prev.map((v, index) => index === i ? { ...v, minimum: e.target.value } : v))} /></div>
              <div className="space-y-2"><Label htmlFor={`tier-discount-${i}`}>Discount (%)</Label><Input id={`tier-discount-${i}`} type="number" min="0" max="100" value={t.discount} onChange={e => setTiers(prev => prev.map((v, index) => index === i ? { ...v, discount: e.target.value } : v))} /></div>
              <Button variant="ghost" size="icon" aria-label={`Remove discount tier ${i + 1}`} onClick={() => setTiers(prev => prev.filter((_, index) => index !== i))}><Minus /></Button>
            </div>)}</div>
            <Button variant="outline" className="mt-4" onClick={() => setTiers(prev => [...prev, { minimum: "", discount: "" }])}><Plus />Add discount tier</Button>
          </details>
        </div>
        <aside className="min-w-0 border border-border rounded-lg bg-background p-6 md:p-8">
          <img src={idCards} alt="Illustrative student ID card samples" className="aspect-[2/1] w-full rounded-md object-cover" />
          <div className="mt-6 flex items-center gap-3"><Calculator className="size-5 text-seal" /><h3 className="text-2xl">Quotation summary</h3></div>
          <p className="mt-2 text-sm text-muted-foreground">Requested specifications · availability to be confirmed</p>
          <dl className="mt-6 divide-y divide-border">{result.lines.map(l => <div key={l.name} className="flex flex-wrap justify-between gap-3 py-4 text-sm"><dt className="min-w-0 flex-1"><span className="font-semibold">{l.name}</span><span className="mt-1 block text-muted-foreground">{l.quantity.toLocaleString("en-KE")} items{l.unitPrice !== null ? ` × ${money(l.unitPrice)}` : ""}</span></dt><dd>{l.total === null ? "Price to confirm" : money(l.total)}</dd></div>)}</dl>
          <div aria-live="polite" aria-atomic="true" className="mt-4 border-t-2 border-gold pt-5">{result.discountPercent > 0 && <p className="mb-3 text-sm">Bulk discount ({result.discountPercent}%): −{money(result.discount)}</p>}<p className="text-sm text-muted-foreground">Estimated total</p><p className="mt-2 break-words font-display text-3xl">{result.total === null ? "Awaiting confirmed prices" : money(result.total)}</p></div>
          <p className="mt-4 text-xs leading-relaxed text-muted-foreground">No learner names or personal details. Estimates use requester-entered rates. Final specifications, prices, VAT and delivery require a written quotation.</p>
          <div className="mt-6 flex flex-col gap-3"><Button disabled={!valid} onClick={download} variant="outline"><Download />Export quotation request</Button>
            <Button disabled={!valid} asChild={valid}>{valid ? <a href={whatsappLink(settings, text)} target="_blank" rel="noopener noreferrer"><MessageCircle />Request quotation on WhatsApp</a> : <span><MessageCircle />Request quotation on WhatsApp</span>}</Button>
          </div>
        </aside>
      </div>
    </div>
  </section>;
}