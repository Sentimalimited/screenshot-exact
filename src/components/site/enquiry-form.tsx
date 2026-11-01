import { useState, type FormEvent, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, Loader2, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { submitEnquiry } from "@/lib/enquiry.functions";
import {
  ALLOWED_ATTACHMENT_TYPES,
  MAX_ATTACHMENT_BYTES,
  enquirySchema,
  type EnquiryKind,
} from "@/lib/enquiry-schema";
import { COUNTIES, whatsappLink } from "@/lib/site";
import { useSiteContent } from "@/lib/content-query";

type Values = Record<string, string>;

const selectClass =
  "flex h-10 w-full rounded-sm border border-input bg-card px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

function Field({ id, label, required, error, children, hint }: { id: string; label: string; required?: boolean | undefined; error?: string | undefined; hint?: string | undefined; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-sm font-semibold">
        {label} {required && <span className="text-seal">*</span>}
      </Label>
      {children}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && <p className="text-xs font-medium text-destructive" role="alert">{error}</p>}
    </div>
  );
}

async function fileToBase64(file: File) {
  const buf = new Uint8Array(await file.arrayBuffer());
  let binary = "";
  for (let i = 0; i < buf.length; i += 0x8000) binary += String.fromCharCode(...buf.subarray(i, i + 0x8000));
  return btoa(binary);
}

