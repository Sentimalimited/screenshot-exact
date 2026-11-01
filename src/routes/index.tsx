import { createFileRoute, Link } from "@tanstack/react-router";
import { ClipboardList, FileCheck2, GraduationCap, Handshake, ShieldCheck, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CtaBand, FaqList, ServiceCard } from "@/components/site/blocks";
import { Ornament, SectionHeading, Seal } from "@/components/site/ornament";
import { WhatsAppIcon } from "@/components/site/whatsapp-float";
import { useSiteContent } from "@/lib/content-query";
import { COVERAGE, companyName, seo, whatsappLink } from "@/lib/site";
import hero from "@/assets/hero-calligraphy.jpg";
import calligraphy from "@/assets/service-calligraphy.jpg";

export const Route = createFileRoute("/")({
  head: ({ matches }) => {
    const base = seo({
      matches,
      path: "/",
      title: "Sentima | Student ID Cards, Uniform Labelling & Calligraphy for Schools in Kenya",
      description:
        "Teacher-led school services from Western Kenya: student ID cards, uniform labelling, hand-lettered Gothic calligraphy certificates, school photography, lab servicing and free AI talks.",
    });
    const origin = (matches[0]?.loaderData as { origin?: string } | undefined)?.origin ?? "";
    return {
      ...base,
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "Sentima",
            url: origin || undefined,
            foundingDate: "2024",
            description: "Teacher-led school services company operating in Western Kenya.",
            areaServed: ["Kakamega", "Vihiga", "Bungoma", "Busia", "Western Kenya", "Nairobi"],
            contactPoint: { "@type": "ContactPoint", telephone: "+254796671308", contactType: "customer service", areaServed: "KE", availableLanguage: ["en", "sw"] },
          }),
        },
      ],
    };
  },
  component: Home,
});

const REASONS = [
  { icon: GraduationCap, title: "Founded by teachers", text: "We have stood in your staffroom. Our services are shaped by what actually takes teachers' time." },
  { icon: ShieldCheck, title: "Learner-data conscious", text: "Where learner details are needed, we work under non-disclosure and data-protection agreements with the school." },
  { icon: FileCheck2, title: "Well documented", text: "Clear quotations, agreed specifications and a record of what was delivered — evidence you can file." },
  { icon: Handshake, title: "One reliable partner", text: "ID cards, labelling, certificates, photography and lab servicing through a single point of contact." },
];

const STEPS = [
  { icon: ClipboardList, title: "Tell us what you need", text: "Request a quote, book a meeting or message us on WhatsApp." },
  { icon: Users, title: "We agree the details", text: "We meet or call to confirm requirements, data arrangements and timing." },
  { icon: Sparkles, title: "We do the work", text: "Our team produces and delivers, keeping you informed along the way." },
  { icon: FileCheck2, title: "You receive a record", text: "Every job closes with documentation of what was delivered." },
];

