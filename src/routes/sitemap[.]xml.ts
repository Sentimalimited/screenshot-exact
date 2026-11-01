import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

const STATIC = ["/", "/about", "/services", "/portfolio", "/pricing", "/resources", "/contact", "/request-a-quote", "/book-a-meeting", "/privacy"];

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const origin = new URL(request.url).origin;
        const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
        const db = createClient<Database>(process.env["SUPABASE_URL"]!, key, {
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
        const [services, articles] = await Promise.all([
          db.from("services").select("slug, updated_at"),
          db.from("articles").select("slug, updated_at"),
        ]);
        const urls = [
          ...STATIC.map((p) => ({ loc: p, lastmod: undefined as string | undefined })),
          ...(services.data ?? []).map((s) => ({ loc: `/services/${s.slug}`, lastmod: s.updated_at })),
          ...(articles.data ?? []).map((a) => ({ loc: `/resources/${a.slug}`, lastmod: a.updated_at })),
        ];
        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
          .map((u) => `  <url><loc>${origin}${u.loc}</loc>${u.lastmod ? `<lastmod>${u.lastmod.slice(0, 10)}</lastmod>` : ""}</url>`)
          .join("\n")}\n</urlset>`;
        return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
      },
    },
  },
});
