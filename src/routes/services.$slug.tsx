import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrochureButton, CtaBand, PageHeader, ServiceCard } from "@/components/site/blocks";
import { WhatsAppIcon } from "@/components/site/whatsapp-float";
import { siteContentQuery, useSiteContent } from "@/lib/content-query";
import { seo, serviceImage, whatsappLink } from "@/lib/site";

export const Route = createFileRoute("/services/$slug")({
  loader: async ({ context, params }) => {
    const content = await context.queryClient.ensureQueryData(siteContentQuery);
    const service = content.services.find((s) => s.slug === params.slug);
    if (!service) throw notFound();
    return { title: service.seo_title || `${service.title} — Sentima`, description: service.seo_description || service.summary };
  },
  head: ({ matches, loaderData, params }) =>
    seo({
      matches,
      path: `/services/${params.slug}`,
      title: loaderData?.title ?? "Service unavailable — Sentima",
      description: loaderData?.description ?? "This service could not be found.",
      noindex: !loaderData,
    }),
  component: ServicePage,
});

function ServicePage() {
  const { slug } = Route.useParams();
  const { services, settings, pricing } = useSiteContent();
  const service = services.find((s) => s.slug === slug)!;
  const others = services.filter((s) => s.slug !== slug).slice(0, 3);
  const price = pricing.filter((p) => p.service_slug === slug);
  const isAiTalk = slug === "ai-talks-for-teachers";

  return (
    <>
      <PageHeader eyebrow="Service" title={service.title} intro={service.summary} />

      <section className="mx-auto grid max-w-7xl gap-14 px-5 py-20 md:px-8 lg:grid-cols-12">
        <div className="space-y-12 lg:col-span-7">
          <div>
            <h2 className="text-3xl">What it involves</h2>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{service.involves}</p>
          </div>
          <div>
            <h2 className="text-3xl">Who it is for</h2>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{service.audience}</p>
          </div>
          {service.benefits.length > 0 && (
            <div>
              <h2 className="text-3xl">Benefits for your school</h2>
              <ul className="mt-5 space-y-3">
                {service.benefits.map((b) => (
                  <li key={b} className="flex gap-3 text-lg">
                    <Check className="mt-1 size-5 shrink-0 text-gold" /> <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="card-parchment frame-gold p-8 md:p-10">
            <h2 className="text-3xl">How to request it</h2>
            <p className="mt-3 text-lg leading-relaxed text-muted-foreground">{service.how_to_request}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              {isAiTalk ? (
                <Button asChild variant="seal" size="lg"><Link to="/book-a-meeting" search={{ type: "ai_talk" }}>{service.cta_label}</Link></Button>
              ) : (
                <Button asChild variant="seal" size="lg"><Link to="/request-a-quote" search={{ service: service.title }}>{service.cta_label}</Link></Button>
              )}
              <Button asChild variant="whatsapp" size="lg">
                <a href={whatsappLink(settings, `Hello, I would like to ask about ${service.title}.`)} target="_blank" rel="noopener noreferrer"><WhatsAppIcon /> Ask on WhatsApp</a>
              </Button>
            </div>
          </div>
        </div>

        <aside className="space-y-8 lg:col-span-5">
          <img src={serviceImage(service)} alt={service.image_alt || `${service.title} — illustrative photograph`} width={1200} height={900} className="aspect-[4/3] w-full object-cover" />
          {price.length > 0 && (
            <div className="border border-border bg-card p-6">
              <p className="eyebrow mb-3">Pricing</p>
              {price.map((p) => (
                <div key={p.id}>
                  <p className="font-display text-2xl font-semibold">{p.price_label || (p.requires_quote ? "By quotation" : "—")}{p.unit && p.price_label ? <span className="text-base font-normal text-muted-foreground"> {p.unit}</span> : null}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{p.description}</p>
                </div>
              ))}
              <Link to="/pricing" className="mt-4 inline-block text-sm font-semibold text-seal underline underline-offset-4">How our pricing works</Link>
            </div>
          )}
          {slug === "gothic-calligraphy-certificates" && (
            <Button asChild variant="outline" className="w-full"><Link to="/portfolio">View the calligraphy portfolio</Link></Button>
          )}
          <BrochureButton />
        </aside>
      </section>

      {others.length > 0 && (
        <section className="border-t border-border bg-muted">
          <div className="mx-auto max-w-7xl px-5 py-20 md:px-8">
            <h2 className="text-3xl">Other services</h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {others.map((s) => <ServiceCard key={s.id} service={s} />)}
            </div>
          </div>
        </section>
      )}
      <CtaBand />
    </>
  );
}