function Home() {
  const { settings, services, faqs, portfolio, testimonials } = useSiteContent();
  const name = companyName(settings);
  const homeFaqs = faqs.filter((f) => f.show_on_home);
  const preview = portfolio.slice(0, 4);

  return (
    <>
      {/* Hero */}
      <section className="section-ink relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 md:px-8 lg:grid-cols-12 lg:py-24">
          <div className="lg:col-span-6">
            <p className="eyebrow mb-5 animate-rise">Teacher-led school services · Western Kenya</p>
            <h1 className="text-5xl text-ink-foreground animate-rise sm:text-6xl xl:text-7xl">
              Less paperwork for teachers. <em className="text-gold-soft">More time</em> for learning.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-muted animate-rise">
              {name} takes repetitive tasks off teachers' desks — student ID cards, uniform labelling,
              hand-lettered certificates and more — reliably, affordably and properly documented.
            </p>
            <div className="mt-9 flex flex-wrap gap-3 animate-rise">
              <Button asChild variant="gold" size="lg"><Link to="/request-a-quote">Request a quote</Link></Button>
              <Button asChild variant="whatsapp" size="lg">
                <a href={whatsappLink(settings)} target="_blank" rel="noopener noreferrer"><WhatsAppIcon /> Contact on WhatsApp</a>
              </Button>
            </div>
            <p className="mt-6 text-sm text-ink-muted">
              Or <Link to="/book-a-meeting" className="text-gold-soft underline underline-offset-4">book a free AI talk for your teachers</Link>.
            </p>
          </div>
          <div className="relative lg:col-span-6">
            <div className="frame-gold overflow-hidden">
              <img src={hero} alt="A calligrapher hand-lettering a Gothic certificate beside a red wax seal" width={1600} height={1104} className="aspect-[4/3] w-full object-cover" fetchPriority="high" />
            </div>
            <Seal letter={name.charAt(0)} size={84} className="absolute -bottom-6 -left-4 md:-left-8" />
          </div>
        </div>
      </section>

      {/* Intro */}
      <section className="mx-auto max-w-4xl px-5 py-20 text-center md:px-8 md:py-28">
        <p className="eyebrow mb-4">About {name}</p>
        <p className="font-display text-3xl leading-snug md:text-4xl">
          {settings?.intro ||
            "A teacher-led school services company from Western Kenya, founded in 2024 to help schools run better."}
        </p>
        <Ornament className="mx-auto mt-10 max-w-xs" />
        <Link to="/about" className="mt-6 inline-block text-sm font-semibold text-seal underline underline-offset-4">Read our story</Link>
      </section>

      {/* Services */}
      <section className="mx-auto max-w-7xl px-5 pb-24 md:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading eyebrow="What we do" title="Services built around the school calendar" />
          <Button asChild variant="outline"><Link to="/services">All services</Link></Button>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => <ServiceCard key={s.id} service={s} />)}
        </div>
      </section>

      {/* Why */}
      <section className="border-y border-border bg-muted">
        <div className="mx-auto max-w-7xl px-5 py-24 md:px-8">
          <SectionHeading eyebrow="Why schools choose us" title="Precision, service and evidence" align="center" />
          <div className="mt-14 grid gap-10 md:grid-cols-2 lg:grid-cols-4">
            {REASONS.map((r) => (
              <div key={r.title}>
                <r.icon className="size-8 text-gold" strokeWidth={1.4} />
                <h3 className="mt-4 text-2xl">{r.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{r.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Portfolio preview */}
      <section className="mx-auto max-w-7xl px-5 py-24 md:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <SectionHeading eyebrow="Calligraphy portfolio" title="Certificates lettered by hand" intro="Gothic calligraphy for prize-givings, graduations, church events and celebrations — each piece agreed with you and lettered by hand." />
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild><Link to="/portfolio">Explore the portfolio</Link></Button>
              <Button asChild variant="outline"><Link to="/services/$slug" params={{ slug: "gothic-calligraphy-certificates" }}>About the service</Link></Button>
            </div>
          </div>
          {preview.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {preview.map((p) => (
                <Link key={p.id} to="/portfolio" className="aspect-square overflow-hidden bg-muted">
                  <img src={p.image_url} alt={p.alt_text || p.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 hover:scale-105" />
                </Link>
              ))}
            </div>
          ) : (
            <div className="frame-gold overflow-hidden">
              <img src={calligraphy} alt="Hand-lettered Gothic certificates with gold accents and a wax seal" loading="lazy" width={1200} height={912} className="aspect-[4/3] w-full object-cover" />
            </div>
          )}
        </div>
      </section>

      {/* Process */}
      <section className="section-ink">
        <div className="mx-auto max-w-7xl px-5 py-24 md:px-8">
          <SectionHeading eyebrow="How it works" title="A clear process, from enquiry to record" className="text-ink-foreground" />
          <ol className="mt-14 grid gap-px overflow-hidden border border-ink-soft bg-ink-soft md:grid-cols-4">
            {STEPS.map((s, i) => (
              <li key={s.title} className="bg-ink p-8">
                <span className="font-blackletter text-5xl text-gold">{i + 1}</span>
                <h3 className="mt-4 text-2xl text-ink-foreground">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Coverage */}
      <section className="mx-auto max-w-7xl px-5 py-24 md:px-8">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionHeading eyebrow="Coverage" title="Serving schools across Western Kenya" intro="Our school services are centred on Kakamega, Vihiga, Bungoma and Busia. Calligraphy and event work also reaches Nairobi, and we consider requests from elsewhere in Kenya where it is practical." />
          </div>
          <ul className="grid gap-px self-start overflow-hidden border border-border bg-border sm:grid-cols-2 lg:col-span-7">
            {COVERAGE.map((c) => (
              <li key={c.name} className="bg-card p-6">
                <p className="font-display text-2xl font-semibold">{c.name}</p>
                <p className="text-sm text-muted-foreground">{c.note}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Testimonials: only rendered once approved testimonials exist */}
      {testimonials.length > 0 && (
        <section className="border-y border-border bg-muted">
          <div className="mx-auto max-w-7xl px-5 py-24 md:px-8">
            <SectionHeading eyebrow="In their words" title="What schools say" align="center" />
            <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((t) => (
                <figure key={t.id} className="card-parchment p-8">
                  <blockquote className="font-display text-xl leading-relaxed">“{t.quote}”</blockquote>
                  <figcaption className="mt-5 text-sm">
                    <span className="font-semibold">{t.author_name}</span>
                    {(t.author_role || t.organisation) && (
                      <span className="text-muted-foreground"> — {[t.author_role, t.organisation].filter(Boolean).join(", ")}</span>
                    )}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQs */}
      {homeFaqs.length > 0 && (
        <section className="mx-auto max-w-4xl px-5 py-24 md:px-8">
          <SectionHeading eyebrow="Questions" title="Frequently asked" align="center" />
          <div className="mt-12"><FaqList faqs={homeFaqs} /></div>
          <p className="mt-8 text-center text-sm">
            <Link to="/resources" className="font-semibold text-seal underline underline-offset-4">See all questions and resources</Link>
          </p>
        </section>
      )}

      <CtaBand />
    </>
  );
}
