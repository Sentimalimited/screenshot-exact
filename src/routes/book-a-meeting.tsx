import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { PageHeader } from "@/components/site/blocks";
import { EnquiryForm } from "@/components/site/enquiry-form";
import { seo } from "@/lib/site";

export const Route = createFileRoute("/book-a-meeting")({
  validateSearch: z.object({ type: z.enum(["meeting", "ai_talk"]).optional() }),
  head: ({ matches }) =>
    seo({
      matches,
      path: "/book-a-meeting",
      title: "Book a School Meeting or Free AI Talk for Teachers — Sentima",
      description:
        "Request a meeting with Sentima to discuss school services, or book a free AI awareness talk for your teaching staff.",
    }),
  component: Book,
});

function Book() {
  const { type } = Route.useSearch();
  return (
    <>
      <PageHeader eyebrow="Book a meeting" title="Meet us, or book a free AI talk" intro="Send a booking request with your preferred dates. We will confirm a time with you by phone, WhatsApp or email." />
      <section className="mx-auto max-w-4xl px-5 py-16 md:px-8">
        <EnquiryForm key={type ?? "meeting"} kind={type ?? "meeting"} allowKindSwitch />
      </section>
    </>
  );
}
