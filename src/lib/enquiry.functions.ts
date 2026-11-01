import { createServerFn } from "@tanstack/react-start";
import { enquirySchema, submittedTooFast, MAX_ATTACHMENT_BYTES } from "./enquiry-schema";

/**
 * Public endpoint: validates, filters spam, rate-limits by email, then stores
 * the enquiry with the privileged client (anonymous visitors cannot write the table).
 */
export const submitEnquiry = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => enquirySchema.parse(input))
  .handler(async ({ data }) => {
    if (data.website) return { ok: true as const };
    if (submittedTooFast(data.started_at, Date.now())) {
      throw new Error("Please take a moment to complete the form and try again.");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const since = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const { count } = await supabaseAdmin
      .from("enquiries")
      .select("id", { count: "exact", head: true })
      .eq("email", data.email)
      .gte("created_at", since);
    if ((count ?? 0) >= 3) {
      throw new Error("We have received several messages from this email recently. Please try again later or contact us on WhatsApp.");
    }

    let attachment_path: string | null = null;
    if (data.attachment) {
      const bytes = Uint8Array.from(atob(data.attachment.base64), (c) => c.charCodeAt(0));
      if (bytes.byteLength > MAX_ATTACHMENT_BYTES) throw new Error("Attachment is larger than 5 MB.");
      const safeName = data.attachment.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-80);
      const path = `${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}-${safeName}`;
      const { error } = await supabaseAdmin.storage
        .from("enquiry-attachments")
        .upload(path, bytes, { contentType: data.attachment.type, upsert: false });
      if (error) throw new Error("We could not upload your attachment. Please try again without it.");
      attachment_path = path;
    }

    const { error } = await supabaseAdmin.from("enquiries").insert({
      kind: data.kind,
      organisation: data.organisation ?? null,
      contact_name: data.contact_name,
      phone: data.phone || null,
      email: data.email,
      county: data.county ?? null,
      location: data.location ?? null,
      service: data.service ?? null,
      quantity: typeof data.quantity === "number" ? data.quantity : null,
      details: data.details,
      timeframe: data.timeframe ?? null,
      preferred_date: data.preferred_date ?? null,
      attachment_path,
      consent: data.consent,
    });
    if (error) {
      console.error("enquiry insert failed", error.message);
      throw new Error("Sorry, your message could not be sent. Please try again or contact us on WhatsApp.");
    }
    return { ok: true as const };
  });
