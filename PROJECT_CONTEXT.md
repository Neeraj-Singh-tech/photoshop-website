# Project Context

> Repository inspection date: 2026-09-13. This document describes the repository as found, without changing application behavior. Secret values are intentionally omitted.

## 1. Project Overview

- **Project name:** `pravin-photo-studio` (from both `package.json` files). The GitHub repository is `photoshop-website`.
- **Application:** A photography studio website for Pravin Photo Studio, with a public marketing/portfolio site and a browser-based owner dashboard for portfolio management.
- **Main use case:** Present studio services and selected photography work, provide contact/booking links, and let an authenticated owner upload, publish, edit, and delete portfolio photos.
- **Current status:** A working Next.js App Router implementation is present in the repository root. The root app has public home and gallery pages plus login/admin flows. A second nested project at `pravin-photo-studio-main/` is also tracked and is a mostly duplicated, older/different variant. No automated tests are tracked. Remote Supabase schema/policies and deployment configuration are not included.
- **Target users identifiable from code:** Public site visitors and prospective photography clients; an owner/studio administrator managing portfolio content.

The root project should be treated as the primary application because it contains the current expanded route/component set and the root `node_modules/` directory. The nested project is separately structured and has its own `package.json` and lockfile, but its intended lifecycle is **Unknown / Not found in repository**.

## 2. Technology Stack

- **Framework:** Next.js App Router. `next` is declared as `"latest"` in both manifests; the installed root environment reported Next `16.3.4` during inspection, but the repository manifest does not pin that version.
- **Language:** TypeScript with TSX/React JSX.
- **Runtime:** Node.js is required by Next.js. A required Node version is **Unknown / Not found in repository**; no `.nvmrc`, `engines` field, or equivalent was found.
- **Package manager:** npm, indicated by `package-lock.json` and npm scripts.
- **UI/CSS:** Hand-written CSS in `app/globals.css`, imported Google Fonts (`Cormorant Garamond` and `Inter`), semantic HTML, and React state/effects. No Tailwind, CSS module, component library, or icon package is configured.
- **Database/backend service:** Supabase, accessed through `@supabase/supabase-js` and `@supabase/ssr`.
- **Authentication:** Supabase email/password authentication via `signInWithPassword`, session cookies, and `getUser()` checks in the root proxy.
- **Backend/API approach:** No custom API routes, route handlers, server actions, or REST endpoints are tracked. Server components read Supabase through a helper; client components call Supabase directly for auth and admin CRUD/storage operations.
- **Hosting/deployment:** No Vercel configuration, Dockerfile, CI workflow, or hosting declaration is tracked. The `.gitignore` includes `.vercel/`, so Vercel may have been considered, but intended hosting is **Unknown / Not found in repository**.
- **External services:** Supabase database/auth/storage; Google Fonts loaded from `fonts.googleapis.com`; WhatsApp links; Instagram link; email `mailto:` link.
- **Important libraries:** `next`, `react`, `react-dom`, `@supabase/ssr`, `@supabase/supabase-js`, and TypeScript type packages. Exact locked transitive versions are in `package-lock.json`.

## 3. Project Structure

### Primary root tree

```text
.
├── app/
│   ├── page.tsx                 # Root public home page
│   ├── gallery/page.tsx         # Public portfolio gallery
│   ├── login/page.tsx           # Supabase email/password login
│   ├── admin/page.tsx           # Client-side owner portfolio dashboard
│   ├── layout.tsx               # Root metadata, global CSS, floating CTA
│   └── globals.css              # All global layout, responsive, and visual CSS
├── components/
│   ├── About.tsx
│   ├── Contact.tsx
│   ├── FloatingCTA.tsx
│   ├── Footer.tsx
│   ├── Hero.tsx
│   ├── Navbar.tsx
│   ├── Portfolio.tsx
│   ├── Services.tsx
│   └── Testimonials.tsx
├── lib/
│   ├── getPortfolio.ts          # Root public portfolio query/mock fallback
│   ├── supabase.ts              # Server-side/service helper using public key
│   └── supabase/
│       ├── client.ts            # Browser Supabase client
│       ├── server.ts             # Cookie-aware server client
│       └── proxy.ts              # Session refresh and root /admin guard
├── public/images/hero/hero.png  # Local hero image, 1672x941 PNG
├── proxy.ts                     # Next proxy entry point and matcher
├── next.config.ts               # Empty Next config object
├── tsconfig.json                # Strict TypeScript and @/* alias config
├── next-env.d.ts                # Next generated type references
├── package.json                 # Root scripts and dependencies
├── package-lock.json            # npm dependency lockfile
└── .gitignore                   # Node/Next/env/Vercel/OS exclusions
```

