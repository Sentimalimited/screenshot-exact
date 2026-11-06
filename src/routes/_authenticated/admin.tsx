import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { CollectionEditor } from "@/components/admin/collection-editor";
import { EnquiriesPanel } from "@/components/admin/enquiries-panel";
import { SettingsPanel } from "@/components/admin/settings-panel";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [
    { title: "Administration — Sentima" },
    { name: "description", content: "Manage Sentima school services, content and enquiries." },
    { property: "og:title", content: "Administration — Sentima" },
    { property: "og:description", content: "Manage Sentima school services, content and enquiries." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex, nofollow" },
  ] }),
  component: AdminPage,
});

function AdminPage() {
  const { user } = Route.useRouteContext();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { data: isAdmin, isLoading } = useQuery({
    queryKey: ["admin", "is-admin", user.id],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
      if (error) throw error;
      return !!data;
    },
  });

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  if (isLoading) return <div className="p-16"><Loader2 className="animate-spin" /></div>;

  return (
    <section className="mx-auto max-w-6xl px-5 py-12 md:px-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="eyebrow mb-2">Administration</p>
          <h1 className="text-4xl">Website manager</h1>
          <p className="mt-1 text-sm text-muted-foreground">Signed in as {user.email}</p>
        </div>
        <Button variant="outline" onClick={signOut}><LogOut /> Sign out</Button>
      </div>

      {!isAdmin ? (
        <p className="card-parchment p-8">This account does not have administrator access. Ask the existing administrator to grant access.</p>
      ) : (
        <Tabs defaultValue="enquiries">
          <TabsList className="mb-8 flex h-auto flex-wrap justify-start gap-1 bg-muted p-1">
            {["enquiries", "company", "services", "pricing", "portfolio", "testimonials", "faqs", "articles"].map((t) => (
              <TabsTrigger key={t} value={t} className="capitalize">{t === "faqs" ? "FAQs" : t}</TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value="enquiries"><EnquiriesPanel /></TabsContent>
          <TabsContent value="company"><SettingsPanel /></TabsContent>
          <TabsContent value="services">
            <CollectionEditor table="services" titleField="title" subtitle={(r) => `/services/${r["slug"]}`}
              note="Each service has its own page. Keep the web address (slug) short, lowercase and hyphenated."
              newDefaults={{ published: true, benefits: [], cta_label: "Request a quote" }}
              fields={[
                { name: "title", label: "Title", type: "text", required: true },
                { name: "slug", label: "Web address (slug)", type: "text", required: true, hint: "e.g. student-id-cards" },
                { name: "summary", label: "Short summary", type: "textarea" },
                { name: "involves", label: "What it involves", type: "textarea" },
                { name: "audience", label: "Who it is for", type: "textarea" },
                { name: "benefits", label: "Benefits (one per line)", type: "list" },
                { name: "how_to_request", label: "How to request it", type: "textarea" },
                { name: "cta_label", label: "Button label", type: "text" },
                { name: "image_url", label: "Photograph", type: "image", hint: "Leave empty to use the default photograph." },
                { name: "image_alt", label: "Photograph description (for accessibility and search)", type: "text" },
                { name: "seo_title", label: "Search title", type: "text" },
                { name: "seo_description", label: "Search description", type: "textarea" },
                { name: "sort_order", label: "Order", type: "number" },
                { name: "published", label: "Published", type: "boolean" },
              ]} />
          </TabsContent>
          <TabsContent value="pricing">
            <CollectionEditor table="pricing_items" titleField="name" subtitle={(r) => r["price_label"] || "Individual quotation"}
              note="Only enter a price once it is approved. Leave the price empty to show “Individual quotation”."
              newDefaults={{ published: true, requires_quote: true }}
              fields={[
                { name: "name", label: "Name", type: "text", required: true },
                { name: "service_slug", label: "Linked service (slug)", type: "text" },
                { name: "description", label: "Description", type: "textarea" },
                { name: "price_label", label: "Price", type: "text", hint: "e.g. KES 150 — leave empty if quoted individually" },
                { name: "unit", label: "Basis", type: "text", hint: "e.g. per learner" },
                { name: "requires_quote", label: "Requires individual quotation", type: "boolean" },
                { name: "sort_order", label: "Order", type: "number" },
                { name: "published", label: "Published", type: "boolean" },
              ]} />
          </TabsContent>
          <TabsContent value="portfolio">
            <CollectionEditor table="portfolio_items" titleField="title" subtitle={(r) => r["category"]}
              note="Only upload work you have permission to show."
              newDefaults={{ published: true, category: "certificates" }}
              fields={[
                { name: "image_url", label: "Image", type: "image", required: true },
                { name: "title", label: "Title", type: "text", required: true },
                { name: "category", label: "Category", type: "select", options: ["certificates", "celebrations", "events", "other"], required: true },
                { name: "caption", label: "Caption", type: "text" },
                { name: "description", label: "Project description", type: "textarea" },
                { name: "alt_text", label: "Image description (for accessibility and search)", type: "text" },
                { name: "sort_order", label: "Order", type: "number" },
                { name: "published", label: "Published", type: "boolean" },
              ]} />
          </TabsContent>
          <TabsContent value="testimonials">
            <CollectionEditor table="testimonials" titleField="author_name" subtitle={(r) => (r["permission_confirmed"] ? "Permission confirmed" : "No permission recorded")}
              note="Testimonials appear on the website only when both “Permission confirmed” and “Published” are on."
              newDefaults={{ published: false, permission_confirmed: false }}
              fields={[
                { name: "quote", label: "Quote", type: "textarea", required: true },
                { name: "author_name", label: "Name", type: "text", required: true },
                { name: "author_role", label: "Role", type: "text" },
                { name: "organisation", label: "School or organisation", type: "text" },
                { name: "permission_confirmed", label: "Written permission obtained", type: "boolean" },
                { name: "sort_order", label: "Order", type: "number" },
                { name: "published", label: "Published", type: "boolean" },
              ]} />
          </TabsContent>
          <TabsContent value="faqs">
            <CollectionEditor table="faqs" titleField="question" subtitle={(r) => r["category"]}
              newDefaults={{ published: true, category: "General" }}
              fields={[
                { name: "question", label: "Question", type: "text", required: true },
                { name: "answer", label: "Answer", type: "textarea", required: true },
                { name: "category", label: "Category", type: "text" },
                { name: "show_on_home", label: "Show on home page", type: "boolean" },
                { name: "sort_order", label: "Order", type: "number" },
                { name: "published", label: "Published", type: "boolean" },
              ]} />
          </TabsContent>
          <TabsContent value="articles">
            <CollectionEditor table="articles" titleField="title" order="created_at" subtitle={(r) => `/resources/${r["slug"]}`}
              note="Separate paragraphs with a blank line. Start a line with ## for a heading."
              newDefaults={{ published: false }}
              fields={[
                { name: "title", label: "Title", type: "text", required: true },
                { name: "slug", label: "Web address (slug)", type: "text", required: true },
                { name: "excerpt", label: "Summary", type: "textarea" },
                { name: "body", label: "Article text", type: "textarea" },
                { name: "published_at", label: "Publication date", type: "datetime" },
                { name: "published", label: "Published", type: "boolean" },
              ]} />
          </TabsContent>
        </Tabs>
      )}
    </section>
  );
}
