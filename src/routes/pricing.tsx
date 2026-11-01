import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { CtaBand, PageHeader } from "@/components/site/blocks";
import { useSiteContent } from "@/lib/content-query";
import { seo } from "@/lib/site";

export const Route = createFileRoute("/pricing")({
  head: ({ matches }) =>
    seo({
      matches,
      path: "/pricing",
      title: "Pricing & Packages | Per-Learner School Services — Sentima",
      description:
        "How Sentima prices student ID cards, uniform labelling, calligraphy certificates and other school services. Clear written quotations for every school.",
    }),
  component: Pricing,
});

const PROCESS = [
  { title: "Share your requirements", text: "Tell us the service, approximate number of learners or items, and your timing." },
  { title: "Receive a written quotation", text: "We confirm the price per learner, per item or per job, with what is included." },
  { title: "Approve and schedule", text: "Once approved, we agree a schedule and any data-protection arrangements." },
  { title: "Pay as agreed", text: "Payment terms and instructions are set out in your quotation." },
];

function Pricing() {
  const { pricing, services, settings } = useSiteContent();
  const titleFor = (slug: string | null) => services.find((s) => s.slug === slug)?.title;

  return (
    <>
      <PageHeader eyebrow="Pricing & packages" title="Honest pricing, confirmed in writing" intro="Most school services are priced per learner or per item. Because every school is different, we confirm the exact figure in a written quotation." />

      <section className="mx-auto max-w-7xl px-5 py-20 md:px-8">
        <h2 className="text-4xl">How pricing works</h2>
        <ol data-reveal-stagger className="mt-10 grid gap-px overflow-hidden rounded-lg border border-border bg-border md:grid-cols-4">
          {PROCESS.map((p, i) => (
            <li key={p.title} className="bg-card p-7">
              <span className="font-blackletter text-4xl text-gold">{i + 1}</span>
              <h3 className="mt-3 text-xl">{p.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{p.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-20 md:px-8">
        <h2 className="text-4xl">Services and packages</h2>
        <div className="mt-8 overflow-hidden border border-border">
          <table className="w-full text-left">
            <thead className="section-ink text-sm">
              <tr>
                <th className="px-5 py-4 font-semibold">Service</th>
                <th className="hidden px-5 py-4 font-semibold md:table-cell">Basis</th>
                <th className="px-5 py-4 font-semibold">Price</th>
                <th className="px-5 py-4"><span className="sr-only">Action</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card">
              {pricing.map((p) => (
                <tr key={p.id} className="align-top">
                  <td className="px-5 py-5">
                    <p className="font-display text-xl font-semibold">{p.name}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{p.description}</p>
                  </td>
                  <td className="hidden px-5 py-5 text-sm md:table-cell">{p.unit || "—"}</td>
                  <td className="px-5 py-5">
                    {p.price_label ? (
                      <span className="font-display text-xl font-semibold">{p.price_label}</span>
                    ) : (
                      <span className="inline-block rounded-sm border border-gold/60 bg-accent px-2.5 py-1 text-xs font-semibold uppercase tracking-wider">Individual quotation</span>
                    )}
                  </td>
                  <td className="px-5 py-5 text-right">
                    {p.service_slug === "ai-talks-for-teachers" ? (
                      <Button asChild size="sm" variant="outline"><Link to="/book-a-meeting" search={{ type: "ai_talk" }}>Book</Link></Button>
                    ) : (
                      <Button asChild size="sm" variant="outline"><Link to="/request-a-quote" search={{ service: titleFor(p.service_slug) ?? p.name }}>Get a quote</Link></Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="border-y border-border bg-muted">
        <div className="mx-auto max-w-4xl px-5 py-16 md:px-8">
          <p className="eyebrow mb-3">Payment</p>
          <h2 className="text-3xl">Lipa na M-Pesa</h2>
          {settings?.mpesa_instructions ? (
            <p className="mt-4 whitespace-pre-line text-lg leading-relaxed">{settings.mpesa_instructions}</p>
          ) : (
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              Payment instructions are included with your written quotation. Please only make payments to the
              details confirmed in your quotation.
            </p>
          )}
        </div>
      </section>

      <CtaBand />
    </>
  );
}