### Nested tracked project

`pravin-photo-studio-main/` contains a second standalone-looking Next.js project with its own `package.json`, `package-lock.json`, `next.config.ts`, `tsconfig.json`, `proxy.ts`, `app/`, `components/`, `lib/`, `public/`, and `.gitignore`. It duplicates most root files. It differs in important ways:

- No nested `/gallery` route.
- No nested `Testimonials.tsx` or `FloatingCTA.tsx`.
- Nested home/layout omit those root features.
- Nested `getPortfolio.ts` always queries Supabase and returns an empty array on error; it has no root mock-data fallback.
- Nested proxy always initializes Supabase and protects `/admin`; root proxy first checks `NEXT_PUBLIC_USE_SUPABASE`.
- The nested hero image has the same dimensions and SHA-256 as the root hero image.

There is no repository documentation identifying the nested tree as a source, backup, archived copy, or deployment target. Its role is therefore **Unknown / Not found in repository**.

## 4. Application Architecture

The root application uses Next.js App Router with a mixture of server and client components:

```text
Browser request
    |
    v
proxy.ts -> lib/supabase/proxy.ts
    |
    |-- Supabase disabled: continue
    |-- Supabase enabled: refresh cookie session; redirect unauthenticated /admin to /login
    v
Next route
    |
    |-- /, /gallery (async server pages)
    |       -> lib/getPortfolio.ts
    |       -> published portfolio rows or local mock data
    |       -> render client UI components
    |
    |-- /login (client component)
    |       -> browser Supabase signInWithPassword
    |       -> push /admin and refresh
    |
    |-- /admin (client component)
            -> browser Supabase auth/storage/table operations
            -> owner dashboard UI
```

- `app/page.tsx` and `app/gallery/page.tsx` are async server components and set `dynamic = "force-dynamic"`.
- The public pages obtain portfolio data before rendering and pass it into `Portfolio`.
- `Navbar`, `Hero`, `About`, `Services`, `Portfolio`, `Contact`, `Footer`, and `login`/`admin` use client features where needed. Components that use hooks have a `"use client"` directive.
- `app/layout.tsx` supplies metadata, global CSS, and the root-only `FloatingCTA` around route children.
- Client components communicate mainly through props and browser navigation/anchors. There is no shared React context or state store.
- Portfolio filtering is local state in `Portfolio`; admin list/count/edit state is local state in `app/admin/page.tsx`.
- `proxy.ts` applies its matcher broadly, excluding static Next assets and common image extensions. It delegates to `updateSession`.
- The root proxy only accesses Supabase when `NEXT_PUBLIC_USE_SUPABASE === "true"`. When enabled, it calls `auth.getUser()` and redirects paths beginning with `/admin` if no user is present.
- The root `lib/supabase/server.ts` provides a cookie-aware server client, but no currently inspected root page imports it. `lib/supabase.ts` is used by the root public data helper through a dynamic import.

## 5. Pages and Routes

### Root routes

| Route | Source | Purpose | Main components/data | Auth |
|---|---|---|---|---|
| `/` | `app/page.tsx` | Public studio homepage | `Navbar`, `Hero`, `About`, `Services`, `Portfolio`, `Testimonials`, `Contact`, `Footer`; reads published portfolio via `getPortfolio()` | Public |
| `/gallery` | `app/gallery/page.tsx` | Public responsive gallery grid | Reads published portfolio via `getPortfolio()`; renders raw `<img>` elements and a home link | Public |
| `/login` | `app/login/page.tsx` | Owner login form | Browser Supabase client; writes auth session through Supabase SSR client/cookies | Public entry; successful login goes to `/admin` |
| `/admin` | `app/admin/page.tsx` | Owner dashboard | Browser Supabase client; reads/writes `portfolio` and Supabase Storage bucket `portfolio`; uploads/compresses images | Root proxy protects it only when Supabase mode is enabled; admin page itself has no server-side authorization check |

