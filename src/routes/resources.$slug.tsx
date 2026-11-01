import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { CtaBand } from "@/components/site/blocks";
import { Ornament } from "@/components/site/ornament";
import { getArticle } from "@/lib/content.functions";
import { seo } from "@/lib/site";

export const Route = createFileRoute("/resources/$slug")({
  loader: async ({ params }) => {
    const article = await getArticle({ data: { slug: params.slug } });
    if (!article) throw notFound();
    return article;
  },
  head: ({ matches, loaderData, params }) =>
    seo({
      matches,
      path: `/resources/${params.slug}`,
      title: loaderData ? `${loaderData.title} — Sentima` : "Article unavailable — Sentima",
      description: loaderData?.excerpt || "Resources for schools from Sentima.",
      type: "article",
      noindex: !loaderData,
    }),
  component: ArticlePage,
});

function ArticlePage() {
  const a = Route.useLoaderData();
  const paragraphs = a.body.split(/\n{2,}/).filter(Boolean);
  return (
    <>
      <article className="mx-auto max-w-3xl px-5 py-20 md:px-8">
        <Link to="/resources" className="text-sm font-semibold text-seal underline underline-offset-4">← All resources</Link>
        {a.published_at && <p className="eyebrow mb-3 mt-10">{new Date(a.published_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>}
        <h1 className="text-5xl md:text-6xl">{a.title}</h1>
        {a.excerpt && <p className="mt-5 text-xl text-muted-foreground">{a.excerpt}</p>}
        <Ornament className="my-10 max-w-xs" />
        <div className="prose-sentima">
          {paragraphs.map((p, i) =>
            p.startsWith("## ") ? <h2 key={i}>{p.slice(3)}</h2> : p.startsWith("### ") ? <h3 key={i}>{p.slice(4)}</h3> : <p key={i}>{p}</p>,
          )}
        </div>
      </article>
      <CtaBand />
    </>
  );
}
