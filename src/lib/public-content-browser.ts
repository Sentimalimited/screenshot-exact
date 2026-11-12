import { supabase } from "@/integrations/supabase/client";
import type { Article, SiteContent } from "./site";
import { emptySiteContent, withPublicFallback } from "./public-content-safe";

/** GitHub Pages has no server runtime, so its public copy reads permitted content directly. */
export const isStaticPublicSite = import.meta.env["VITE_GITHUB_PAGES"] === "true";

export function staticPublicSiteOrigin(): string {
  const configured = (import.meta.env["VITE_SITE_URL"] || (typeof window !== "undefined" ? window.location.origin : "")).replace(/\/$/, "");
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  return `${configured}${base}`;
}

export async function getBrowserSiteContent(): Promise<SiteContent> {
  return withPublicFallback(async () => {
    const [settings, services, pricing, portfolio, testimonials, faqs, articles] = await Promise.all([
      supabase.from("site_settings").select("*").eq("id", 1).maybeSingle(),
      supabase.from("services").select("*").order("sort_order"),
      supabase.from("pricing_items").select("*").order("sort_order"),
      supabase.from("portfolio_items").select("*").order("sort_order").order("created_at", { ascending: false }),
      supabase.from("testimonials").select("*").order("sort_order"),
      supabase.from("faqs").select("*").order("sort_order"),
      supabase.from("articles").select("id, slug, title, excerpt, published_at").order("published_at", { ascending: false }),
    ]);
    return {
      settings: settings.data ?? null,
      services: services.data ?? [],
      pricing: pricing.data ?? [],
      portfolio: portfolio.data ?? [],
      testimonials: testimonials.data ?? [],
      faqs: faqs.data ?? [],
      articles: articles.data ?? [],
    };
  }, emptySiteContent);
}

export async function getBrowserArticle(slug: string): Promise<Article | null> {
  return withPublicFallback(async () => {
    const { data } = await supabase.from("articles").select("*").eq("slug", slug.slice(0, 200)).maybeSingle();
    return data ?? null;
  }, () => null);
}