No API routes, route handlers, server actions, or other endpoints are present in either tracked app tree.

### Nested routes

The nested tree implements `/`, `/login`, and `/admin` using analogous files. It does not implement `/gallery`, testimonials, or the floating CTA.

## 6. Components

- **`Navbar`** — `components/Navbar.tsx`; client component. Responsive navigation to homepage section anchors, mobile menu state, and scroll state that adds a `scrolled` class. Used on the root homepage. No props.
- **`Hero`** — `components/Hero.tsx`; client component. Local hero background presentation, scroll-driven image scale/content translation/opacity, and link to portfolio. No props.
- **`About`** — `components/About.tsx`; client component. Static studio description and intersection-observer reveal animation. No props.
- **`Services`** — `components/Services.tsx`; client component. Defines seven static service entries (Portraits, Weddings, Commercial, Pre-Wedding, Events, Fashion/Editorial, Product Photography) and reveals rows using an intersection observer. No props.
- **`Portfolio`** — `components/Portfolio.tsx`; client component. Accepts `portfolioItems` with `id`, `category`, `title`, `image_url`, `published`, and `created_at`. Filters locally by category and provides scroll-driven horizontal presentation, center-focus scaling, and progress UI. Used by root `app/page.tsx` and the nested homepage.
- **`Testimonials`** — `components/Testimonials.tsx`; root-only server-compatible component with two hardcoded testimonial records. No props.
- **`Contact`** — `components/Contact.tsx`; client component. Static email, WhatsApp, and Instagram contact links with reveal animation. No props.
- **`FloatingCTA`** — `components/FloatingCTA.tsx`; root-only server-compatible link to `#contact`, rendered by root layout on every root route. No props.
- **`Footer`** — `components/Footer.tsx`; client component. Static navigation/contact links, copyright text, and intersection-observer reveal. No props.
- **`app/login/page.tsx`** — client route component. Owns email/password form state, calls `signInWithPassword`, displays a generic error, and redirects on success.
- **`app/admin/page.tsx`** — client route component. Owns all dashboard state and Supabase CRUD/storage interactions; it is not split into reusable child components.

The nested `components/` directory contains counterparts for the shared components except root-only `FloatingCTA` and `Testimonials`. The nested versions are separate files, not imports from the root tree.

## 7. Database

- **Provider/technology:** Supabase Postgres is accessed through Supabase JS. The repository has no SQL schema or generated database types.
- **Referenced table:** `portfolio` is the only table referenced.
- **Fields determined from TypeScript/queries:** `id`, `title`, `category`, `image_url`, `published`, and `created_at`.
- **Public query:** Root `lib/getPortfolio.ts` selects all fields from `portfolio`, filters `published = true`, and orders by `created_at` descending. It returns local mock rows when Supabase is disabled or the query/import fails.
- **Nested public query:** Nested `lib/getPortfolio.ts` runs the same published/order query against Supabase and returns `[]` on error.
- **Admin read:** `app/admin/page.tsx` selects all portfolio columns and orders newest first.
- **Admin insert:** Inserts `title`, `category`, `image_url`, and `published` after uploading an image.
- **Admin update:** Updates `title` and `category`, or toggles `published`, using `.eq("id", item.id)`.
- **Admin delete:** Deletes the storage object first, then deletes the row by `id`. If storage deletion is not confirmed, it intentionally leaves the database row in place. If the database delete fails after storage deletion, the UI reports the inconsistency.
- **Storage:** Uses a Supabase Storage bucket named `portfolio`. Uploads are named with a timestamp plus the compressed file name; public URLs are obtained with `getPublicUrl`.
- **Relationships:** No relationships/foreign keys can be determined from the repository.
- **RLS/security policies:** No policies or security rules are tracked. Whether the remote table/bucket is public, which authenticated users can write, and whether RLS is enabled are **Unknown / Not found in repository**.
- **Migrations/schema:** **Unknown / Not found in repository.** No `supabase/` migrations directory or SQL files are tracked.
- **Database helper functions:** `getPortfolio()` in each tree; root `lib/supabase.ts`, `lib/supabase/client.ts`, and `lib/supabase/server.ts` provide clients.

