import { supabase } from "@/integrations/supabase/client";

/** Uploads a file to the website media library and returns its public site path. */
export async function uploadMedia(file: File, folder: string) {
  const safe = file.name.toLowerCase().replace(/[^a-z0-9._-]/g, "-").slice(-80);
  const path = `site/${folder}/${Date.now()}-${safe}`;
  const { error } = await supabase.storage.from("media").upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw error;
  return `/media/${path}`;
}
