/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { uploadMedia } from "./media";

export type FieldDef = {
  name: string;
  label: string;
  type: "text" | "textarea" | "number" | "boolean" | "list" | "image" | "select" | "datetime";
  options?: string[];
  hint?: string;
  required?: boolean;
};

type Row = Record<string, any> & { id: string };

const selectClass = "flex h-10 w-full rounded-sm border border-input bg-card px-3 text-sm";

export function CollectionEditor({
  table,
  fields,
  titleField,
  subtitle,
  order = "sort_order",
  newDefaults = {},
  note,
}: {
  table: string;
  fields: FieldDef[];
  titleField: string;
  subtitle?: (r: Row) => string;
  order?: string;
  newDefaults?: Record<string, any>;
  note?: string;
}) {
  const qc = useQueryClient();
  const key = ["admin", table];
  const { data: rows = [], isLoading } = useQuery({
    queryKey: key,
    queryFn: async () => {
      const { data, error } = await (supabase.from(table as any) as any).select("*").order(order);
      if (error) throw error;
      return data as Row[];
    },
  });
  const [editing, setEditing] = useState<Row | null>(null);

  const refresh = () => {
    qc.invalidateQueries({ queryKey: key });
    qc.invalidateQueries({ queryKey: ["site-content"] });
  };

  async function remove(row: Row) {
    if (!confirm(`Delete “${row[titleField]}”? This cannot be undone.`)) return;
    const { error } = await (supabase.from(table as any) as any).delete().eq("id", row.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Deleted");
    refresh();
  }

  if (editing) {
    return <RowForm table={table} fields={fields} row={editing} onDone={() => { setEditing(null); refresh(); }} />;
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        {note ? <p className="max-w-2xl text-sm text-muted-foreground">{note}</p> : <span />}
        <Button onClick={() => setEditing({ id: "", ...newDefaults })}><Plus /> Add new</Button>
      </div>
      {isLoading ? (
        <Loader2 className="animate-spin" />
      ) : rows.length === 0 ? (
        <p className="border border-dashed border-border p-8 text-center text-sm text-muted-foreground">Nothing here yet.</p>
      ) : (
        <ul className="divide-y divide-border border border-border bg-card">
          {rows.map((r) => (
            <li key={r.id} className="flex items-center gap-4 p-4">
              {fields.some((f) => f.type === "image") && (
                <div className="size-14 shrink-0 overflow-hidden bg-muted">
                  {r[fields.find((f) => f.type === "image")!.name] && (
                    <img src={r[fields.find((f) => f.type === "image")!.name]} alt="" className="h-full w-full object-cover" />
                  )}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{r[titleField]}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {"published" in r && (r["published"] ? "Published" : "Hidden")}
                  {subtitle ? ` · ${subtitle(r)}` : ""}
                </p>
              </div>
              <Button size="sm" variant="outline" onClick={() => setEditing(r)}>Edit</Button>
              <Button size="icon" variant="ghost" aria-label="Delete" onClick={() => remove(r)}><Trash2 /></Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function RowForm({ table, fields, row, onDone }: { table: string; fields: FieldDef[]; row: Row; onDone: () => void }) {
  const [values, setValues] = useState<Record<string, any>>(row);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const set = (k: string, v: any) => setValues((s) => ({ ...s, [k]: v }));

  async function save() {
    for (const f of fields) {
      if (f.required && (values[f.name] === undefined || values[f.name] === "" || values[f.name] === null)) {
        { toast.error(`${f.label} is required`); return; }
      }
    }
    setSaving(true);
    const payload: Record<string, any> = {};
    for (const f of fields) {
      let v = values[f.name];
      if (f.type === "number") v = v === "" || v == null ? null : Number(v);
      if (f.type === "list") v = Array.isArray(v) ? v : String(v ?? "").split("\n").map((s) => s.trim()).filter(Boolean);
      if ((f.type === "text" || f.type === "textarea" || f.type === "image" || f.type === "select") && v === "") v = null;
      if (f.type === "datetime") v = v ? new Date(v).toISOString() : null;
      if (v !== undefined) payload[f.name] = v;
    }
    const q = supabase.from(table as any) as any;
    const { error } = row.id ? await q.update(payload).eq("id", row.id) : await q.insert(payload);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Saved");
    onDone();
  }

  return (
    <div className="card-parchment space-y-5 p-6">
      {fields.map((f) => (
        <div key={f.name} className="space-y-1.5">
          <Label htmlFor={f.name} className="font-semibold">{f.label}{f.required && <span className="text-seal"> *</span>}</Label>
          {f.type === "text" && <Input id={f.name} value={values[f.name] ?? ""} onChange={(e) => set(f.name, e.target.value)} />}
          {f.type === "number" && <Input id={f.name} type="number" value={values[f.name] ?? ""} onChange={(e) => set(f.name, e.target.value)} />}
          {f.type === "datetime" && (
            <Input id={f.name} type="date" value={values[f.name] ? String(values[f.name]).slice(0, 10) : ""} onChange={(e) => set(f.name, e.target.value)} />
          )}
          {f.type === "textarea" && <Textarea id={f.name} rows={5} value={values[f.name] ?? ""} onChange={(e) => set(f.name, e.target.value)} />}
          {f.type === "list" && (
            <Textarea id={f.name} rows={5} value={Array.isArray(values[f.name]) ? values[f.name].join("\n") : values[f.name] ?? ""} onChange={(e) => set(f.name, e.target.value.split("\n"))} />
          )}
          {f.type === "select" && (
            <select id={f.name} className={selectClass} value={values[f.name] ?? ""} onChange={(e) => set(f.name, e.target.value)}>
              <option value="">—</option>
              {f.options?.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          )}
          {f.type === "boolean" && (
            <div className="flex items-center gap-3"><Switch id={f.name} checked={!!values[f.name]} onCheckedChange={(v) => set(f.name, v)} /><span className="text-sm">{values[f.name] ? "Yes" : "No"}</span></div>
          )}
          {f.type === "image" && (
            <div className="flex flex-wrap items-center gap-4">
              {values[f.name] && <img src={values[f.name]} alt="" className="h-24 w-32 object-cover" />}
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-sm border border-input bg-card px-4 py-2 text-sm font-semibold hover:border-gold">
                {uploading === f.name ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />} Upload image
                <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  if (file.size > 8 * 1024 * 1024) { toast.error("Please use an image under 8 MB."); return; }
                  setUploading(f.name);
                  try { set(f.name, await uploadMedia(file, table)); } catch (err: any) { toast.error(err.message); }
                  setUploading(null);
                }} />
              </label>
              {values[f.name] && <Button type="button" variant="ghost" size="sm" onClick={() => set(f.name, "")}>Remove</Button>}
            </div>
          )}
          {f.hint && <p className="text-xs text-muted-foreground">{f.hint}</p>}
        </div>
      ))}
      <div className="flex gap-3 pt-2">
        <Button onClick={save} disabled={saving || !!uploading}>{saving && <Loader2 className="animate-spin" />} Save</Button>
        <Button variant="outline" onClick={onDone}>Cancel</Button>
      </div>
    </div>
  );
}
