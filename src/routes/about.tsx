import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { CtaBand, PageHeader } from "@/components/site/blocks";
import { Ornament, SectionHeading, Seal } from "@/components/site/ornament";
import { useSiteContent } from "@/lib/content-query";
import { companyName, seo } from "@/lib/site";
import classroom from "@/assets/about-classroom.jpg";

export const Route = createFileRoute("/about")({
  head: ({ matches }) =>
    seo({
      matches,
      path: "/about",
      title: "About Sentima | A Teacher-Led School Services Company in Western Kenya",
      description:
        "Founded in 2024 by teachers in Western Kenya, Sentima helps schools work more efficiently by taking repetitive administrative tasks off teachers' desks.",
    }),
  component: About,
});

const VALUES = [
  { title: "Precision", text: "Correct names, correct details, correct quantities — checked before delivery." },
  { title: "Service", text: "We work around the school calendar and respond to the people who run schools." },
  { title: "Evidence", text: "Quotations, agreements and delivery records that a school can keep on file." },
  { title: "Integrity", text: "Honest pricing and honest timelines, agreed in writing." },
  { title: "Learner-data protection", text: "Learner information is used only for the agreed service, and only under agreement." },
  { title: "Youth empowerment", text: "Fair, paid opportunities for young people who work with us as contractors." },
];

function About() {
  const { settings } = useSiteContent();
  const name = companyName(settings);
  return (
    <>
      <PageHeader eyebrow={`About ${name}`} title="Founded by teachers, for schools." intro="We know how much of a teacher's week disappears into tasks that have little to do with teaching. So we built services to take them away." />

      <section className="mx-auto grid max-w-7xl gap-14 px-5 py-24 md:px-8 lg:grid-cols-2">
        <div className="prose-sentima">
          <p className="eyebrow mb-4">Our story</p>
          <h2 className="!mt-0 text-4xl md:text-5xl">From a calligraphy pen to a school services partner</h2>
          <p>
            {name} was founded in 2024 by a team of teachers in Western Kenya. Working in schools, we saw how
            much time went into repetitive administration — preparing identification, labelling items,
            producing certificates — time that could have gone into learners.
          </p>
          <p>
            We began with Gothic calligraphy for certificates and celebrations. Schools asked what else we could
            help with, and we grew into student ID cards, uniform and item labelling, school photography,
            laboratory equipment servicing and free AI awareness talks for teachers.
          </p>
          <p>
            Our aim is simple: to make schools run better by taking repetitive, time-consuming tasks off
            teachers' desks through reliable, affordable and well-documented services.
          </p>
        </div>
        <div data-reveal className="relative">
          <img src={classroom} alt="A quiet Kenyan classroom with exercise books and a teacher's register" loading="lazy" width={1408} height={1008} className="aspect-[4/3] w-full rounded-lg object-cover" />
          <Seal letter={name.charAt(0)} size={72} className="absolute -bottom-5 right-6" />
        </div>
      </section>

      <section className="section-ink">
        <div data-reveal-stagger className="mx-auto grid max-w-7xl gap-px bg-ink-soft md:grid-cols-2">
          <div className="bg-ink p-10 md:p-16">
            <p className="eyebrow mb-4">Mission</p>
            <p className="font-display text-3xl leading-snug text-ink-foreground">{settings?.mission}</p>
          </div>
          <div className="bg-ink p-10 md:p-16">
            <p className="eyebrow mb-4">Vision</p>
            <p className="font-display text-3xl leading-snug text-ink-foreground">{settings?.vision}</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-24 md:px-8">
        <SectionHeading eyebrow="Our values" title="What we hold ourselves to" align="center" />
        <div data-reveal-stagger className="mt-14 grid gap-px overflow-hidden rounded-lg border border-border bg-border md:grid-cols-2 lg:grid-cols-3">
          {VALUES.map((v) => (
            <div key={v.title} className="bg-card p-8">
              <h3 className="text-2xl">{v.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{v.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-muted">
        <div className="mx-auto grid max-w-7xl gap-14 px-5 py-24 md:px-8 lg:grid-cols-2">
          <div>
            <p className="eyebrow mb-4">Learner-data protection</p>
            <h2 className="text-4xl">Learner information is handled with care</h2>
            <div className="prose-sentima mt-5 text-muted-foreground">
              <p>This website does not collect or store learner personal data, and we do not run any learner accounts or databases online.</p>
              <p>Where a service such as student ID cards needs learner details, we sign a non-disclosure and data-protection agreement with the school first. The information is used only for that service and shared only with the people who need it to do the work.</p>
            </div>
            <Button asChild variant="outline" className="mt-6"><Link to="/privacy">Read our privacy policy</Link></Button>
          </div>
          <div>
            <p className="eyebrow mb-4">Youth empowerment</p>
            <h2 className="text-4xl">Fair work for young people</h2>
            <div className="prose-sentima mt-5 text-muted-foreground">
              <p>Much of our work is carried out with young contractors from the communities we serve. We are committed to clear agreements, fair pay and the chance to build real skills — from calligraphy to equipment servicing.</p>
            </div>
          </div>
        </div>
      </section>

      <Ornament className="mx-auto my-16 max-w-xs" />
      <CtaBand />
    </>
  );
}
