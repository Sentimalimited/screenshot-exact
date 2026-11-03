/**
 * Server-only: copies each enquiry into the "Enquiries" table of the Airtable
 * base named "Sentima Enquiries", through the Lovable connector gateway.
 * The database copy remains the source of truth; Airtable failures are logged, never shown to visitors.
 */
const GATEWAY_URL = "https://connector-gateway.lovable.dev/airtable";
export const AIRTABLE_BASE_NAME = "Sentima Enquiries";
export const AIRTABLE_TABLE_NAME = "Enquiries";

const KIND_LABELS: Record<string, string> = {
  quote: "Quote request",
  meeting: "School meeting",
  ai_talk: "Free AI talk",
  contact: "Contact message",
};

export type EnquiryRecord = {
  kind: string;
  organisation: string | null;
  contact_name: string;
  phone: string | null;
  email: string;
  county: string | null;
  location: string | null;
  service: string | null;
  quantity: number | null;
  details: string;
  timeframe: string | null;
  preferred_date: string | null;
  attachment_path: string | null;
};

let cachedBaseId: string | null = null;

function headers() {
  const lovable = process.env["LOVABLE_API_KEY"];
  const airtable = process.env["AIRTABLE_API_KEY"];
  if (!lovable || !airtable) throw new Error("Airtable connection is not configured");
  return {
    Authorization: `Bearer ${lovable}`,
    "X-Connection-Api-Key": airtable,
    "Content-Type": "application/json",
  };
}

async function findBaseId(): Promise<string> {
  if (process.env["AIRTABLE_BASE_ID"]) return process.env["AIRTABLE_BASE_ID"];
  if (cachedBaseId) return cachedBaseId;
  const res = await fetch(`${GATEWAY_URL}/v0/meta/bases`, { headers: headers() });
  if (!res.ok) throw new Error(`Airtable list bases failed [${res.status}]: ${await res.text()}`);
  const body = (await res.json()) as { bases: { id: string; name: string }[] };
  const base = body.bases.find((b) => b.name.trim().toLowerCase() === AIRTABLE_BASE_NAME.toLowerCase());
  if (!base) throw new Error(`Airtable base "${AIRTABLE_BASE_NAME}" not found or not shared with the connection`);
  cachedBaseId = base.id;
  return base.id;
}

export function toAirtableFields(e: EnquiryRecord, receivedAt: string) {
  const fields: Record<string, string | number> = {
    Name: e.contact_name,
    Type: KIND_LABELS[e.kind] ?? e.kind,
    Email: e.email,
    Details: e.details,
    Received: receivedAt,
    Status: "New",
  };
  const optional: [string, string | number | null][] = [
    ["Organisation", e.organisation],
    ["Phone", e.phone],
    ["County", e.county],
    ["Location", e.location],
    ["Service", e.service],
    ["Quantity", e.quantity],
    ["Timeframe", e.timeframe],
    ["Preferred dates", e.preferred_date],
    ["Attachment", e.attachment_path ? "Yes — open it in the website admin page" : null],
  ];
  for (const [k, v] of optional) if (v !== null && v !== "") fields[k] = v;
  return fields;
}

export async function sendEnquiryToAirtable(e: EnquiryRecord, receivedAt = new Date().toISOString()) {
  const baseId = await findBaseId();
  const res = await fetch(`${GATEWAY_URL}/v0/${baseId}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ records: [{ fields: toAirtableFields(e, receivedAt) }], typecast: true }),
  });
  if (!res.ok) throw new Error(`Airtable create record failed [${res.status}]: ${await res.text()}`);
}
