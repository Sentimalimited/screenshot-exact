import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import type { SiteContent } from "./site";

function publicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

/** All published public content in one request (small dataset). */
export const getSiteContent = createServerFn({ method: "GET" }).handler(async (): Promise<SiteContent> => {
  const db = publicClient();
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
});

export const getArticle = createServerFn({ method: "GET" })
  .inputValidator((input: { slug: string }) => ({ slug: String(input.slug).slice(0, 200) }))
  .handler(async ({ data }) => {
    const { data: article } = await publicClient()
      .from("articles")
      .select("*")
      .eq("slug", data.slug)
      .maybeSingle();
    return article ?? null;
  });

export const getRequestOrigin = createServerFn({ method: "GET" }).handler(() => {
  const req = getRequest();
  const url = new URL(req.url);
  const sandboxHost = url.hostname === "localhost" ? req.headers.get("x-forwarded-host") : null;
  return sandboxHost ? `https://${sandboxHost}` : url.origin;
});
