import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

/**
 * Read-only backend client using the public (publishable) key.
 * Call only from inside a server handler. Falls back to the VITE_* values baked
 * in at build time, so self-hosted copies (e.g. Netlify) work even when the
 * runtime settings are not configured.
 */
export function createPublicDb() {
  // Public-only credentials: the final fallback also covers hosts with no build env.
  const url = process.env["SUPABASE_URL"] || import.meta.env["VITE_SUPABASE_URL"] || "https://c--bc7a5e34-c611-4ede-96fe-f1f93425d4c7-prod.lovable.cloud";
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"] || import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"] || "sb_publishable_iq_MbxfIwVTTwkSQbgSQUQ_HUGXjSNZ";
  if (!url || !key) throw new Error("Backend URL or public key is not configured");
  return createClient<Database>(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h, signal: init?.signal ?? AbortSignal.timeout(5000) });
      },
    },
  });
}
