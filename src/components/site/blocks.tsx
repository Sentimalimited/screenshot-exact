import { Link } from "@tanstack/react-router";
import { ArrowRight, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useSiteContent } from "@/lib/content-query";
import { serviceImage, whatsappLink, type Faq, type Service } from "@/lib/site";
import { WhatsAppIcon } from "./whatsapp-float";
import { Ornament } from "./ornament";

export function PageHeader({ eyebrow, title, intro }: { eyebrow: string; title: string; intro?: string }) {
  return (
    <section className="section-ink">
      <div className="mx-auto max-w-7xl px-5 pb-16 pt-16 md:px-8 md:pb-20 md:pt-24">
        <p className="eyebrow mb-4 animate-rise">{eyebrow}</p>
        <h1 className="max-w-4xl text-5xl text-ink-foreground animate-rise delay-1 md:text-7xl">{title}</h1>
        {intro && <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-muted animate-rise delay-2">{intro}</p>}
        <Ornament className="mt-12 max-w-md" />
      </div>
    </section>
  );
}

export function ServiceCard({ service }: { service: Service }) {
  return (
    <Link
      to="/services/$slug"
      params={{ slug: service.slug }}
      className="group card-parchment card-lift flex flex-col overflow-hidden"
    >
      <div className="aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={serviceImage(service)}
          alt={service.image_alt || `${service.title} by Sentima`}
          loading="lazy"
          width={1200}
          height={900}
          className="h-full w-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
        />
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="text-2xl">{service.title}</h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{service.summary}</p>
        <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-seal">
          Learn more <ArrowRight className="size-4 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1.5" />
        </span>
      </div>
    </Link>
  );
}

export function FaqList({ faqs }: { faqs: Faq[] }) {
  if (!faqs.length) return null;
  return (
    <Accordion type="single" collapsible className="divide-y divide-border border-y border-border">
      {faqs.map((f) => (
        <AccordionItem key={f.id} value={f.id} className="border-0">
          <AccordionTrigger className="py-5 text-left font-display text-xl font-semibold hover:no-underline">
            {f.question}
          </AccordionTrigger>
          <AccordionContent className="pb-6 text-base leading-relaxed text-muted-foreground">{f.answer}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

export function BrochureButton({ variant = "outline" }: { variant?: "outline" | "outline-gold" }) {
  const { settings } = useSiteContent();
  if (!settings?.brochure_url) return null;
  return (
    <Button asChild variant={variant} size="lg">
      <a href={settings.brochure_url} target="_blank" rel="noopener" download>
        <Download /> Download brochure
      </a>
    </Button>
  );
}

export function CtaBand({
  title = "Let us take the repetitive work off your desk.",
  text = "Tell us what your school needs. We will reply with next steps and a written quotation.",
}: { title?: string; text?: string }) {
  const { settings } = useSiteContent();
  return (
    <section className="section-ink">
      <div data-reveal className="mx-auto max-w-5xl px-5 py-20 text-center md:px-8 md:py-24">
        <p className="eyebrow mb-4">Start an enquiry</p>
        <h2 className="text-4xl text-ink-foreground md:text-6xl">{title}</h2>
        <p className="mx-auto mt-5 max-w-xl text-lg text-ink-muted">{text}</p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Button asChild variant="gold" size="lg"><Link to="/request-a-quote">Request a quote</Link></Button>
          <Button asChild variant="whatsapp" size="lg">
            <a href={whatsappLink(settings)} target="_blank" rel="noopener noreferrer"><WhatsAppIcon /> WhatsApp us</a>
          </Button>
          <Button asChild variant="outline-gold" size="lg"><Link to="/book-a-meeting">Book a school meeting</Link></Button>
          <BrochureButton variant="outline-gold" />
        </div>
      </div>
    </section>
  );
}
