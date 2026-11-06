# BlackTuf Technologies — Website & Product Hub

The official website and central product hub for **BlackTuf Technologies**. It combines a
premium, responsive marketing site with a database-backed product directory, a documentation
section, public contact and support forms, and a private administration dashboard.

The project is a two-app monorepo:

```
BTT-WEB/
├── frontend/   Next.js 15 (App Router) + React 19 + TypeScript + Tailwind CSS
├── backend/    Express 4 + MongoDB (Mongoose) + JWT auth + Cloudinary uploads
└── package.json  npm workspaces + convenience scripts
```

There is no Supabase or other BaaS in this project. All content and form submissions are stored
in MongoDB through the Express API.

---

## Contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Local setup](#local-setup)
- [Environment variables](#environment-variables)
- [Database seeding](#database-seeding)
- [Admin dashboard](#admin-dashboard)
- [API overview](#api-overview)
- [Scripts](#scripts)
- [Deployment](#deployment)
- [Security notes](#security-notes)
- [Content policy](#content-policy)
- [License](#license)

---

## Features

**Public site**

- Homepage with featured products, services, company introduction, latest updates, and support CTA.
- Product directory with category filters, search, status badges, and featured sorting.
- Reusable product detail template with features, how-it-works steps, screenshots and lightbox,
  technologies, FAQs, changelog, launch notifications, and outbound links.
- Services, About, Documentation (hub + article pages with search, sidebar, table of contents),
  Support, and Contact pages.
- Legal pages for Privacy, Terms, and Cookies.
- Global command palette (`Ctrl + K` / `⌘ + K`) searching pages, products, services, and docs.
- Dynamic SEO: per-page metadata, canonical URLs, Open Graph/Twitter cards, JSON-LD, sitemap,
  robots, and web manifest.
- Custom 404, error boundary, global error, and loading states.
- Fully responsive dark glassmorphism design with accent `#3b82f6`, motion that respects
  `prefers-reduced-motion`, keyboard support, and visible focus states.
- Graceful degradation: if the API is unreachable, public pages render empty states rather than
  crashing.

**Admin dashboard** (`/admin`)

- HTTP-only cookie sign-in with rate limiting.
- Dashboard with live product/inbox statistics.
- Full product editor: identity, media uploads, features, how-it-works, screenshots, technologies,
  FAQs, changelog, links, pricing, publish/feature flags, ordering, SEO fields, and live previews.
- Services manager and category manager.
- Contact-message inbox with search, status filters, reply links, and delete.
- Support-request queue with status workflow and attachments.
- Launch-signup list with search, product filter, CSV export, and copy-emails.
- Company settings: brand identity, support handle/URL, social links, and optional non-sensitive
  business information.
- Account page: signed-in profile and password change.

---

## Tech stack

| Layer      | Technology                                                                 |
| ---------- | -------------------------------------------------------------------------- |
| Frontend   | Next.js 15.5 (App Router), React 19, TypeScript 5.7, Tailwind CSS 3.4      |
| UI/motion  | Framer Motion 11, Lucide icons                                              |
| Backend    | Node.js 20+, Express 4, Mongoose 8                                          |
| Auth       | bcryptjs password hashes, JSON Web Tokens, HTTP-only cookie                 |
| Validation | Zod schemas on every write endpoint                                         |
| Uploads    | Cloudinary via multer memory storage                                        |
| Database   | MongoDB Atlas (or any MongoDB-compatible deployment)                        |

---

## Prerequisites

- Node.js **20.9+** and npm 10+ (developed on Node 20.20, npm 11).
- A MongoDB database (MongoDB Atlas free tier is enough).
- A Cloudinary account if you want image uploads and support attachments. Uploads fail with a
  clear error when Cloudinary is not configured; the rest of the site still works.
- Optional: `openssl` for generating a JWT secret.

---

## Local setup

1. **Install dependencies** from the repository root:

   ```bash
   npm install
   ```

2. **Create the backend environment file**:

   ```bash
   cp backend/.env.example backend/.env
   ```

   Fill in `MONGODB_URI`, `JWT_SECRET`, and (optionally) `CLOUDINARY_*`. See the
   [environment table](#backend-environment).

3. **Create the frontend environment file**:

   ```bash
   cp frontend/.env.example frontend/.env.local
   ```

   The defaults point at `http://localhost:3000` and `http://localhost:5000` and work for local
   development unchanged.

4. **Seed real content** (categories, services, settings, and the three verified products):

   ```bash
   npm run seed
   ```

   Seeding is idempotent and safe by default. To replace existing seeded records with the
   canonical versions, use:

   ```bash
   npm run seed -- --force
   ```

   > `--force` refreshes the seeded products, categories, services, and settings. It does not
   > delete contact messages, support requests, or launch signups.

5. **Create the first administrator**:

   ```bash
   cd backend
   ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='a-long-unique-password' npm run seed:admin
   ```

   Or set `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` in `backend/.env` and run
   `npm run seed:admin` from the root. Passwords must be at least 10 characters. Running the
   command again for an existing email resets that account's password.

6. **Start both apps**:

   ```bash
   npm run dev
   ```

   - Website: <http://localhost:3000>
   - API: <http://localhost:5000> (`GET /api/health` returns a health check)
   - Admin: <http://localhost:3000/admin>

---

## Environment variables

### Backend environment

Create `backend/.env` from `backend/.env.example`.

| Variable                | Required | Description                                                                 |
| ----------------------- | :------: | --------------------------------------------------------------------------- |
| `NODE_ENV`              |    no    | `development` or `production`. Controls secure cookies.                     |
| `PORT`                  |    no    | API port. Defaults to `5000`.                                               |
| `MONGODB_URI`           |  **yes** | MongoDB connection string, including the database name.                      |
| `JWT_SECRET`            |  **yes** | Long random secret used to sign admin tokens.                              |
| `JWT_EXPIRES_IN`        |    no    | Token lifetime. Defaults to `7d`.                                           |
| `ADMIN_NAME`            |    no    | Display name for `npm run seed:admin`. Defaults to `BlackTuf Admin`.         |
| `ADMIN_EMAIL`           |  seed    | Email for the initial admin account.                                        |
| `ADMIN_PASSWORD`        |  seed    | Password for the initial admin account (minimum 10 characters).             |
| `CLOUDINARY_CLOUD_NAME` | uploads  | Cloudinary cloud name.                                                      |
| `CLOUDINARY_API_KEY`    | uploads  | Cloudinary API key.                                                         |
| `CLOUDINARY_API_SECRET` | uploads  | Cloudinary API secret. Never expose this to the browser.                    |
| `FRONTEND_URL`          |    no    | Allowed CORS origin(s), comma-separated. Defaults to `http://localhost:3000`. |

Generate a secret with:

```bash
openssl rand -hex 48
```

### Frontend environment

Create `frontend/.env.local` from `frontend/.env.example`.

| Variable                       | Required | Description                                                                 |
| ------------------------------ | :------: | --------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`         |  prod    | Public site origin, no trailing slash. Used for canonical, OG, sitemap URLs. |
| `NEXT_PUBLIC_API_URL`          |    no    | API origin used by the browser rewrite. Defaults to `http://localhost:5000`. |
| `API_URL`                      |  prod    | Server-only API origin. Overrides `NEXT_PUBLIC_API_URL` for server fetches.   |
| `NEXT_PUBLIC_SUPPORT_HANDLE`   |    no    | Fallback support handle. Defaults to `@blacktuftech`.                       |
| `NEXT_PUBLIC_ANALYTICS_ID`     |    no    | Optional analytics identifier. Leave empty to disable analytics entirely.     |

`NEXT_PUBLIC_*` values are embedded in the client bundle. Never put secrets there.

---

## Database seeding

`npm run seed` seeds:

- **Categories:** Business, Mobile Applications, Developer Tools.
- **Services:** Software Development, Web Development, Application Development, API & Backend
  Development, AI & Automation, UI/UX Development.
- **Products (real, verified only):**
  - **Makeable Jobs** — Active — <https://makeable-jobs.vercel.app>
  - **Vibranium Music** — Beta — Android application
  - **BTT WhatsApp Bridge** — Beta — Node.js / n8n bridge
- **Site settings:** brand names, tagline, support handle `@blacktuftech`, empty support URL,
  and public owner links.

Seed data intentionally contains no invented metrics, testimonials, clients, awards, or
certifications. Product records are the canonical content source; edit them from the admin
dashboard rather than hard-coding marketing copy.

---

## Admin dashboard

Visit `/admin` and sign in with the account created by `seed:admin`.

| Section       | What you can manage                                                        |
| ------------- | -------------------------------------------------------------------------- |
| Products      | Create/edit products, upload media, publish, feature, reorder, set status, edit SEO |
| Services      | Create/edit/hide service offerings                                        |
| Categories    | Create/edit/delete categories (deletion blocked while products use them)   |
| Messages      | Contact form submissions: search, status, reply via mailto, delete         |
| Support       | Support requests: status workflow, attachments, reply, delete              |
| Notifications | Launch signups: search, filter, copy emails, export CSV                    |
| Company       | Brand, support identity, social links, optional business information       |
| Account       | Signed-in profile and password change                                      |

Browser mutations go through the Next.js rewrite `/api/backend/*`, so the authentication cookie
stays on the frontend origin and is never readable by JavaScript (`httpOnly`).

---

## API overview

All responses use an envelope:

```json
{ "success": true, "data": {}, "message": "Optional", "errors": [] }
```

Validation failures return HTTP `422` with `{ field, message }[]` in `errors`.

### Public

| Method | Path                       | Description                                  |
| ------ | -------------------------- | -------------------------------------------- |
| GET    | `/api/health`              | Health check                                 |
| GET    | `/api/products`            | Published products (`category`, `featured`, `sort`) |
| GET    | `/api/products/:slug`      | Single published product with child records  |
| GET    | `/api/categories`          | Categories with published product counts      |
| GET    | `/api/services`            | Published services                           |
| GET    | `/api/settings`            | Public site settings                         |
| POST   | `/api/contact`             | Contact form (rate limited, honeypot)        |
| POST   | `/api/support`             | Support form with optional attachment        |
| POST   | `/api/products/:slug/notify` | Launch notification signup                 |

### Auth

| Method | Path                        | Description                          |
| ------ | --------------------------- | ------------------------------------ |
| POST   | `/api/auth/login`           | Sign in, sets HTTP-only cookie       |
| POST   | `/api/auth/logout`          | Clear the cookie                     |
| GET    | `/api/auth/me`              | Current admin profile                |
| POST   | `/api/auth/change-password` | Change password (requires session)   |

### Admin (requires authentication)

`/api/admin/stats`, `/api/admin/products` (CRUD + `/flags`), `/api/admin/categories` (CRUD),
`/api/admin/services` (CRUD), `/api/admin/messages` (list, patch status, delete),
`/api/admin/support-requests` (list, patch status, delete), `/api/admin/settings` (get/put),
`/api/admin/upload?kind=logo|banner|screenshot`, `/api/admin/notifications` (read-only).

---

## Scripts

Run from the repository root:

| Command               | Description                                            |
| --------------------- | ------------------------------------------------------ |
| `npm run dev`         | Run frontend and backend together with labelled logs   |
| `npm run dev:web`     | Run only the Next.js frontend                          |
| `npm run dev:api`     | Run only the Express API                               |
| `npm run build`       | Production build of the frontend                       |
| `npm run start`       | Start the built frontend                               |
| `npm run start:api`   | Start the backend in production mode                   |
| `npm run seed`        | Seed categories, services, products, settings          |
| `npm run seed:admin`  | Create or update the initial administrator             |
| `npm run typecheck`   | Type-check the frontend                                 |

---

## Deployment

Deploy the frontend and API separately. They can live on different providers.

### 1. API (Express + MongoDB)

Deploy `backend/` to a Node host such as Render, Railway, Fly.io, or a VPS.

- Build command: `npm install` (or `npm ci`)
- Start command: `npm start`
- Set `MONGODB_URI`, `JWT_SECRET`, `NODE_ENV=production`, `PORT` (if required by the host),
  `FRONTEND_URL=https://your-frontend-domain`, and the Cloudinary variables.
- Allow MongoDB Atlas network access for the host.
- After the first deploy, run the seed scripts once against production:
  `npm run seed` and `npm run seed:admin` (configure `ADMIN_*` first).
- Confirm `https://your-api-domain/api/health` responds.

### 2. Frontend (Next.js)

Deploy `frontend/` to Vercel or Netlify. Both support the Next.js App Router out of the box.

- Set `API_URL` and `NEXT_PUBLIC_API_URL` to the deployed API origin.
- Set `NEXT_PUBLIC_SITE_URL` to the final site origin (used for canonical and sitemap URLs).
- Add the site origin to the API's `FRONTEND_URL` list.
- The included rewrite proxies `/api/backend/*` to `${API_URL}/api/*`, which keeps admin
  requests same-origin and the HTTP-only cookie scoped to the frontend domain.
- For Cloudflare, use the OpenNext adapter or an equivalent Next.js runtime that supports
  rewrites and server rendering; a plain static export is not supported because the site uses
  server components, dynamic metadata, and cookie-based admin authentication.

### Post-deploy checklist

- [ ] `GET /api/health` returns `{ "success": true, "status": "ok" }`.
- [ ] Homepage loads and featured products render.
- [ ] `/products`, `/products/[slug]`, `/services`, `/docs`, legal pages return 200.
- [ ] `/sitemap.xml`, `/robots.txt`, and `/manifest.webmanifest` are reachable.
- [ ] Contact and support forms return success and appear in the admin inboxes.
- [ ] Admin sign-in sets `btt_admin_token` and `/admin` loads.
- [ ] Upload a test image (requires Cloudinary) and delete it afterwards.
- [ ] Set `FRONTEND_URL` correctly; unlisted origins must be rejected by CORS.

---

## Security notes

- Admin passwords are hashed with bcrypt (cost 12); plaintext passwords are never stored.
- Authentication uses a signed JWT in an `httpOnly`, `sameSite=lax` cookie that is `secure` in
  production. Tokens live for 7 days by default.
- All write endpoints validate input with Zod. Stored text is treated as plain text: markup,
  entities, and control characters are stripped before saving, and public rendering relies on
  React's escaping.
- Rate limits protect login, contact, support, launch signup, upload, and general API traffic.
- CORS only allows configured origins. `helmet` sets standard security headers.
- Cloudinary credentials exist only on the server. Never add them to `NEXT_PUBLIC_*` variables.
- `.env` files are git-ignored. Only `.env.example` files belong in version control.
- The public site does not set analytics or tracking cookies. The only essential cookie is the
  admin session cookie.
- Do not put registration numbers, certificate IDs, tax identifiers, or private addresses in
  the optional Business Information fields: that content is public.

### npm audit

A fresh install reports two moderate advisories from `nodemon` and its `minimatch` dependency.
Both are development-only tooling and never ship to production. Overriding `minimatch` breaks
nodemon's module resolution, so the advisories are accepted as tooling risk. The production
dependency tree has no high or critical advisories, and Next's bundled PostCSS is pinned to a
patched version through the root `overrides` field.

---

## Troubleshooting

- **Next.js prints "Lockfile was successfully patched" on start or build.** This happens on
  Windows with npm workspaces because npm nests the optional `@next/swc-*` platform binary under
  `node_modules/next` while Next expects it at the workspace root. Next repairs the lockfile
  automatically and the build still succeeds. Run `npm install` again if a later install complains.
- **`/admin` returns a redirect loop.** Clear the `btt_admin_token` cookie for the site, confirm
  the API is running, and sign in again. The cookie is only issued by the API.
- **The public site renders empty product or service sections.** The API is unreachable or the
  database has not been seeded. Public pages intentionally degrade to empty states instead of
  failing; run `npm run seed` and check `MONGODB_URI`.
- **Uploads fail with a 503.** Cloudinary credentials are missing from `backend/.env`.

---

## Content policy

This site publishes only verified information about BlackTuf Technologies and its products.

- No invented products, customers, testimonials, metrics, awards, certifications, revenue,
  employee counts, or partnerships.
- No private Udyam certificate details. Optional business information is limited to
  non-sensitive fields such as enterprise name, business type, major activity, and industry.
- Product links and status labels reflect what is configured in the database. Missing links are
  hidden rather than replaced with placeholders.
- The support handle `@blacktuftech` renders as plain text when no support URL is configured.

When updating content, prefer editing the database through `/admin` so every surface (cards,
navigation, search, footer, sitemap, JSON-LD) stays consistent.

---

## License

Released under the [MIT License](./LICENSE).

Copyright © 2026 BlackTuf Technologies.
