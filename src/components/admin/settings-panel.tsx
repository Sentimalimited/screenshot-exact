import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { FileUp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import type { SiteSettings } from "@/lib/site";
import { uploadMedia } from "./media";

type Key = keyof SiteSettings;
const TEXT: { k: Key; label: string; hint?: string; long?: boolean }[] = [
  { k: "company_name", label: "Company name" },
  { k: "tagline", label: "Tagline" },
  { k: "intro", label: "Short introduction (home page)", long: true },
  { k: "mission", label: "Mission", long: true },
  { k: "vision", label: "Vision", long: true },
  { k: "phone", label: "Phone number (as displayed)", hint: "e.g. +254 796 671 308" },
  { k: "whatsapp", label: "WhatsApp number", hint: "Digits only with country code, e.g. 254796671308" },
  { k: "email", label: "Company email" },
  { k: "public_address", label: "Public address", hint: "Leave empty to hide the address and map.", long: true },
  { k: "office_hours", label: "Office hours", long: true },
  { k: "mpesa_instructions", label: "Lipa na M-Pesa instructions", hint: "Shown on the pricing page. Leave empty until approved.", long: true },
  { k: "ga_measurement_id", label: "Google Analytics measurement ID", hint: "Format G-XXXXXXXXXX. Leave empty to disable." },
  { k: "search_console_token", label: "Google Search Console verification code", hint: "Only the content value of the meta tag." },
];
const FLAGS: { k: Key; label: string }[] = [
  { k: "company_name_approved", label: "Company name approved" },
  { k: "tagline_approved", label: "Tagline approved" },
  { k: "whatsapp_confirmed", label: "WhatsApp number confirmed" },
  { k: "privacy_approved", label: "Privacy policy approved (removes the draft notice)" },
];

export function SettingsPanel() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "site_settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_settings").select("*").eq("id", 1).single();
      if (error) throw error;
      return data;
    },
  });
  const [v, setV] = useState<Partial<SiteSettings>>({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  useEffect(() => { if (data) setV(data); }, [data]);

  async function save(patch: Partial<SiteSettings> = v) {
    setSaving(true);
    const { id: _id, updated_at: _u, ...rest } = patch as SiteSettings;
    const { error } = await supabase.from("site_settings").update(rest).eq("id", 1);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Saved");
    qc.invalidateQueries({ queryKey: ["admin", "site_settings"] });
    qc.invalidateQueries({ queryKey: ["site-content"] });
  }

  if (isLoading || !data) return <Loader2 className="animate-spin" />;

  return (
    <div className="space-y-8">
      <div className="card-parchment space-y-4 p-6">
        <h3 className="text-2xl">Approvals</h3>
        <p className="text-sm text-muted-foreground">Confirm these before the website is published.</p>
        {FLAGS.map((f) => (
          <div key={f.k} className="flex items-center gap-3">
            <Switch id={f.k} checked={!!v[f.k]} onCheckedChange={(c) => setV((s) => ({ ...s, [f.k]: c }))} />
            <Label htmlFor={f.k}>{f.label}</Label>
          </div>
        ))}
      </div>

      <div className="card-parchment space-y-4 p-6">
        <h3 className="text-2xl">Services brochure (PDF)</h3>
        {v.brochure_url ? (
          <p className="text-sm">Current brochure: <a className="text-seal underline" href={v.brochure_url} target="_blank" rel="noopener">open</a></p>
        ) : <p className="text-sm text-muted-foreground">No brochure uploaded. The download button is hidden until one is added.</p>}
        <div className="flex flex-wrap gap-3">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-sm border border-input bg-card px-4 py-2 text-sm font-semibold hover:border-gold">
            {uploading ? <Loader2 className="size-4 animate-spin" /> : <FileUp className="size-4" />} {v.brochure_url ? "Replace brochure" : "Upload brochure"}
            <input type="file" accept="application/pdf" className="sr-only" onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              if (file.type !== "application/pdf") { toast.error("Please choose a PDF file."); return; }
              setUploading(true);
              try {
                const url = await uploadMedia(file, "brochure");
                setV((s) => ({ ...s, brochure_url: url }));
                await save({ ...v, brochure_url: url });
              } catch (err) { toast.error(err instanceof Error ? err.message : "Upload failed"); }
              setUploading(false);
            }} />
          </label>
          {v.brochure_url && <Button variant="ghost" onClick={() => { setV((s) => ({ ...s, brochure_url: null })); void save({ ...v, brochure_url: null }); }}>Remove</Button>}
        </div>
      </div>

      <div className="card-parchment space-y-5 p-6">
        <h3 className="text-2xl">Company information</h3>
        {TEXT.map((f) => (
          <div key={f.k} className="space-y-1.5">
            <Label htmlFor={f.k} className="font-semibold">{f.label}</Label>
            {f.long ? (
              <Textarea id={f.k} rows={3} value={String(v[f.k] ?? "")} onChange={(e) => setV((s) => ({ ...s, [f.k]: e.target.value || null }))} />
            ) : (
              <Input id={f.k} value={String(v[f.k] ?? "")} onChange={(e) => setV((s) => ({ ...s, [f.k]: e.target.value || null }))} />
            )}
            {f.hint && <p className="text-xs text-muted-foreground">{f.hint}</p>}
          </div>
        ))}
      </div>

      <Button onClick={() => save()} disabled={saving} size="lg">{saving && <Loader2 className="animate-spin" />} Save changes</Button>
    </div>
  );
}
