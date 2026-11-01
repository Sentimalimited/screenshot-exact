import { createFileRoute } from "@tanstack/react-router";

/**
 * Serves files the administrator uploads (images, brochure) from private storage
 * by redirecting to a short-lived signed URL. Only the public "site/" folder is exposed.
 */
export const Route = createFileRoute("/media/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const path = String(params._splat ?? "");
        if (!path.startsWith("site/") || path.includes("..")) return new Response("Not found", { status: 404 });
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data, error } = await supabaseAdmin.storage.from("media").createSignedUrl(path, 60 * 60);
        if (error || !data?.signedUrl) return new Response("Not found", { status: 404 });
        return new Response(null, {
          status: 302,
          headers: { Location: data.signedUrl, "Cache-Control": "public, max-age=1800" },
        });
      },
    },
  },
});
