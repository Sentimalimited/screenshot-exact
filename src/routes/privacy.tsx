import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/blocks";
import { useSiteContent } from "@/lib/content-query";
import { companyName, seo } from "@/lib/site";

export const Route = createFileRoute("/privacy")({
  head: ({ matches }) =>
    seo({
      matches,
      path: "/privacy",
      title: "Privacy Policy & Learner-Data Approach — Sentima",
      description:
        "How Sentima handles enquiry information submitted through this website, and our learner-data-conscious approach when working with schools.",
    }),
  component: Privacy,
});

function Privacy() {
  const { settings } = useSiteContent();
  const name = companyName(settings);
  const updated = settings?.updated_at ? new Date(settings.updated_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : null;
  return (
    <>
      <PageHeader eyebrow="Privacy" title="Privacy policy" intro="How we handle the information you share with us, and how we protect learner data." />
      <section className="mx-auto max-w-3xl px-5 py-16 md:px-8">
        {!settings?.privacy_approved && (
          <p className="mb-10 rounded-md border border-seal/40 bg-seal/10 p-4 text-sm">
            <strong>Draft:</strong> this policy is awaiting review and approval by {name} before launch.
          </p>
        )}
        <div className="prose-sentima">
          <h2>Who we are</h2>
          <p>{name} is a teacher-led school services company operating in Western Kenya. This policy explains how we handle personal information submitted through this website.</p>

          <h2>What we collect through this website</h2>
          <p>When you send an enquiry, request a quote or book a meeting, we collect only what you choose to provide: your name, school or organisation, phone number, email address, county and location, the service you are interested in, and the details of your request. You may optionally attach a file to a quote request.</p>
          <p><strong>This website does not collect learner personal data.</strong> Please do not include learners' names or details in website forms.</p>

          <h2>How we use it</h2>
          <ul>
            <li>To respond to your enquiry and prepare quotations.</li>
            <li>To arrange meetings, talks and services you have asked about.</li>
            <li>To keep a record of our correspondence with your school or organisation.</li>
          </ul>
          <p>We do not sell your information or use it for unrelated marketing.</p>

          <h2>Our learner-data-conscious approach</h2>
          <p>Some services, such as student ID cards, require learner information. In these cases we sign a non-disclosure and data-protection agreement with the school before any learner information is shared. Learner information is used only for the agreed service, shared only with the people who need it to do the work, and returned or deleted when the work is complete, as set out in the agreement.</p>
          <p>We aim to follow the principles of Kenya's Data Protection Act, 2019. We do not claim any formal certification.</p>

          <h2>How we protect information</h2>
          <p>This website is served over an encrypted connection (HTTPS). Enquiries are stored securely and can only be read by authorised {name} staff. Forms are protected against automated spam.</p>

          <h2>How long we keep it</h2>
          <p>We keep enquiry records for as long as needed to respond and to maintain a record of our work with your school, and then delete them.</p>

          <h2>Your rights</h2>
          <p>You may ask us what information we hold about you, ask us to correct it, or ask us to delete it. Contact us using the details on our <Link to="/contact">contact page</Link>.</p>

          <h2>Analytics</h2>
          <p>If enabled, we use privacy-respecting analytics to understand how visitors use this website. This does not identify you personally.</p>

          {updated && <p className="mt-10 text-sm text-muted-foreground">Last updated: {updated}</p>}
        </div>
      </section>
    </>
  );
}