## 8. Authentication & Authorization

- **Provider:** Supabase Auth.
- **Login:** `/login` collects email/password and calls `supabase.auth.signInWithPassword`. It shows `Invalid email or password.` for any returned error, then routes to `/admin` and refreshes on success.
- **Signup:** No signup UI or signup call is implemented.
- **Session handling:** The browser client is created with `createBrowserClient`; root server/proxy helpers use `createServerClient` and synchronize Supabase auth cookies. The proxy calls `auth.getUser()` rather than trusting a client-provided claim.
- **Protected route:** Root `lib/supabase/proxy.ts` redirects `/admin...` to `/login` when Supabase mode is enabled and no user is returned. The nested proxy always performs this check.
- **Admin roles:** The UI labels the account as `Owner`, but no role lookup, role table, email allowlist, or claims-based authorization is implemented. There is authentication, but a distinct application-level admin role is **Unknown / Not found in repository**.
- **Admin page enforcement:** The root `app/admin/page.tsx` is a client page and does not independently call `getUser()` on initial load; it relies primarily on the proxy and remote Supabase permissions. It does call `getUser()` before deletion.
- **Authorization:** Actual write authorization depends on Supabase Auth and remote database/storage policies, which are not present in the repository. Do not assume the UI alone secures CRUD operations.
- **Mode caveat:** With `NEXT_PUBLIC_USE_SUPABASE` unset or not equal to `"true"`, root proxy protection is bypassed and public pages use mock data, but the login/admin code still initializes Supabase clients and expects usable Supabase environment variables.

## 9. Environment Variables

No `.env` files are tracked. Values must not be copied into this document.

### `NEXT_PUBLIC_USE_SUPABASE`

- **Purpose:** Root feature flag. The root public portfolio helper and proxy use Supabase only when its exact value is `"true"`.
- **Where used:** `lib/getPortfolio.ts`, `lib/supabase/proxy.ts`.
- **Required/optional:** Optional for root public mock-data mode; effectively required as `"true"` for root Supabase-backed public/auth protection behavior.
- **Safe to expose publicly?:** Yes by its `NEXT_PUBLIC_` naming; it is a mode flag, not a credential.

### `NEXT_PUBLIC_SUPABASE_URL`

- **Purpose:** Supabase project URL.
- **Where used:** `lib/supabase.ts`, `lib/supabase/client.ts`, `lib/supabase/server.ts`, root `lib/supabase/proxy.ts`, and corresponding nested helpers.
- **Required/optional:** Required for Supabase client operations. Root public pages can avoid using it when Supabase mode is disabled; login/admin still expect it.
- **Safe to expose publicly?:** Yes as a Supabase project URL, subject to Supabase policy configuration; it is not a secret value.

### `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

- **Purpose:** Supabase publishable/anonymous client key used by browser, server, and proxy clients.
- **Where used:** Same Supabase helpers listed above.
- **Required/optional:** Required for Supabase client operations; root mock public mode can avoid executing some Supabase paths.
- **Safe to expose publicly?:** Yes according to the variable name and Supabase publishable-key model, but authorization must be enforced by Supabase Auth/RLS/storage policies. No service-role key is referenced.

No other environment variable references were found in the tracked application/configuration files.

## 10. Important Configuration

- **`package.json`:** Private package named `pravin-photo-studio`, version `0.1.0`; scripts are `dev: next dev`, `build: next build`, `start: next start`, and `lint: next lint`. No test script.
- **`package-lock.json`:** npm lockfiles exist at root and nested project. Root dependencies are installed locally; the nested project has no tracked/observed nested `node_modules/` directory.
- **`tsconfig.json`:** `strict: true`, `noEmit: true`, `target: ES2017`, bundler module resolution, React JSX transform, incremental compilation, Next plugin, and `@/*` mapped to `./*`. It includes all TS/TSX files and `.next` generated types, excluding `node_modules`.
- **`next.config.ts`:** Exports an empty `NextConfig` object; no images, redirects, headers, rewrites, experimental settings, or deployment settings are configured.
- **`next-env.d.ts`:** References Next and image types plus generated route/root-param declarations. The current worktree version is already modified relative to Git; this documentation task did not modify it.
- **ESLint/Prettier:** No ESLint config, Prettier config, or formatting config is tracked. `next lint` is declared but its successful operation is not established by repository configuration.
- **Tailwind:** No Tailwind configuration or dependency found.
- **Supabase configuration:** No `supabase/config.toml`, migration, schema, generated types, or policy file found. Client construction is hand-written in `lib/supabase*`.
- **Vercel:** No `vercel.json` or project configuration found. `.vercel/` is ignored.
- **CSS:** All visual styles are centralized in root/nested `app/globals.css`; root imports Google Fonts at CSS level.

