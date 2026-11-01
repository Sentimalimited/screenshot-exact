import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarDays, FileText, Mail, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/site/blocks";
import { EnquiryForm } from "@/components/site/enquiry-form";
import { WhatsAppIcon } from "@/components/site/whatsapp-float";
import { useSiteContent } from "@/lib/content-query";
import { COVERAGE, seo, whatsappLink } from "@/lib/site";

export const Route = createFileRoute("/contact")({
  head: ({ matches }) =>
    seo({
      matches,
      path: "/contact",
      title: "Contact Sentima | School Services in Kakamega & Western Kenya",
      description:
        "Contact Sentima by WhatsApp, phone or email. Request a quote, book a school meeting or a free AI talk for teachers in Western Kenya.",
    }),
  component: Contact,
});

function Contact() {
  const { settings } = useSiteContent();
  return (
    <>
      <PageHeader eyebrow="Contact" title="Talk to the team" intro="WhatsApp is usually the quickest way to reach us. You can also send a message below, request a quote or book a meeting." />

      <section className="mx-auto grid max-w-7xl gap-12 px-5 py-20 md:px-8 lg:grid-cols-12">
        <aside className="space-y-8 lg:col-span-4">
          <div className="space-y-4">
            <Button asChild variant="whatsapp" size="lg" className="w-full">
              <a href={whatsappLink(settings)} target="_blank" rel="noopener noreferrer"><WhatsAppIcon /> Chat on WhatsApp</a>
            </Button>
            <Button asChild variant="default" size="lg" className="w-full"><Link to="/request-a-quote"><FileText /> Request a quote</Link></Button>
            <Button asChild variant="outline" size="lg" className="w-full"><Link to="/book-a-meeting"><CalendarDays /> Book a meeting or AI talk</Link></Button>
          </div>

          <dl className="space-y-5 border-t border-border pt-8 text-sm">
            {settings?.phone && (
              <div className="flex gap-3"><Phone className="mt-0.5 size-4 text-gold" /><div><dt className="font-semibold">Phone & WhatsApp</dt><dd className="text-muted-foreground"><a href={`tel:${settings.phone.replace(/\s/g, "")}`}>{settings.phone}</a></dd></div></div>
            )}
            {settings?.email && (
              <div className="flex gap-3"><Mail className="mt-0.5 size-4 text-gold" /><div><dt className="font-semibold">Email</dt><dd className="text-muted-foreground"><a href={`mailto:${settings.email}`}>{settings.email}</a></dd></div></div>
            )}
            {settings?.public_address && (
              <div className="flex gap-3"><MapPin className="mt-0.5 size-4 text-gold" /><div><dt className="font-semibold">Address</dt><dd className="whitespace-pre-line text-muted-foreground">{settings.public_address}</dd></div></div>
            )}
            {settings?.office_hours && (
              <div><dt className="font-semibold">Hours</dt><dd className="whitespace-pre-line text-muted-foreground">{settings.office_hours}</dd></div>
            )}
          </dl>

          <div className="border-t border-border pt-8">
            <p className="eyebrow mb-3">Service coverage</p>
            <ul className="space-y-1.5 text-sm">
              {COVERAGE.map((c) => <li key={c.name}><span className="font-semibold">{c.name}</span> <span className="text-muted-foreground">· {c.note}</span></li>)}
            </ul>
          </div>

          {settings?.public_address && (
            <iframe
              title="Map showing our location"
              className="aspect-square w-full rounded-lg border border-border"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://www.google.com/maps?q=${encodeURIComponent(settings.public_address)}&output=embed`}
            />
          )}
        </aside>

        <div className="lg:col-span-8">
          <h2 className="mb-6 text-4xl">Send us a message</h2>
          <EnquiryForm kind="contact" />
        </div>
      </section>
    </>
  );
}