export function EnquiryForm({
  kind: initialKind,
  defaultService,
  allowKindSwitch = false,
}: {
  kind: EnquiryKind;
  defaultService?: string | undefined;
  allowKindSwitch?: boolean;
}) {
  const { services, settings } = useSiteContent();
  const submit = useServerFn(submitEnquiry);
  const [kind, setKind] = useState<EnquiryKind>(initialKind);
  const [values, setValues] = useState<Values>({ service: defaultService ?? "" });
  const [consent, setConsent] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [serverError, setServerError] = useState<string | null>(null);
  const [startedAt] = useState(() => Date.now());

  const isQuote = kind === "quote";
  const isBooking = kind === "meeting" || kind === "ai_talk";
  const isContact = kind === "contact";

  const set = (k: string) => (e: { target: { value: string } }) => setValues((v) => ({ ...v, [k]: e.target.value }));

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setServerError(null);
    const fd = new FormData(e.currentTarget);
    const payload: Record<string, unknown> = {
      ...values,
      kind,
      consent,
      started_at: startedAt,
      website: String(fd.get("website") ?? ""),
      service: kind === "ai_talk" ? "Free AI talk for teachers" : values["service"] || undefined,
    };
    if (file) {
      if (file.size > MAX_ATTACHMENT_BYTES) return setErrors({ attachment: "Attachment must be 5 MB or smaller." });
      if (!ALLOWED_ATTACHMENT_TYPES.includes(file.type as (typeof ALLOWED_ATTACHMENT_TYPES)[number]))
        return setErrors({ attachment: "Please attach a PDF, JPG, PNG or Word document." });
    }
    const parsed = enquirySchema.safeParse(payload);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      for (const issue of parsed.error.issues) errs[String(issue.path[0])] ??= issue.message;
      setErrors(errs);
      return;
    }
    setErrors({});
    setStatus("sending");
    try {
      if (file) payload.attachment = { name: file.name, type: file.type, base64: await fileToBase64(file) };
      await submit({ data: payload });
      setStatus("sent");
    } catch (err) {
      setStatus("idle");
      setServerError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  if (status === "sent") {
    return (
      <div className="card-parchment frame-gold p-10 text-center" role="status">
        <CheckCircle2 className="mx-auto size-12 text-gold" />
        <h3 className="mt-4 text-3xl">Thank you — we have received your message.</h3>
        <p className="mx-auto mt-3 max-w-md text-muted-foreground">
          A member of our team will get back to you. If your request is urgent, message us on WhatsApp.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button asChild variant="whatsapp"><a href={whatsappLink(settings)} target="_blank" rel="noopener noreferrer">WhatsApp us</a></Button>
          <Button asChild variant="outline"><Link to="/">Back to home</Link></Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="card-parchment space-y-6 p-6 md:p-10">
      {allowKindSwitch && (
        <fieldset>
          <legend className="mb-2 text-sm font-semibold">What would you like to book?</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {([
              ["meeting", "A school meeting", "Discuss services and a quotation"],
              ["ai_talk", "A free AI talk", "For your teaching staff"],
            ] as const).map(([k, title, sub]) => (
              <label key={k} className={`cursor-pointer rounded-sm border p-4 transition-colors ${kind === k ? "border-gold bg-accent" : "border-border bg-card hover:border-gold/60"}`}>
                <input type="radio" name="kind" value={k} checked={kind === k} onChange={() => setKind(k)} className="sr-only" />
                <span className="block font-display text-lg font-semibold">{title}</span>
                <span className="text-xs text-muted-foreground">{sub}</span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      {/* Honeypot: hidden from people, tempting to bots */}
      <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden>
        <label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Field id="organisation" label={isContact ? "School or organisation" : "School or organisation name"} required={!isContact} error={errors["organisation"]}>
          <Input id="organisation" value={values["organisation"] ?? ""} onChange={set("organisation")} autoComplete="organization" />
        </Field>
        <Field id="contact_name" label="Your name" required error={errors["contact_name"]}>
          <Input id="contact_name" value={values["contact_name"] ?? ""} onChange={set("contact_name")} autoComplete="name" />
        </Field>
        <Field id="phone" label="Phone number" required={!isContact} error={errors["phone"]}>
          <Input id="phone" type="tel" value={values["phone"] ?? ""} onChange={set("phone")} autoComplete="tel" placeholder="+254 7XX XXX XXX" />
        </Field>
        <Field id="email" label="Email" required error={errors["email"]}>
          <Input id="email" type="email" value={values["email"] ?? ""} onChange={set("email")} autoComplete="email" />
        </Field>

        {!isContact && (
          <>
            <Field id="county" label="County" error={errors["county"]}>
              <select id="county" className={selectClass} value={values["county"] ?? ""} onChange={set("county")}>
                <option value="">Select county</option>
                {COUNTIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field id="location" label="Town or location" error={errors["location"]}>
              <Input id="location" value={values["location"] ?? ""} onChange={set("location")} />
            </Field>
          </>
        )}

        {isQuote && (
          <>
            <Field id="service" label="Service required" required error={errors["service"]}>
              <select id="service" className={selectClass} value={values["service"] ?? ""} onChange={set("service")}>
                <option value="">Select a service</option>
                {services.map((s) => <option key={s.id} value={s.title}>{s.title}</option>)}
                <option value="Several services">Several services</option>
              </select>
            </Field>
            <Field id="quantity" label="Estimated number of learners or items" error={errors["quantity"]}>
              <Input id="quantity" type="number" min={1} inputMode="numeric" value={values["quantity"] ?? ""} onChange={set("quantity")} />
            </Field>
            <Field id="timeframe" label="Preferred timeframe" error={errors["timeframe"]} hint="e.g. before the start of Term 1">
              <Input id="timeframe" value={values["timeframe"] ?? ""} onChange={set("timeframe")} />
            </Field>
          </>
        )}

        {isBooking && (
          <>
            <Field id="preferred_date" label="Preferred dates" error={errors["preferred_date"]} hint="Give one or two options">
              <Input id="preferred_date" value={values["preferred_date"] ?? ""} onChange={set("preferred_date")} />
            </Field>
            {kind === "ai_talk" && (
              <Field id="quantity" label="Approximate number of staff" error={errors["quantity"]}>
                <Input id="quantity" type="number" min={1} inputMode="numeric" value={values["quantity"] ?? ""} onChange={set("quantity")} />
              </Field>
            )}
          </>
        )}
      </div>

      <Field id="details" label={isContact ? "Your message" : "Describe your requirements"} required error={errors["details"]}
        hint="Please do not include learners' personal details here.">
        <Textarea id="details" rows={5} value={values["details"] ?? ""} onChange={set("details")} />
      </Field>

      {isQuote && (
        <Field id="attachment" label="Attachment (optional)" error={errors["attachment"]} hint="Sample design, wording or list of items. PDF, JPG, PNG or Word, up to 5 MB.">
          <label htmlFor="attachment" className="flex cursor-pointer items-center gap-3 rounded-sm border border-dashed border-input bg-card px-4 py-3 text-sm hover:border-gold">
            <Paperclip className="size-4 text-gold" />
            <span className="truncate">{file ? file.name : "Choose a file"}</span>
          </label>
          <input id="attachment" type="file" className="sr-only" accept=".pdf,.jpg,.jpeg,.png,.docx" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        </Field>
      )}

      <div className="space-y-1.5">
        <div className="flex items-start gap-3">
          <Checkbox id="consent" checked={consent} onCheckedChange={(v) => setConsent(v === true)} className="mt-0.5" />
          <Label htmlFor="consent" className="text-sm font-normal leading-relaxed">
            I agree to be contacted about this enquiry. My details will be used as described in the{" "}
            <Link to="/privacy" className="text-seal underline underline-offset-2">privacy policy</Link>.
          </Label>
        </div>
        {errors["consent"] && <p className="text-xs font-medium text-destructive" role="alert">{errors["consent"]}</p>}
      </div>

      {serverError && <p className="rounded-sm border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive" role="alert">{serverError}</p>}

      <Button type="submit" variant="seal" size="lg" disabled={status === "sending"} className="w-full md:w-auto">
        {status === "sending" && <Loader2 className="animate-spin" />}
        {isQuote ? "Send quote request" : isBooking ? "Send booking request" : "Send message"}
      </Button>
    </form>
  );
}
