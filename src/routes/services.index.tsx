import { createFileRoute } from "@tanstack/react-router";
import { CtaBand, PageHeader, ServiceCard } from "@/components/site/blocks";
import { useSiteContent } from "@/lib/content-query";
import { seo } from "@/lib/site";

export const Route = createFileRoute("/services/")({
  head: ({ matches }) =>
    seo({
      matches,
      path: "/services",
      title: "School Services in Kenya | ID Cards, Labelling, Calligraphy & More — Sentima",
      description:
        "Explore Sentima's school services: student ID cards, uniform and item labelling, Gothic calligraphy certificates, school photography, lab equipment servicing and free AI talks.",
    }),
  component: ServicesIndex,
});

function ServicesIndex() {
  const { services } = useSiteContent();
  return (
    <>
      <PageHeader eyebrow="Services" title="Practical services for busy schools" intro="Each service is designed to remove a repetitive task from teachers and administrators. Choose a service to see what it involves and how to request it." />
      <section className="mx-auto max-w-7xl px-5 py-20 md:px-8">
        <div data-reveal-stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => <ServiceCard key={s.id} service={s} />)}
        </div>
      </section>
      <CtaBand />
    </>
  );
}