## 11. Assets

- **`public/images/hero/hero.png`:** Root hero asset, a 1672x941 8-bit RGB PNG. It is used as the visual hero background by CSS/`Hero.tsx` and as both local mock portfolio image URLs in root `lib/getPortfolio.ts`.
- **Nested copy:** `pravin-photo-studio-main/public/images/hero/hero.png` is the same image by SHA-256 and dimensions.
- **Icons:** No icon package or separate icon files. UI symbols are text characters such as arrows, menu glyphs, and dashboard marks.
- **Fonts:** No local font files. `app/globals.css` imports Google Fonts `Cormorant Garamond` and `Inter`.
- **Other static files:** No additional tracked public assets were found.

## 12. Current Features

### Fully implemented in code

- Public photography studio home page with sections for about, services, portfolio, testimonials, contact, and footer.
- Root public gallery route backed by published portfolio data/mock fallback.
- Responsive navigation and mobile menu state.
- Scroll/intersection-based visual effects and portfolio category filtering.
- Supabase email/password login UI.
- Root proxy redirect for unauthenticated `/admin` requests when Supabase mode is enabled.
- Admin portfolio listing, published count/category count, title/category editing, publish toggle, logout, and deletion flow.
- Client-side image type/size validation, preview, drag-and-drop selection, resize to maximum 2400px dimension, WebP conversion at quality `0.82`, and upload to Supabase Storage.
- Contact links for email, WhatsApp, and Instagram.

### Partially implemented or dependent on external setup

- Supabase-backed portfolio/auth/admin functionality requires valid environment variables and a separately configured Supabase project.
- Database/storage security depends on remote RLS and bucket policies not included here.
- The root app supports a public mock-data mode, but the admin flow is still Supabase-dependent.
- Production deployment setup is not represented in the repository.

### Present but potentially incomplete

- Owner/admin authorization is not modeled as a separate role in application code.
- The admin page is a large client component and has no server-side mutation/API boundary.
- Delete extracts a storage path from a specific public URL format and can leave storage/database inconsistent if the second operation fails.
- Root `lib/supabase/server.ts` exists but is not visibly used by the current root route code.
- No automated tests, schema validation, error boundary, loading UI, or documented remote setup is tracked.

### Placeholder/demo functionality

- Root `lib/getPortfolio.ts` contains two local mock portfolio records, both using the hero image, when Supabase is disabled or unavailable.
- Testimonials are two hardcoded entries in `components/Testimonials.tsx`.
- Services and contact/business details are hardcoded in components.
- The admin UI displays a static `READY` website status and a static `Pravin Studio / Owner` identity label; these are presentation values, not verified status/role reads.

## 13. Known Issues / TODOs

- No application `TODO` or `FIXME` markers were found. The only TODO matches are in ignored/sample Git hook files under `.git/hooks`.
- `console.error`/`console.warn` calls are present in root and nested admin CRUD/upload/error paths and in portfolio loading helpers. These are current error-reporting behavior, not necessarily defects.
- Login and admin pages contain normal form placeholder text (`owner@example.com`, `Enter your password`, and a title placeholder).
- Root mock portfolio records use the same hero image and generated current timestamps, so mock ordering/content is demonstration data rather than a real catalog.
- No tests are tracked; regression coverage is therefore absent.
- No schema/migration/policy files are tracked, so local developers cannot verify the actual `portfolio` table or Storage permissions from this repository alone.
- The nested project duplicates source and may drift from root. Which copy should be deployed is not documented.
- The declared `next lint` command may depend on the installed Next version; repository configuration does not establish whether it remains supported.
- No explicit runtime version, deployment platform, CI, or production environment setup is documented in repository files.

