// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

const isGitHubPages = process.env["GITHUB_PAGES"] === "true";
const [repositoryOwner = "", repositoryName = ""] = (process.env["GITHUB_REPOSITORY"] ?? "").split("/");
const isUserSite = repositoryName.toLowerCase() === `${repositoryOwner}.github.io`.toLowerCase();
const pagesBase = isGitHubPages && repositoryName && !isUserSite ? `/${repositoryName}/` : "/";
const pagesOrigin = (process.env["VITE_SITE_URL"] ?? "").replace(/\/$/, "");
const publicPages = [
  "/",
  "/about",
  "/services",
  "/portfolio",
  "/pricing",
  "/resources",
  "/contact",
  "/request-a-quote",
  "/book-a-meeting",
  "/privacy",
];

export default defineConfig({
  vite: {
    base: pagesBase,
    define: { "import.meta.env.VITE_GITHUB_PAGES": JSON.stringify(isGitHubPages ? "true" : "false") },
  },
  // GitHub Pages serves files only. Other hosts retain the normal server build.
  ...(isGitHubPages ? { nitro: { preset: "github-pages" } } : {}),
  tanstackStart: {
    // Use the project-root-relative path so Vite/Nitro build the actual SSR handler,
    // rather than falling back to the client HTML entry during the SSR build.
    server: { entry: "src/server.ts" },
    ...(isGitHubPages
      ? {
          router: { basepath: pagesBase === "/" ? "/" : pagesBase.slice(0, -1) },
          pages: publicPages.map((path) => ({ path })),
          prerender: {
            enabled: true,
            crawlLinks: true,
            autoStaticPathsDiscovery: false,
            failOnError: true,
            filter: (page: { path: string }) => !/\/(auth|admin)(\/|$)/.test(page.path),
          },
          sitemap: { enabled: true, host: `${pagesOrigin}${pagesBase === "/" ? "" : pagesBase.slice(0, -1)}` },
        }
      : {}),
  },
});
