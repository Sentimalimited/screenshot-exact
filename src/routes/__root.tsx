import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { siteContentQuery } from "@/lib/content-query";
import { getRequestOrigin } from "@/lib/content.functions";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { WhatsAppFloat } from "@/components/site/whatsapp-float";
import { Toaster } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { useReveal, useScrolledFlag } from "@/hooks/use-reveal";

function NotFoundComponent() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <p className="font-blackletter text-8xl text-gold">404</p>
        <h1 className="mt-4 text-3xl text-foreground">Page not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you are looking for does not exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-sm bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-ink-soft"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-3xl tracking-tight text-foreground">This page didn't load</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-sm bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-ink-soft"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-sm border border-input bg-background px-4 py-2 text-sm font-semibold text-foreground hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  loader: async ({ context }) => {
    const [content, origin] = await Promise.all([
      context.queryClient.ensureQueryData(siteContentQuery),
      getRequestOrigin(),
    ]);
    return {
      origin,
      gaId: content.settings?.ga_measurement_id ?? null,
      gscToken: content.settings?.search_console_token ?? null,
    };
  },
  head: ({ loaderData }) => {
    const gaId = loaderData?.gaId && /^G-[A-Z0-9]{4,20}$/.test(loaderData.gaId) ? loaderData.gaId : null;
    const gsc = loaderData?.gscToken && /^[A-Za-z0-9_-]{10,100}$/.test(loaderData.gscToken) ? loaderData.gscToken : null;
    return {
      meta: [
        { charSet: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { title: "Sentima — Teacher-led school services in Western Kenya" },
        { name: "description", content: "Student ID cards, uniform labelling, Gothic calligraphy certificates, school photography and lab servicing for schools in Kenya." },
        { name: "theme-color", content: "#141210" },
        { property: "og:site_name", content: "Sentima" },
        { property: "og:locale", content: "en_KE" },
        ...(gsc ? [{ name: "google-site-verification", content: gsc }] : []),
      ],
      links: [
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500&family=Libre+Franklin:wght@400;500;600;700&family=UnifrakturMaguntia&display=swap",
        },
        { rel: "stylesheet", href: appCss },
        { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      ],
      scripts: gaId
        ? [
            { src: `https://www.googletagmanager.com/gtag/js?id=${gaId}`, async: true },
            {
              children: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId}',{anonymize_ip:true});`,
            },
          ]
        : [],
    };
  },
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en-GB">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isAdminArea = pathname.startsWith("/admin") || pathname.startsWith("/auth");

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      router.invalidate();
      if (event !== "SIGNED_OUT") queryClient.invalidateQueries();
    });
    return () => data.subscription.unsubscribe();
  }, [router, queryClient]);

  useReveal(pathname);
  useScrolledFlag();

  return (
    <QueryClientProvider client={queryClient}>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-gold focus:px-4 focus:py-2 focus:text-gold-foreground">
        Skip to content
      </a>
      <SiteHeader />
      <main id="main" key={pathname} className="animate-page">
        <Outlet />
      </main>
      {!isAdminArea && <SiteFooter />}
      {!isAdminArea && <WhatsAppFloat />}
      <Toaster />
    </QueryClientProvider>
  );
}
