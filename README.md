# Sentima — School Services Website

Website for **Sentima**, a teacher-led school services company from Western Kenya
(student ID cards, uniform labelling, Gothic calligraphy certificates, school
photography, laboratory servicing and free AI talks for teachers).

Designed and built by **Hart Global Technologies**.

---

## Built with

- **TanStack Start** (React 19) with server-side rendering
- **Vite** build tool
- **Tailwind CSS v4** design system (black, gold, parchment and wax-seal red)
- **Lovable Cloud** backend for content, enquiries, file storage and admin sign-in

## Run it locally

You need Node.js 22 or newer.

```sh
git clone <this-repository-url>
cd <repository-folder>
npm install --legacy-peer-deps
npm run dev
```

The site opens at http://localhost:8080.

Useful commands:

| Command          | What it does                     |
| ---------------- | -------------------------------- |
| `npm run dev`    | Start the local development site |
| `npm run build`  | Build the site for production    |
| `npm run test`   | Run the automated tests          |
| `npm run lint`   | Check the code for mistakes      |

## Deploy to Netlify

The project is ready for Netlify — `netlify.toml` already sets the build.

1. Push this repository to GitHub.
2. In Netlify choose **Add new site → Import an existing project** and pick the repository.
3. Netlify reads `netlify.toml`, so keep the defaults:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Public backend reads prefer runtime settings, then build-time `VITE_*`
   settings, then bundled publishable-only defaults. No private key is bundled.
   Missing runtime settings therefore do not crash the root loader. If the
   content service is unavailable, pages render safely with empty content;
   this does not guarantee that remote content or private actions are available.

5. Click **Deploy**. Netlify detects itself during the build and packages the
   server code as a Netlify Function automatically.

### Important note on the private key

The quote, meeting and contact forms, and images uploaded through the admin
page, are handled on the server with a private backend key
(`SUPABASE_SERVICE_ROLE_KEY`). Lovable Cloud does not hand this key out, so on a
Netlify copy those features will not work until the site is connected to a
backend you control. Every other page (services, pricing, portfolio,
resources, admin sign-in and editing) works with the public keys alone. The
version published from Lovable has every feature working.

## Updating content

### Bulk quotation calculator

The pricing page includes student counts, requested ID card specifications,
uniform label quantities and accessories. It exports a text quotation request
or opens WhatsApp with the request filled in; the visitor confirms sending in
WhatsApp. This does not use the WhatsApp Business API or place an order.

No commercial prices or tiers have been supplied. The calculator therefore
shows prices as unconfirmed unless the requester enters agreed rates. Optional
student-count tiers apply the highest qualifying discount to all selected items.
VAT, delivery and availability remain subject to written confirmation.

Sign in at `/auth`, then open `/admin` to edit services, prices, portfolio
pieces, testimonials, FAQs, articles and company details, and to read
enquiries. The first account created becomes the administrator.

## Project structure

```
src/
  routes/          One file per page (file-based routing)
  components/site/ Shared site sections, motifs and layout
  components/admin Admin page panels
  hooks/           Scroll-reveal and pointer animation hooks
  lib/             Site content, enquiry rules and server functions
  styles.css       Design tokens, motion and patterns
```

---

© Hart Global Technologies. All rights reserved.
