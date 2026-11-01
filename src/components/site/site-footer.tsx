import { Link } from "@tanstack/react-router";
import { Mail, Phone } from "lucide-react";
import { useSiteContent } from "@/lib/content-query";
import { COVERAGE, companyName, whatsappLink } from "@/lib/site";
import { Ornament } from "./ornament";

export function SiteFooter() {
  const { settings, services } = useSiteContent();
  const name = companyName(settings);
  return (
    <footer className="section-ink">
      <div className="mx-auto max-w-7xl px-5 pb-10 pt-16 md:px-8">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-4">
            <p className="font-blackletter text-4xl text-gold-soft">{name}</p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-ink-muted">
              {settings?.tagline}. A teacher-led school services company from Western Kenya.
            </p>
            <div className="mt-6 space-y-2 text-sm">
              {settings?.phone && (
                <a href={whatsappLink(settings)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-ink-foreground hover:text-gold-soft">
                  <Phone className="size-4 text-gold" /> {settings.phone}
                </a>
              )}
              {settings?.email && (
                <a href={`mailto:${settings.email}`} className="flex items-center gap-2 text-ink-foreground hover:text-gold-soft">
                  <Mail className="size-4 text-gold" /> {settings.email}
                </a>
              )}
            </div>
          </div>
          <div className="md:col-span-3">
            <p className="eyebrow mb-4">Services</p>
            <ul className="space-y-2 text-sm">
              {services.map((s) => (
                <li key={s.id}>
                  <Link to="/services/$slug" params={{ slug: s.slug }} className="text-ink-muted hover:text-gold-soft">
                    {s.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="md:col-span-2">
            <p className="eyebrow mb-4">Company</p>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="text-ink-muted hover:text-gold-soft">About</Link></li>
              <li><Link to="/portfolio" className="text-ink-muted hover:text-gold-soft">Portfolio</Link></li>
              <li><Link to="/pricing" className="text-ink-muted hover:text-gold-soft">Pricing</Link></li>
              <li><Link to="/resources" className="text-ink-muted hover:text-gold-soft">Resources & FAQs</Link></li>
              <li><Link to="/contact" className="text-ink-muted hover:text-gold-soft">Contact</Link></li>
              <li><Link to="/privacy" className="text-ink-muted hover:text-gold-soft">Privacy policy</Link></li>
            </ul>
          </div>
          <div className="md:col-span-3">
            <p className="eyebrow mb-4">Where we work</p>
            <ul className="space-y-2 text-sm text-ink-muted">
              {COVERAGE.map((c) => (
                <li key={c.name}>{c.name} <span className="opacity-60">· {c.note}</span></li>
              ))}
            </ul>
          </div>
        </div>
        <Ornament className="mt-14" />
        <div className="mt-6 flex flex-col justify-between gap-3 text-xs text-ink-muted md:flex-row">
          <p>© {new Date().getFullYear()} {name}. Founded by teachers in Western Kenya.</p>
          <p>This website does not collect learner personal data.</p>
        </div>
      </div>
    </footer>
  );
}
