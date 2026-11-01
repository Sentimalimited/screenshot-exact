import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Download, Loader2, Paperclip, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Enquiry = Database["public"]["Tables"]["enquiries"]["Row"];

const KIND_LABEL: Record<string, string> = { quote: "Quote", contact: "Message", meeting: "Meeting", ai_talk: "AI talk" };
const STATUS_LABEL: Record<string, string> = { new: "New", in_progress: "In progress", closed: "Closed" };
const selectClass = "h-9 rounded-sm border border-input bg-card px-2 text-sm";

function toCsv(rows: Enquiry[]) {
  const cols: (keyof Enquiry)[] = ["created_at", "kind", "status", "organisation", "contact_name", "phone", "email", "county", "location", "service", "quantity", "timeframe", "preferred_date", "details"];
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  return [cols.join(","), ...rows.map((r) => cols.map((c) => esc(r[c])).join(","))].join("\n");
}

export function EnquiriesPanel() {
  const qc = useQueryClient();
  const [kind, setKind] = useState("all");
  const [status, setStatus] = useState("all");
  const [openId, setOpenId] = useState<string | null>(null);

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["admin", "enquiries"],
    queryFn: async () => {
      const { data, error } = await supabase.from("enquiries").select("*").order("created_at", { ascending: false }).limit(500);
      if (error) throw error;
      return data;
    },
  });

  const filtered = rows.filter((r) => (kind === "all" || r.kind === kind) && (status === "all" || r.status === status));
  const refresh = () => qc.invalidateQueries({ queryKey: ["admin", "enquiries"] });

  async function update(id: string, patch: Partial<Enquiry>) {
    const { error } = await supabase.from("enquiries").update(patch).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Updated");
    refresh();
  }

  async function remove(r: Enquiry) {
    if (!confirm(`Delete the enquiry from ${r.contact_name}?`)) return;
    if (r.attachment_path) await supabase.storage.from("enquiry-attachments").remove([r.attachment_path]);
    const { error } = await supabase.from("enquiries").delete().eq("id", r.id);
    if (error) { toast.error(error.message); return; }
    refresh();
  }

  async function openAttachment(path: string) {
    const { data, error } = await supabase.storage.from("enquiry-attachments").createSignedUrl(path, 300);
    if (error || !data) { toast.error("Could not open attachment"); return; }
    window.open(data.signedUrl, "_blank", "noopener");
  }

  function exportCsv() {
    const blob = new Blob([toCsv(filtered)], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `enquiries-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <select className={selectClass} value={kind} onChange={(e) => setKind(e.target.value)} aria-label="Filter by type">
          <option value="all">All types</option>
          {Object.entries(KIND_LABEL).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
        </select>
        <select className={selectClass} value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status">
          <option value="all">All statuses</option>
          {Object.entries(STATUS_LABEL).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
        </select>
        <span className="text-sm text-muted-foreground">{filtered.length} shown</span>
        <Button size="sm" variant="outline" className="ml-auto" onClick={exportCsv} disabled={!filtered.length}><Download /> Export CSV</Button>
      </div>

      {isLoading ? <Loader2 className="animate-spin" /> : filtered.length === 0 ? (
        <p className="border border-dashed border-border p-8 text-center text-sm text-muted-foreground">No enquiries yet.</p>
      ) : (
        <ul className="divide-y divide-border border border-border bg-card">
          {filtered.map((r) => (
            <li key={r.id} className="p-4">
              <button className="flex w-full flex-wrap items-center gap-3 text-left" onClick={() => setOpenId(openId === r.id ? null : r.id)}>
                <span className="rounded-sm bg-accent px-2 py-0.5 text-xs font-semibold">{KIND_LABEL[r.kind] ?? r.kind}</span>
                <span className={`rounded-sm px-2 py-0.5 text-xs font-semibold ${r.status === "new" ? "bg-seal text-seal-foreground" : "bg-muted"}`}>{STATUS_LABEL[r.status] ?? r.status}</span>
                <span className="font-semibold">{r.organisation || r.contact_name}</span>
                <span className="text-sm text-muted-foreground">{r.service}</span>
                <span className="ml-auto text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString("en-GB")}</span>
              </button>
              {openId === r.id && (
                <div className="mt-4 space-y-4 border-t border-border pt-4 text-sm">
                  <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
                    {([
                      ["Contact", r.contact_name], ["Email", r.email], ["Phone", r.phone], ["County", r.county],
                      ["Location", r.location], ["Learners / items / staff", r.quantity], ["Timeframe", r.timeframe], ["Preferred dates", r.preferred_date],
                    ] as const).filter(([, v]) => v !== null && v !== "").map(([k, v]) => (
                      <div key={k}><dt className="text-xs text-muted-foreground">{k}</dt><dd className="font-medium">{k === "Email" ? <a className="text-seal underline" href={`mailto:${v}`}>{v}</a> : k === "Phone" ? <a className="text-seal underline" href={`tel:${v}`}>{v}</a> : v}</dd></div>
                    ))}
                  </dl>
                  <p className="whitespace-pre-line rounded-sm bg-muted p-3">{r.details}</p>
                  {r.attachment_path && <Button size="sm" variant="outline" onClick={() => openAttachment(r.attachment_path!)}><Paperclip /> Open attachment</Button>}
                  <div className="flex flex-wrap items-center gap-3">
                    <label className="text-xs font-semibold">Status
                      <select className={`${selectClass} ml-2`} value={r.status} onChange={(e) => update(r.id, { status: e.target.value })}>
                        {Object.entries(STATUS_LABEL).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                      </select>
                    </label>
                    <Button size="sm" variant="ghost" className="ml-auto" onClick={() => remove(r)}><Trash2 /> Delete</Button>
                  </div>
                  <NotesEditor initial={r.admin_notes ?? ""} onSave={(admin_notes) => update(r.id, { admin_notes })} />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function NotesEditor({ initial, onSave }: { initial: string; onSave: (v: string) => void }) {
  const [v, setV] = useState(initial);
  return (
    <div className="space-y-2">
      <Textarea rows={2} placeholder="Internal notes (not visible to the customer)" value={v} onChange={(e) => setV(e.target.value)} />
      <Button size="sm" variant="outline" onClick={() => onSave(v)} disabled={v === initial}>Save notes</Button>
    </div>
  );
}
