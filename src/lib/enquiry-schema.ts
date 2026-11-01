import { z } from "zod";

export const ENQUIRY_KINDS = ["quote", "contact", "meeting", "ai_talk"] as const;
export type EnquiryKind = (typeof ENQUIRY_KINDS)[number];

export const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024;
export const ALLOWED_ATTACHMENT_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

/** Minimum seconds between opening a form and submitting it (bot filter). */
export const MIN_FILL_SECONDS = 3;

const clean = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((s) => s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, ""));

const optionalText = (max: number) =>
  clean(max)
    .optional()
    .transform((v) => (v ? v : undefined));

export const phoneSchema = z
  .string()
  .trim()
  .regex(/^\+?[0-9 ()-]{9,20}$/, "Enter a valid phone number, e.g. +254 7XX XXX XXX");

export const enquirySchema = z
  .object({
    kind: z.enum(ENQUIRY_KINDS),
    organisation: optionalText(160),
    contact_name: clean(120).pipe(z.string().min(2, "Please enter your name")),
    phone: z.union([phoneSchema, z.literal("")]).optional(),
    email: z.string().trim().toLowerCase().email("Enter a valid email address").max(200),
    county: optionalText(80),
    location: optionalText(120),
    service: optionalText(120),
    quantity: z.coerce.number().int().min(1).max(100000).optional().or(z.literal("").transform(() => undefined)),
    details: clean(4000).pipe(z.string().min(10, "Please add a few words about what you need")),
    timeframe: optionalText(120),
    preferred_date: optionalText(120),
    consent: z.literal(true, { errorMap: () => ({ message: "Please agree to be contacted" }) }),
    // Anti-spam fields
    website: z.string().max(0, "Spam detected").optional().default(""),
    started_at: z.number().int(),
    attachment: z
      .object({
        name: z.string().max(200),
        type: z.enum(ALLOWED_ATTACHMENT_TYPES),
        base64: z.string().max(Math.ceil((MAX_ATTACHMENT_BYTES * 4) / 3) + 8),
      })
      .optional(),
  })
  .superRefine((v, ctx) => {
    if ((v.kind === "quote" || v.kind === "meeting" || v.kind === "ai_talk") && !v.organisation) {
      ctx.addIssue({ code: "custom", path: ["organisation"], message: "Please enter your school or organisation" });
    }
    if ((v.kind === "quote" || v.kind === "meeting" || v.kind === "ai_talk") && !v.phone) {
      ctx.addIssue({ code: "custom", path: ["phone"], message: "Please enter a phone number" });
    }
    if (v.kind === "quote" && !v.service) {
      ctx.addIssue({ code: "custom", path: ["service"], message: "Please choose a service" });
    }
  });

export type EnquiryInput = z.input<typeof enquirySchema>;
export type EnquiryParsed = z.output<typeof enquirySchema>;

/** True when the form was submitted too quickly to be a person. */
export function submittedTooFast(startedAt: number, now: number) {
  return now - startedAt < MIN_FILL_SECONDS * 1000;
}