## 14. Dependencies

### Production dependencies

- `next`: application framework, routing, server/client rendering, and build/runtime commands.
- `react`, `react-dom`: UI rendering and React component runtime.
- `@supabase/ssr`: cookie-aware Supabase browser/server client helpers used for auth sessions.
- `@supabase/supabase-js`: Supabase database, Auth, and Storage client used by the root direct helper and CRUD code.

### Development dependencies

- `typescript`: TypeScript compiler/tooling.
- `@types/node`: Node.js type declarations.
- `@types/react`, `@types/react-dom`: React and DOM type declarations.

Dependency versions declared in `package.json` are mostly `latest` ranges except the package version, while exact installed/locked resolutions are in each `package-lock.json`. No reliable unused-dependency determination was made; all declared runtime packages have visible imports or framework use. No test framework is declared.

## 15. Development Setup

These are the commands supported by the root `package.json`:

```bash
npm install
npm run dev
```

The development server command is `next dev`. Build and production commands are:

```bash
npm run build
npm run start
```

`npm run start` is intended after a successful `npm run build`. A declared lint command is:

```bash
npm run lint
```

Environment setup:

1. Create a local environment file such as `.env.local` (ignored by Git).
2. Define the variables listed in the Environment Variables section. Supabase-backed auth/admin requires the Supabase URL and publishable key. Set `NEXT_PUBLIC_USE_SUPABASE=true` to enable the root Supabase public query/session-proxy path.
3. Configure the remote Supabase `portfolio` table, `portfolio` Storage bucket, authentication user(s), and policies separately. Exact SQL/setup is **Unknown / Not found in repository**.

No required Node version or additional database migration command is documented by the repository. To run the nested project independently, change into `pravin-photo-studio-main/` and run its own `npm install`/scripts; it has its own manifest, but its intended status is undocumented.

## 16. Deployment

- **Intended hosting platform:** **Unknown / Not found in repository.** The app is structurally deployable as a standard Next.js app, and `.vercel/` is ignored, but no platform config confirms Vercel or another provider.
- **Build configuration:** `npm run build` invokes `next build`; no custom Next configuration exists.
- **Runtime environment:** Production needs the Supabase environment variables for auth/admin and Supabase-backed data. Public root mock mode can render without active Supabase data when the feature flag is not `true`.
- **Deployment considerations:** The remote `portfolio` table, Storage bucket/public URL behavior, Auth users, RLS, and Storage policies must already be configured. Do not expose service-role credentials; the code references only a publishable key. The deployment target must support Next.js App Router, server rendering, and the proxy entry point.
- **CI/CD:** No workflows or deployment scripts are tracked.

## 17. Git / Repository Information

- **Current branch:** `main`, tracking `origin/main`.
- **Remote:** `origin` points to `https://github.com/Neeraj-Singh-tech/photoshop-website`.
- **Observed history:** `Initial commit`, followed by `Add Photoshop website project`; current `main` is aligned with `origin/main` at inspection time.
- **Worktree state before this documentation:** `next-env.d.ts` and `package-lock.json` already had modifications. They were not reverted or changed by this task.
- **`.gitignore`:** Ignores `node_modules`, Next build output (`.next`, `out`), `.env`/local env variants, debug logs, `.vercel`, TypeScript build info, and OS files. Both root and nested projects have similar ignore files.
- **GitHub configuration:** No `.github` files/workflows were found.
- **Git hooks:** Only standard sample hooks are in the local `.git` directory; they are not repository-tracked application configuration.
- **Credentials:** No credentials are documented here. Environment files are ignored and were not inspected for values.

## 18. AI Developer Context

This is a Next.js App Router photography studio site with a public root homepage/gallery and a Supabase-backed owner portfolio dashboard. The root project is the primary/current-looking tree; `pravin-photo-studio-main/` is a separate duplicated variant and must not be silently treated as the same source.

Most important files:

