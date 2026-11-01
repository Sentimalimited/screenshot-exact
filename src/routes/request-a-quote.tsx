import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { PageHeader } from "@/components/site/blocks";
import { EnquiryForm } from "@/components/site/enquiry-form";
import { seo } from "@/lib/site";

export const Route = createFileRoute("/request-a-quote")({
  validateSearch: z.object({ service: z.string().max(120).optional() }),
  head: ({ matches }) =>
    seo({
      matches,
      path: "/request-a-quote",
      title: "Request a Quote | School ID Cards, Labelling & Calligraphy — Sentima",
      description:
        "Request a written quotation for student ID cards, uniform labelling, calligraphy certificates, school photography or laboratory servicing.",
    }),
  component: Quote,
});

function Quote() {
  const { service } = Route.useSearch();
  return (
    <>
      <PageHeader eyebrow="Request a quote" title="Tell us what your school needs" intro="Share a few details and we will reply with a written quotation and next steps. Fields marked * are required." />
      <section className="mx-auto max-w-4xl px-5 py-16 md:px-8">
        <EnquiryForm kind="quote" defaultService={service} />
      </section>
    </>
  );
}
