import { createFileRoute, Link } from "@tanstack/react-router";
import { CtaBand, FaqList, PageHeader } from "@/components/site/blocks";
import { useSiteContent } from "@/lib/content-query";
import { seo } from "@/lib/site";

export const Route = createFileRoute("/resources/")({
  head: ({ matches }) => {
    const base = seo({
      matches,
      path: "/resources",
      title: "Resources & FAQs | School ID Cards, Labelling, Calligraphy & AI — Sentima",
      description:
        "Answers on per-learner pricing, hand-lettered certificates, learner-data protection, using AI in school administration and planning ID cards and labelling.",
    });
    return base;
  },
  component: Resources,
});

function Resources() {
  const { faqs, articles } = useSiteContent();
  const groups = Array.from(new Set(faqs.map((f) => f.category)));
  return (
    <>
      <PageHeader eyebrow="Resources" title="Questions schools ask us" intro="Practical answers for principals, headteachers and administrators." />
      <section className="mx-auto max-w-4xl px-5 py-20 md:px-8">
        {groups.map((g) => (
          <div key={g} className="mb-14">
            <h2 className="mb-4 text-3xl">{g}</h2>
            <FaqList faqs={faqs.filter((f) => f.category === g)} />
          </div>
        ))}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })),
            }).replace(/</g, "\\u003c"),
          }}
        />
      </section>

      {articles.length > 0 && (
        <section className="border-t border-border bg-muted">
          <div className="mx-auto max-w-7xl px-5 py-20 md:px-8">
            <h2 className="text-4xl">Articles</h2>
            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {articles.map((a) => (
                <Link key={a.id} to="/resources/$slug" params={{ slug: a.slug }} className="card-parchment block p-7 transition-transform hover:-translate-y-1">
                  {a.published_at && <p className="eyebrow mb-2">{new Date(a.published_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>}
                  <h3 className="text-2xl">{a.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{a.excerpt}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
      <CtaBand />
    </>
  );
}
