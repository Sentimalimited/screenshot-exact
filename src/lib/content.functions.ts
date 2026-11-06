import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import type { SiteContent } from "./site";
import { createPublicDb as publicClient } from "./public-db";
import { emptySiteContent, withPublicFallback } from "./public-content-safe";

/** All published public content in one request (small dataset). */
export const getSiteContent = createServerFn({ method: "GET" }).handler(async (): Promise<SiteContent> => withPublicFallback(async () => {
  let db: ReturnType<typeof publicClient>;
  try {
    db = publicClient();
  } catch (error) {
    // Never take the whole site down if the backend settings are missing.
    console.error(error);
    return { settings: null, services: [], pricing: [], portfolio: [], testimonials: [], faqs: [], articles: [] };
  }
  const [settings, services, pricing, portfolio, testimonials, faqs, articles] = await Promise.all([
    db.from("site_settings").select("*").eq("id", 1).maybeSingle(),
    db.from("services").select("*").order("sort_order"),
    db.from("pricing_items").select("*").order("sort_order"),
    db.from("portfolio_items").select("*").order("sort_order").order("created_at", { ascending: false }),
    db.from("testimonials").select("*").order("sort_order"),
    db.from("faqs").select("*").order("sort_order"),
    db.from("articles").select("id, slug, title, excerpt, published_at").order("published_at", { ascending: false }),
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
}, emptySiteContent));

export const getArticle = createServerFn({ method: "GET" })
  .inputValidator((input: { slug: string }) => ({ slug: String(input.slug).slice(0, 200) }))
  .handler(async ({ data }) => withPublicFallback(async () => {
    const { data: article } = await publicClient()
      .from("articles")
      .select("*")
      .eq("slug", data.slug)
      .maybeSingle();
    return article ?? null;
  }, () => null));

export const getRequestOrigin = createServerFn({ method: "GET" }).handler(() => {
  const req = getRequest();
  const url = new URL(req.url);
  const sandboxHost = url.hostname === "localhost" ? req.headers.get("x-forwarded-host") : null;
  return sandboxHost ? `https://${sandboxHost}` : url.origin;
});
