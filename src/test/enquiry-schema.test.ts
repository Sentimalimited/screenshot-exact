import { describe, expect, it } from "vitest";
import { enquirySchema, submittedTooFast } from "@/lib/enquiry-schema";

const base = {
  kind: "quote" as const,
  organisation: "Kakamega High School",
  contact_name: "Jane Wanjiru",
  phone: "+254 712 345 678",
  email: "jane@example.com",
  service: "Student ID Cards",
  details: "We need ID cards for about 400 learners.",
  consent: true,
  started_at: 0,
};

describe("enquiry rules", () => {
  it("accepts a complete quote request", () => {
    expect(enquirySchema.safeParse(base).success).toBe(true);
  });
  it("requires consent to be contacted", () => {
    expect(enquirySchema.safeParse({ ...base, consent: false }).success).toBe(false);
  });
  it("requires a school name for quote requests", () => {
    expect(enquirySchema.safeParse({ ...base, organisation: "" }).success).toBe(false);
  });
  it("rejects a filled honeypot field", () => {
    expect(enquirySchema.safeParse({ ...base, website: "spam.com" }).success).toBe(false);
  });
  it("treats submissions under 3 seconds as too fast", () => {
    expect(submittedTooFast(1000, 3500)).toBe(true);
    expect(submittedTooFast(1000, 4500)).toBe(false);
  });
});
