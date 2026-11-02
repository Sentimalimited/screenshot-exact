<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Project rules
- Public content (settings, services, pricing, portfolio, testimonials, FAQs, articles) loads through one public server function (`getSiteContent`) cached under the `site-content` query; admin edits must invalidate that key.
- Enquiries are written only by the `submitEnquiry` server function with the privileged client; visitors have no direct table access, so validation and spam checks stay server-side.
- Admin-uploaded files live in the private `media` bucket under `site/` and are served via the `/media/*` redirect route, because public buckets are blocked for this workspace.
- Admin access is a role in `user_roles`; the first account created becomes admin via a database trigger.
- A pathless `_authenticated` layout must always have at least one child route, or it collides with `/`.
- Scroll reveal state is set via data attributes (data-shown, data-reveal-ready) only after initial hydration, never className/style, because changing React-owned attributes before hydration causes mismatches.
- Netlify self-hosting relies on nitro's zero-config preset detection (no preset pinned in vite.config.ts) plus `netlify.toml` publishing `dist`, so Lovable builds keep their own pinned preset.
- Pointer effects (`data-tilt`, `data-spotlight`, `data-magnetic`) are driven by one delegated listener in `use-pointer-fx.ts` that writes CSS custom properties after hydration, never React state, to stay hydration-safe and cheap.
