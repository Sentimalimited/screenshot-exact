import type { Database } from "@/integrations/supabase/types";

import idCards from "@/assets/service-id-cards.jpg";
import labelling from "@/assets/service-labelling.jpg";
import calligraphy from "@/assets/service-calligraphy.jpg";
import photography from "@/assets/service-photography.jpg";
import lab from "@/assets/service-lab.jpg";
import aiTalk from "@/assets/service-ai-talk.jpg";

type Tables = Database["public"]["Tables"];
export type SiteSettings = Tables["site_settings"]["Row"];
export type Service = Tables["services"]["Row"];
export type PricingItem = Tables["pricing_items"]["Row"];
export type PortfolioItem = Tables["portfolio_items"]["Row"];
export type Testimonial = Tables["testimonials"]["Row"];
export type Faq = Tables["faqs"]["Row"];
export type Article = Tables["articles"]["Row"];

export type SiteContent = {
  settings: SiteSettings | null;
  services: Service[];
  pricing: PricingItem[];
  portfolio: PortfolioItem[];
  testimonials: Testimonial[];
  faqs: Faq[];
  articles: Pick<Article, "id" | "slug" | "title" | "excerpt" | "published_at">[];
};

/** Bundled illustrative photographs used until the company uploads its own. */
const FALLBACK_IMAGES: Record<string, string> = {
  "student-id-cards": idCards,
  "uniform-labelling": labelling,
  "gothic-calligraphy-certificates": calligraphy,
  "school-photography": photography,
  "laboratory-equipment-servicing": lab,
  "ai-talks-for-teachers": aiTalk,
};

export function serviceImage(s: Pick<Service, "slug" | "image_url">): string {
  return s.image_url || FALLBACK_IMAGES[s.slug] || calligraphy;
}

export const COVERAGE = [
  { name: "Kakamega", note: "School services" },
  { name: "Vihiga", note: "School services" },
  { name: "Bungoma", note: "School services" },
  { name: "Busia", note: "School services" },
  { name: "Wider Western Kenya", note: "By arrangement" },
  { name: "Nairobi", note: "Calligraphy & events" },
];

export const COUNTIES = [
  "Kakamega", "Vihiga", "Bungoma", "Busia", "Trans Nzoia", "Siaya", "Kisumu",
  "Uasin Gishu", "Nairobi", "Other",
];

export const NAV = [
  { to: "/about", label: "About" },
  { to: "/services", label: "Services" },
  { to: "/portfolio", label: "Portfolio" },
  { to: "/pricing", label: "Pricing" },
  { to: "/resources", label: "Resources" },
  { to: "/contact", label: "Contact" },
] as const;

export const DEFAULT_WHATSAPP = "254796671308";

export function whatsappLink(settings: SiteSettings | null, text?: string) {
  const number = (settings?.whatsapp || DEFAULT_WHATSAPP).replace(/\D/g, "");
  const msg = text ?? `Hello ${settings?.company_name || "Sentima"}, I would like to enquire about your school services.`;
  return `https://wa.me/${number}?text=${encodeURIComponent(msg)}`;
}

export function companyName(settings: SiteSettings | null) {
  return settings?.company_name || "Sentima";
}

type Matches = Array<{ loaderData?: unknown }>;

/** Builds per-page title/description/OG/canonical tags. Origin comes from the root loader. */
export function seo(opts: {
  matches: Matches;
  path: string;
  title: string;
  description: string;
  type?: "website" | "article";
  noindex?: boolean;
}) {
  const root = opts.matches[0]?.loaderData as { origin?: string } | undefined;
  const origin = root?.origin ?? "";
  const url = `${origin}${opts.path}`;
  const meta: Array<Record<string, string>> = [
    { title: opts.title },
    { name: "description", content: opts.description },
    { property: "og:title", content: opts.title },
    { property: "og:description", content: opts.description },
    { property: "og:type", content: opts.type ?? "website" },
    { property: "og:url", content: url },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: opts.title },
    { name: "twitter:description", content: opts.description },
  ];
  if (opts.noindex) meta.push({ name: "robots", content: "noindex, nofollow" });
  return {
    meta,
    links: origin ? [{ rel: "canonical", href: url }] : [],
  };
}