- `app/page.tsx`, `app/gallery/page.tsx`, `app/login/page.tsx`, `app/admin/page.tsx`
- `components/Portfolio.tsx`, `components/Navbar.tsx`, `components/Contact.tsx`
- `lib/getPortfolio.ts`
- `lib/supabase.ts`, `lib/supabase/client.ts`, `lib/supabase/server.ts`, `lib/supabase/proxy.ts`
- `proxy.ts`, `app/globals.css`, `package.json`, `tsconfig.json`

Important conventions and dependencies:

- Use the existing `@/*` import alias and App Router structure.
- Client components are marked with `"use client"` when they use hooks/browser APIs.
- Public portfolio data is passed from async pages into `Portfolio` as props.
- Supabase table is `portfolio`; Storage bucket is also `portfolio`.
- Root public behavior intentionally supports mock data when `NEXT_PUBLIC_USE_SUPABASE` is not `true`.
- Auth is Supabase email/password; route protection is in the root proxy and depends on remote policies for actual writes.

An AI developer should **not** change the table shape, bucket name, auth/session flow, root-vs-nested project choice, or environment-variable behavior without checking the remote Supabase setup and asking when the requested change is ambiguous. Do not add secrets to source or documentation. Do not assume the static owner label is an authorization role. Do not delete the nested project or synchronize duplicated files automatically.

Areas generally safe to modify after inspecting the affected flow include isolated visual copy/styles, static section content, and client presentation behavior. Changes to `app/admin/page.tsx`, `lib/getPortfolio.ts`, proxy/session code, or Supabase CRUD/storage paths need focused validation because they affect authentication or remote data consistency.

Known limitations include absent schema/policies/tests/CI/deployment configuration, a large client-side admin component, hardcoded business/demo content, and an undocumented duplicate project tree.

## 19. Recommended Development Workflow

1. **Understand the request:** Determine whether it targets the root app or the nested duplicate. Trace the route from `app/` through its imported components, then identify whether data/auth/storage is involved.
2. **Inspect first:** Start with the relevant route file, `app/layout.tsx`, `app/globals.css`, the directly used component, `lib/getPortfolio.ts`, and Supabase/proxy helpers for protected or data-backed work. Check both `package.json` and `tsconfig.json` before adding dependencies or routes.
3. **Preserve contracts:** Keep the `portfolio` fields, `portfolio` Storage bucket, environment variable names, Supabase cookie handling, and `@/*` alias unchanged unless the task explicitly requires a migration and remote setup plan.
4. **Test changes:** Run the narrowest supported check first, then `npm run build`. Exercise public `/`, `/gallery`, `/login`, and protected `/admin` behavior when Supabase environment/project access is available. Verify upload, publish/unpublish, edit, and delete behavior against a safe test record rather than assuming mocks cover admin code.
5. **Authentication/database safety:** Never rely on UI visibility as authorization. Confirm proxy behavior and remote RLS/Storage policies. For upload/delete changes, consider partial failure between Storage and the database.
6. **Production verification:** Run `npm run build`, then `npm run start` in a production-like environment with the intended environment variables. Confirm the deployment target supports the Next proxy/App Router behavior and verify public image URLs and Supabase policies.
7. **Repository hygiene:** Keep `PROJECT_CONTEXT.md` and application changes separate in review; do not commit `.env` files, build output, credentials, or unrelated pre-existing worktree changes.

## 20. Final Project Summary

Pravin Photo Studio is a Next.js/React/TypeScript photography website. The root app uses App Router server pages for the public homepage/gallery and client components for animated presentation, login, and an owner portfolio dashboard. Supabase provides authentication, the `portfolio` table, and the `portfolio` Storage bucket; root public pages can fall back to two local mock records when Supabase mode is disabled.

Major implemented features are the marketing homepage, services/about/contact sections, category-filtered portfolio presentation, gallery, email/password login, and admin upload/edit/publish/delete controls. Major limitations are missing schema/RLS/deployment documentation, no tests or CI, hardcoded/demo content, client-side admin mutations, and an undocumented duplicate nested project with behavior differences.

Before modifying the project, inspect the root route/component and Supabase/proxy path involved, confirm whether the request applies to the nested copy, preserve environment/auth/database contracts, and validate with the supported build/runtime commands. Most changes should start in `app/`, `components/`, or `app/globals.css`; data/auth changes require special care in `lib/`, `proxy.ts`, and `app/admin/page.tsx`.
