import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { CtaBand, PageHeader } from "@/components/site/blocks";
import { Seal } from "@/components/site/ornament";
import { useSiteContent } from "@/lib/content-query";
import { seo, type PortfolioItem } from "@/lib/site";

export const Route = createFileRoute("/portfolio")({
  head: ({ matches }) =>
    seo({
      matches,
      path: "/portfolio",
      title: "Gothic Calligraphy Portfolio | Hand-Lettered Certificates Kenya — Sentima",
      description:
        "Browse hand-lettered Gothic calligraphy certificates, celebration and event pieces by Sentima, serving Kakamega, Western Kenya and Nairobi.",
    }),
  component: Portfolio,
});

const CATEGORIES = [
  { id: "all", label: "All work" },
  { id: "certificates", label: "Certificates" },
  { id: "celebrations", label: "Celebrations" },
  { id: "events", label: "Event pieces" },
  { id: "other", label: "Other" },
] as const;

function Portfolio() {
  const { portfolio } = useSiteContent();
  const [cat, setCat] = useState<string>("all");
  const [open, setOpen] = useState<PortfolioItem | null>(null);
  const items = cat === "all" ? portfolio : portfolio.filter((p) => p.category === cat);
  const available = CATEGORIES.filter((c) => c.id === "all" || portfolio.some((p) => p.category === c.id));

  return (
    <>
      <PageHeader eyebrow="Calligraphy portfolio" title="Lettered by hand, one piece at a time" intro="Certificates, celebration pieces and event work in Gothic blackletter and complementary styles." />

      <section className="mx-auto max-w-7xl px-5 py-16 md:px-8">
        {portfolio.length === 0 ? (
          <div className="card-parchment frame-gold mx-auto max-w-2xl p-12 text-center">
            <Seal size={64} className="mx-auto" />
            <h2 className="mt-6 text-3xl">Our portfolio is being prepared</h2>
            <p className="mt-3 text-muted-foreground">
              We are photographing approved pieces for this gallery. In the meantime, we are happy to share
              samples of our calligraphy directly.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button asChild variant="seal"><Link to="/request-a-quote" search={{ service: "Gothic Calligraphy & Certificates" }}>Request a calligraphy quote</Link></Button>
              <Button asChild variant="outline"><Link to="/contact">Ask for samples</Link></Button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter portfolio">
              {available.map((c) => (
                <button
                  key={c.id}
                  role="tab"
                  aria-selected={cat === c.id}
                  onClick={() => setCat(c.id)}
                  className={`rounded-sm border px-4 py-2 text-sm font-semibold transition-colors ${cat === c.id ? "border-foreground bg-foreground text-background" : "border-border bg-card hover:border-gold"}`}
                >
                  {c.label}
                </button>
              ))}
            </div>
            <div className="mt-10 columns-1 gap-5 sm:columns-2 lg:columns-3">
              {items.map((p) => (
                <button key={p.id} onClick={() => setOpen(p)} className="group mb-5 block w-full break-inside-avoid text-left">
                  <div className="overflow-hidden bg-muted">
                    <img src={p.image_url} alt={p.alt_text || p.title} loading="lazy" className="w-full transition-transform duration-700 group-hover:scale-105" />
                  </div>
                  <p className="mt-3 font-display text-xl font-semibold">{p.title}</p>
                  {p.caption && <p className="text-sm text-muted-foreground">{p.caption}</p>}
                </button>
              ))}
            </div>
          </>
        )}
      </section>

      <Dialog open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="max-w-4xl border-gold/40 bg-card p-3 sm:p-4">
          {open && (
            <>
              <img src={open.image_url} alt={open.alt_text || open.title} className="max-h-[75vh] w-full object-contain" />
              <div className="px-2 pb-2">
                <DialogTitle className="font-display text-2xl">{open.title}</DialogTitle>
                <DialogDescription className="mt-1 text-sm">{open.description || open.caption}</DialogDescription>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <CtaBand title="Planning a prize-giving or celebration?" text="Tell us the number of pieces, the wording and your date, and we will prepare a quotation." />
    </>
  );
}
