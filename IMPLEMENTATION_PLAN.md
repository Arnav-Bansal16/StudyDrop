# StudyDrop P0 Implementation Plan

## 1. Scope and confirmed product rules

This plan covers only the P0 features in `PROJECT_BRIEF.md`. P1 features and explicit non-goals remain deferred. StudyDrop will be one Next.js application backed by Supabase and deployed on Vercel; there will be no separate backend server, background worker, realtime subsystem, map integration, or AI feature.

The repository currently contains only planning files, so Phase 1 starts from a greenfield application scaffold. The product owner resolved the P0 behavior decisions on September 7, 2026. They are authoritative in this plan and recorded in `PROJECT_BRIEF.md`.

## 2. Recommended architecture

### Runtime and packages

- Node.js 22 LTS.
- npm with a committed `package-lock.json` for the simplest beginner workflow.
- Next.js 16 App Router, React 19, TypeScript 5 in strict mode, Tailwind CSS 4.
- shadcn/ui CLI v4, `new-york` style, Radix primitives, CSS-variable theme tokens, Geist Sans/Mono, and a light-first responsive visual design appropriate for a student utility.
- Supabase Postgres, Auth, Data API, `@supabase/supabase-js` v2, and `@supabase/ssr`. Pin exact dependency versions when the scaffold is created; do not use floating versions in the committed manifest.
- Zod for shared form/query validation.
- Vitest for pure unit tests, React Testing Library only for interactive client components that contain meaningful behavior, Playwright for browser E2E, and pgTAP through `supabase test db` for schema/RLS/database-function tests.
- Default Next.js Node runtime. Do not opt into Edge runtime without a measured need.

Before installing packages, verify the then-current stable versions and migration notes. Supabase's SSR package is still documented as beta, so isolate its setup behind three small utilities and pin its version.

### Application shape

Use Server Components for initial reads, Server Actions for browser-initiated mutations, and a single Route Handler for the Supabase email-confirmation callback. Do not build an internal REST API for the app. Client Components should be limited to interactive forms, filter controls, dialogs, toasts, and mobile navigation.

Use `src/` and route groups to keep URL design simple:

```text
src/
  app/
    (marketing)/
      page.tsx                         # /
    (auth)/
      login/page.tsx                   # /login
      signup/page.tsx                  # /signup
    auth/confirm/route.ts              # Supabase PKCE confirmation callback
    (app)/
      sessions/page.tsx                # /sessions
      sessions/new/page.tsx            # /sessions/new
      sessions/[id]/page.tsx           # /sessions/:id (public/canonical)
      sessions/[id]/edit/page.tsx      # /sessions/:id/edit
      s/[token]/page.tsx               # /s/:token (unlisted bearer link)
      dashboard/page.tsx               # /dashboard?view=hosted|joined|past
      layout.tsx
      loading.tsx
      error.tsx
    not-found.tsx
    global-error.tsx
    layout.tsx
  components/
    ui/                                # shadcn-owned component source
    site/                              # header, footer, mobile nav
    sessions/                          # cards, filters, form, status, actions
    auth/
  lib/
    actions/                           # server actions grouped by domain
    data/                              # server-only read functions
    supabase/client.ts                 # browser client
    supabase/server.ts                 # cookie-backed server client
    supabase/proxy.ts                  # token refresh helper
    session-status.ts                  # pure derived-state rules
    validation/                        # shared Zod schemas/constants
    dates.ts                           # UTC/Cal Poly-local conversions
    database.types.ts                  # generated Supabase types
  proxy.ts                             # refresh auth; protect only private UX routes
supabase/
  config.toml
  migrations/
  seed.sql
  tests/database/
tests/
  unit/
  e2e/
```

Authorization must never depend only on `proxy.ts` or a redirect. The database remains authoritative through RLS and narrowly granted functions. Server Actions re-check identity and return structured field/form errors. Redirects occur outside action `try/catch` blocks.

### Routes and access

| Route                 | Signed-out                    | Signed-in                                 | Purpose                                                                 |
| --------------------- | ----------------------------- | ----------------------------------------- | ----------------------------------------------------------------------- |
| `/`                   | Yes                           | Yes                                       | Landing page and calls to action                                        |
| `/sessions`           | Yes                           | Yes                                       | Browse only upcoming public sessions; URL query parameters hold filters |
| `/sessions/[id]`      | Public sessions only          | Public, hosted, or joined sessions        | Canonical public/detail route                                           |
| `/s/[token]`          | Anyone possessing token       | Anyone possessing token                   | Non-enumerable unlisted detail route                                    |
| `/sessions/new`       | Redirect to `/login?next=...` | Yes                                       | Create session                                                          |
| `/sessions/[id]/edit` | Redirect to login             | Host only                                 | Edit session                                                            |
| `/dashboard`          | Redirect to login             | Current user's data only                  | Hosted, joined, and past views                                          |
| `/login`, `/signup`   | Yes                           | Redirect authenticated users to dashboard | Email/password auth                                                     |
| `/auth/confirm`       | Yes                           | Yes                                       | Exchange PKCE code, then use a validated same-origin `next` path        |

Use search parameters for browse state: `q`, `date` (`YYYY-MM-DD` in `America/Los_Angeles`), `purpose`, and `style`. Invalid values should be ignored or normalized to safe defaults, never passed unchecked to a query.

### Data model

All timestamps use `timestamptz` and are stored in UTC. UUIDs are generated by Postgres. Text fields use `text` plus explicit length/check constraints. Every foreign-key column and every RLS predicate column is indexed.

#### `profiles`

| Column                   | Rule                                                       |
| ------------------------ | ---------------------------------------------------------- |
| `id uuid`                | Primary key and FK to `auth.users(id)` with cascade delete |
| `display_name text`      | Required, trimmed, 2–50 characters                         |
| `created_at timestamptz` | Required, default `now()`                                  |
| `updated_at timestamptz` | Required, maintained by trigger                            |

A private trigger creates the profile from signup metadata. Metadata is used only to populate the name, never for authorization.

#### `courses`

| Column                                   | Rule                                 |
| ---------------------------------------- | ------------------------------------ |
| `id bigint generated always as identity` | Primary key                          |
| `subject text`                           | Uppercase department code            |
| `catalog_number text`                    | Course number, kept as text          |
| `title text`                             | Display title                        |
| `catalog_year text`                      | Academic catalog snapshot identifier |

Unique constraint on `(subject, catalog_number)`. P0 course rows are read-only reference data containing every course in a reviewed static snapshot of Cal Poly's official 2026–2028 Academic Catalog. The UI uses a searchable dropdown (shadcn `Popover` + `Command`) and does not load thousands of raw options into a native select. There is no runtime scraping, schedule/section import, or per-course behavior.

#### `study_sessions`

| Column                                 | Rule                                                                                           |
| -------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `id uuid`                              | Primary key, default `gen_random_uuid()`                                                       |
| `host_id uuid`                         | Required FK to `profiles(id)`                                                                  |
| `course_id bigint`                     | Required FK to `courses(id)`                                                                   |
| `topic text`                           | Required, trimmed, 5–120 characters                                                            |
| `purpose text`                         | Required: `homework`, `exam_review`, `project_work`, `concept_questions`, or `quiet_coworking` |
| `collaboration_style text`             | Required: `collaborative`, `focused`, or `peer_teaching`                                       |
| `meeting_mode text`                    | `in_person` or `online`                                                                        |
| `location_label text`                  | Required, safe human-readable place/platform; no maps                                          |
| `meeting_instructions text`            | Optional, maximum 1,000 characters                                                             |
| `organizer_notes text`                 | Optional, maximum 2,000 characters                                                             |
| `starts_at`, `ends_at timestamptz`     | Required; end after start                                                                      |
| `capacity smallint`                    | Required, range 2–20 total people including the organizer                                      |
| `participant_count smallint`           | Required, default 0; maintained only by database functions                                     |
| `visibility text`                      | `public` or `unlisted`                                                                         |
| `share_token uuid`                     | Required, unique, default random; bearer credential for unlisted links                         |
| `cancelled_at timestamptz`             | Null until cancelled; cancellation is not deletion                                             |
| `created_at`, `updated_at timestamptz` | Required; `updated_at` maintained by trigger                                                   |

Recommended indexes:

- `(visibility, starts_at)` with a partial predicate `cancelled_at is null` for browse.
- `(course_id, starts_at)` with `cancelled_at is null` for course/date filters.
- `(purpose, starts_at)` and `(collaboration_style, starts_at)` only if query plans show the browse queries need them; avoid speculative indexes in the first migration.
- `(host_id, starts_at desc)` for the hosted dashboard.
- Unique index on `share_token`.

#### `session_participants`

| Column                  | Rule                                           |
| ----------------------- | ---------------------------------------------- |
| `session_id uuid`       | FK to `study_sessions(id)` with cascade delete |
| `user_id uuid`          | FK to `profiles(id)` with cascade delete       |
| `joined_at timestamptz` | Required, default `now()`                      |

Composite primary key `(session_id, user_id)` prevents duplicate joins. Add `(user_id, joined_at desc)` for the joined dashboard. The host is not stored as a participant. Capacity counts the host, so a capacity of 4 allows 3 rows here.

### Session status and allowed transitions

Do not store a general status column because most statuses are derived from time and occupancy. Store only the irreversible cancellation fact (`cancelled_at`). A single shared pure function should derive presentation state, and equivalent predicates must be enforced in database mutation functions.

Display priority, evaluated top to bottom:

1. `cancelled`: `cancelled_at is not null`.
2. `ended`: not cancelled and `now >= ends_at`.
3. `in_progress`: not cancelled and `starts_at <= now < ends_at`.
4. `full`: future session and `1 + participant_count >= capacity`.
5. `starting_soon`: future session and `starts_at <= now + 60 minutes`.
6. `upcoming`: future session not matching the above.

`full` is also retained as a capacity flag even if another lifecycle badge takes display precedence. Browse includes only public, non-cancelled sessions with `starts_at > now`; cancelled and past sessions remain reachable where authorization permits and appear in dashboard history.

Action rules:

- Create: authenticated user; start must be at least 15 minutes in the future; duration 30 minutes–6 hours.
- Edit: host only, not cancelled, and strictly before `starts_at`. All fields freeze at the scheduled start. Capacity cannot fall below current occupancy.
- Cancel: host only, not already cancelled or ended. Cancellation remains allowed while in progress, is idempotent, and preserves participants/history.
- Join: authenticated non-host, not already joined, non-cancelled, below capacity, before `ends_at`, and strictly before `starts_at + 15 minutes`.
- Leave: joined user, non-cancelled, before `ends_at`, and strictly before `starts_at + 15 minutes`.
- No hard delete is exposed in P0.

Join and leave must execute in database transactions that lock the session row, validate status/visibility/capacity, mutate `session_participants`, and update `participant_count` atomically. Capacity-changing edits must use the same row lock. This prevents two users taking the last seat simultaneously.

### Authentication flow

Use email/password only. Signup collects display name, email, password, and password confirmation. Only an address whose lowercased exact domain after the final `@` is `calpoly.edu` may register; lookalikes such as `user@evilcalpoly.edu` must fail. Enforce this in three layers: immediate Zod feedback, the signup Server Action, and a Supabase Postgres **Before User Created** Auth Hook. The hook is authoritative even for direct Auth API requests, returns a safe domain-specific error, grants execution only to `supabase_auth_admin`, and is configured in both local `config.toml` and the hosted project. Email confirmation remains enabled to prove ownership.

Supabase Auth uses PKCE for SSR. The confirmation link returns to `/auth/confirm`, exchanges the code, and redirects to a validated relative `next` destination or `/dashboard`.

Use cookie-backed browser/server clients from `@supabase/ssr` and a root `proxy.ts` to refresh tokens. Protect pages and actions with `supabase.auth.getClaims()` (or `getUser()` where a fresh user record is actually needed); never trust `getSession()` as authorization evidence on the server. Logout is a Server Action that signs out and returns to `/`.

Production email confirmation requires custom SMTP because Supabase's built-in sender is best-effort and rate-limited. Local confirmation testing uses Supabase CLI Mailpit. Password reset is not listed in P0 and must not be added unless the owner explicitly changes scope.

### RLS and database privilege model

Enable RLS on every `public` table and write explicit grants in the same migration because current Supabase projects do not necessarily expose new tables to the Data API automatically.

| Resource               | `anon`                                                           | `authenticated`                                                                                                                   |
| ---------------------- | ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `courses`              | Select                                                           | Select                                                                                                                            |
| `profiles`             | Select only `id` and `display_name` through column grants        | Select only safe display fields; no profile-edit UI in P0                                                                         |
| `study_sessions`       | Select safe columns from public rows; never select `share_token` | Select public rows plus rows hosted or joined by self; insert only caller-controlled creation columns with `host_id = auth.uid()` |
| `session_participants` | No table access                                                  | Select own membership only; no direct insert/update/delete and no participant roster in P0                                        |

Use column-level grants so browser roles cannot set generated/protected fields such as `participant_count`, `share_token`, `cancelled_at`, or audit timestamps during insert. Do not grant direct update/delete on `study_sessions` or direct writes on `session_participants`. Expose narrowly scoped Postgres functions for `update_study_session`, `cancel_study_session`, `join_study_session`, and `leave_study_session`. Each function must:

- Be executable only by the minimum role (`authenticated`, except the safe unlisted read function).
- Set an empty `search_path`, schema-qualify every object, validate `(select auth.uid())`, and never accept a caller-supplied user ID.
- Lock the target row when occupancy or capacity can change.
- Return a small typed result or raise a mapped domain error.
- Revoke default `PUBLIC` execution and receive explicit grants.
- Have pgTAP allow/deny, ownership, and concurrency-adjacent tests.

Ordinary public RLS must expose only `visibility = 'public'`. Unlisted lookup uses `get_unlisted_session_by_token(token uuid)`, callable by `anon` and `authenticated`, returning a deliberately limited projection for exactly one matching token. The UUID token is the bearer secret; it is never included in browse results, application log messages, analytics payloads, or public canonical links. Hosting-provider access logs may necessarily contain requested URL paths and must remain access-controlled. Regenerating/revoking links is not P0.

No service-role/secret key belongs in the browser or routine app data path. If a secret key is needed for a one-time production seed script, keep it outside `NEXT_PUBLIC_*`, never commit it, and do not ship that script as an app endpoint.

### Public versus unlisted behavior

- Public sessions appear in `/sessions`, are searchable/filterable, and use `/sessions/[id]` as their shareable route.
- Unlisted sessions never appear in browse/search or public database selects. Their share URL is `/s/[share_token]`.
- Anyone with a public or unlisted session link may view the organizer notes and meeting instructions. Joining still requires login. Login preserves the full same-origin return path, including the token.
- Hosts see both public and unlisted sessions on their dashboard. Joined users see unlisted sessions they joined through normal authenticated RLS.
- A guessed session UUID must not reveal an unlisted session at `/sessions/[id]` or through the Data API.
- Cancelled public and unlisted links remain accessible and show a cancelled state.

### Validation approach

Use one set of Zod schemas/constants for forms and search parameters, with thin adapters for `FormData`. Validate on the server for every mutation; client validation is only an early usability aid. Normalize whitespace, require the exact lowercased `calpoly.edu` email domain, uppercase course search, validate UUIDs, reject open redirects, and render field-level messages.

Mirror critical invariants in Postgres: nonempty/length checks, enum-like text checks, capacity range, `ends_at > starts_at`, unique membership, unique share token, foreign keys, and privilege/RLS policies. Time-sensitive and cross-row rules belong in the atomic database functions, not only Zod. Map expected database errors to friendly messages; log unexpected errors server-side without tokens, URLs containing tokens, or personal data.

Use `America/Los_Angeles` only for input interpretation, display, and date filtering. Convert local form values to UTC before persistence and test daylight-saving boundaries.

### Seed-data approach

- Reference-data migration/import: load a reviewed static snapshot of every course in Cal Poly's official 2026–2028 Academic Catalog from a committed, reproducible data artifact. Record the source URL and snapshot date in repository documentation. Do not scrape at runtime, import schedules/sections, or add course-specific application logic.
- `supabase/seed.sql`: deterministic local-only users/profiles and sessions spanning upcoming, starting-soon, full, in-progress, cancelled, ended, public, and unlisted cases. Use fixed IDs and timestamps relative to seed execution so tests do not rot.
- E2E setup: create isolated test users through local Supabase Auth, seed owned/joined sessions, and clean/reset the local database between suites.
- Production: load the same versioned full course-catalog snapshot through the reviewed release process. Create one clearly labeled `@calpoly.edu` demo account through Supabase Auth and run an idempotent, documented one-time seed command if demo sessions are desired. Never copy local credentials or auth-table SQL into production.

### Testing strategy

- Unit: status precedence, time boundaries, timezone conversion, Zod rules, safe redirect validation, filter normalization.
- Database and pgTAP: tables, constraints, indexes, grants, RLS allow/deny matrix, exact-domain Auth Hook, unlisted non-enumerability, RPC authorization, duplicate join, host join rejection, last-seat behavior, capacity-lowering rejection, and cancellation/history.
- Component: only interactive filter/form/action components where unit coverage adds value.
- Playwright: anonymous browse, filters, signup confirmation in local Mailpit-compatible flow, login/logout, create/edit/cancel, public/unlisted access, join/leave, full-state behavior, dashboard grouping, mobile viewport, and error/empty states.
- Static/build: formatting check, ESLint, `tsc --noEmit`, unit tests, database tests, E2E smoke, and `next build`.
- Prefer E2E tests over shallow tests for async Server Components, in line with Next.js guidance.

### Deployment sequence

1. Create separate local, preview, and production Supabase environments/projects where practical; never point routine local/E2E tests at production.
2. Link the GitHub repository to Vercel. Use Git integration: non-`main` pushes produce preview deployments and `main` is the production branch.
3. Configure Development, Preview, and Production `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` values separately. Add no service-role key to the app unless a tightly scoped server-only need is reviewed.
4. Apply versioned Supabase migrations to the preview database, load preview demo data, generate database types, and run database advisors.
5. Run lint, typecheck, unit, pgTAP, build, and Playwright locally; then validate the Vercel preview with the complete P0 checklist.
6. Configure Supabase Site URL/redirect allow-list for preview and production URLs, and configure production SMTP before testing signup confirmation.
7. Back up/confirm rollback posture, apply the same reviewed migrations to production, then deploy/promote the already-tested application artifact.
8. Run production smoke checks with two non-owner accounts, inspect Vercel/Supabase errors, verify no secret or unlisted token leakage, and only then record the submission URL.

For this small hackathon app, use Vercel's built-in Git deployments rather than adding a custom CI deployment pipeline in P0. GitHub Actions may run checks, but Vercel should own preview/production deploys.

## 3. Implementation phases

### Phase 1 — Application foundation and public shell

**Objective**

Scaffold the pinned Next.js stack and establish the design system, responsive navigation, route skeletons, and polished landing page without connecting product behavior yet.

**User-visible result**

Visitors can open a responsive StudyDrop landing page, understand the product, and navigate to browse, login, and signup placeholders. Global 404 and failure surfaces match the product visual language.

**Files or systems likely affected**

- `package.json`, lockfile, TypeScript/Next/Tailwind/ESLint config.
- `src/app/layout.tsx`, marketing route, global styles, metadata, not-found/global-error files.
- `src/components/ui`, `src/components/site`, `components.json`.
- Test runner and Playwright configuration.

**Dependencies on previous phases**

None. No further product decision blocks this phase.

**Acceptance criteria**

- Stack matches the architecture above and dependency versions are pinned.
- Landing page explains course-specific, soon-happening sessions and public/unlisted sharing without promising P1 features.
- Header/mobile navigation and primary calls to action are keyboard accessible.
- Design tokens, typography, spacing, focus states, and responsive breakpoints are consistent.
- No secrets, database calls, fake working controls, or P1 UI are introduced.

**Automated checks**

- Install from lockfile succeeds.
- Formatting, ESLint, `tsc --noEmit`, and `next build` pass.
- Basic Playwright smoke verifies `/`, metadata/title, primary links, and 404.

**Manual browser checks**

- Inspect 375 px, 768 px, and desktop widths.
- Navigate all controls with keyboard and confirm visible focus.
- Check light-mode contrast, typography, hover states, no horizontal overflow, and no console errors.

**Likely failure modes**

- shadcn initialization overwrites Tailwind/Geist variables or creates circular font tokens.
- Too much content or decorative UI obscures the primary action.
- Route placeholders imply functionality that is not yet implemented.
- Mobile navigation traps focus or overflows.

### Phase 2 — Supabase schema, auth, privileges, and RLS foundation

**Objective**

Create the reproducible local database schema, generated types, cookie-based auth flow, explicit grants, and baseline RLS before feature queries depend on them.

**User-visible result**

A user can sign up, confirm locally, log in, remain signed in across navigation, reach a protected dashboard shell, log out, and see useful auth errors.

**Files or systems likely affected**

- `supabase/config.toml`, migrations, `seed.sql`, pgTAP tests.
- `src/lib/supabase/*`, generated `database.types.ts`, root `proxy.ts`.
- `/login`, `/signup`, `/auth/confirm`, protected layout/dashboard shell.
- Environment examples and setup documentation.

**Dependencies on previous phases**

- Phase 1 application shell and components.
- Access to configure the hosted Supabase Auth Hook and production email confirmation/SMTP.
- The static course artifact prepared from the official 2026–2028 Cal Poly Academic Catalog.

**Acceptance criteria**

- Fresh `supabase db reset` produces all tables, constraints, indexes, triggers, functions, grants, and seed data.
- The Before User Created hook rejects every non-`calpoly.edu` address, including direct Auth API requests, while accepting case-insensitive exact-domain matches.
- Signup creates exactly one matching profile without using user metadata for authorization.
- SSR cookies refresh correctly; protected routes redirect signed-out users with a safe return path.
- Every exposed table has RLS, explicit grants, operation-specific policies, and tests.
- Publishable keys are used in clients; no secret/service-role key is shipped to the browser.

**Automated checks**

- Supabase migration/reset and generated-type drift check.
- `supabase test db` for schema, grants, RLS allow/deny matrix, and profile trigger.
- Unit tests for safe redirects, auth-form validation, and exact email-domain parsing.
- Database/Auth integration tests for allowed, lookalike, missing, and non-Cal-Poly email domains through the direct signup API.
- Playwright signup/login/logout/protected-route flow against local Supabase.
- Lint, typecheck, and production build.

**Manual browser checks**

- Test wrong password, duplicate email, non-Cal-Poly and lookalike domains, weak password, expired/invalid confirmation link, refresh while logged in, logout, and back-button behavior.
- Confirm auth pages work on mobile and show field/form errors without losing typed email/name.
- Inspect cookies and network output for accidental secret exposure.

**Likely failure modes**

- Redirect URL mismatch breaks confirmation on preview/production.
- Proxy refresh logic loops or trusts unverified session data.
- New Supabase tables lack explicit Data API grants despite correct RLS.
- Profile trigger fails because metadata is missing or malformed.
- Supabase default SMTP rate limiting makes demo signup unreliable.

### Phase 3 — Public discovery, detail pages, visibility, and derived states

**Objective**

Deliver read-only session discovery with course/date/purpose/style filters, public details, secure unlisted-link details, and deterministic status presentation.

**User-visible result**

Visitors can browse upcoming public sessions, combine filters, open details, understand availability/status, and open a valid unlisted link without that session appearing in browse.

**Files or systems likely affected**

- `/sessions`, `/sessions/[id]`, `/s/[token]` pages plus loading/error/not-found files.
- Server-only data/query modules, filter validation, date/status helpers.
- Session cards, filter bar/mobile sheet, badges, detail layout, skeleton/empty/error components.
- Read policies and safe unlisted lookup database function/tests.

**Dependencies on previous phases**

- Phase 2 schema, seed states, RLS, and generated types.

**Acceptance criteria**

- Browse returns only future, non-cancelled, public sessions ordered by start time.
- Search matches course subject/number/title; all four filters work alone and together and are encoded in the URL.
- Status rules and seat counts are identical on cards and details.
- Starting Soon begins exactly 60 minutes before `starts_at`.
- Organizer notes and meeting instructions appear to anyone who can view the public or unlisted detail link.
- Unlisted sessions are absent from browse and regular anonymous selects but resolve through the exact token route.
- Unknown IDs/tokens render 404; expected empty states and retryable errors are designed.
- Queries select only required fields and use expected indexes.

**Automated checks**

- Unit boundary tests for every status, date filter, timezone/DST, and filter parser.
- pgTAP tests for public/unlisted reads, token lookup, grants, and non-enumerability.
- Playwright coverage for combined filters, URL restoration, public detail, valid/invalid unlisted links, empty/loading/error states.
- Query-plan spot checks for browse and dashboard-shaped indexes on representative seed volume.

**Manual browser checks**

- Exercise filters on desktop and mobile; refresh/share a filtered URL.
- Compare labels around starting, start, and end boundaries.
- Try accessing an unlisted UUID through the public canonical route and confirm no data leaks.
- Check long titles, locations, notes, and zero-result layouts for clipping.

**Likely failure modes**

- Server and client clocks/timezones produce different states or hydration warnings.
- Unlisted rows leak through a permissive select policy or nested relationship.
- Search parameters create invalid queries or reset unexpectedly.
- Count and full badge become inconsistent.
- Date filtering treats UTC midnight as local midnight.

### Phase 4 — Host creation, editing, and cancellation

**Objective**

Implement the complete host lifecycle using shared validation, server actions, ownership enforcement, and atomic capacity-safe edits.

**User-visible result**

An authenticated user can create a public or unlisted session, edit allowed fields, copy the correct share URL, and cancel with confirmation. Non-hosts cannot modify it.

**Files or systems likely affected**

- `/sessions/new`, `/sessions/[id]/edit`, session detail host actions.
- Shared session form, date/time inputs, visibility control, alerts/dialogs/toasts.
- Server Actions, Zod schemas, session mutation functions, RLS/privilege tests.
- Database RPCs for update/cancel and any capacity validation trigger/function.

**Dependencies on previous phases**

- Phase 2 auth/security and Phase 3 read/detail/status capabilities.

**Acceptance criteria**

- Valid create redirects to the correct public or unlisted detail URL.
- Course selection uses a keyboard-accessible searchable dropdown backed by the complete 2026–2028 catalog snapshot.
- Invalid input produces accessible field-level errors and preserves non-sensitive entries.
- Host can edit an eligible session; capacity cannot be set below occupancy.
- Every field becomes read-only exactly at `starts_at`.
- Cancel uses an `AlertDialog`, is idempotent, preserves history, and immediately blocks joining.
- Non-host and signed-out mutation attempts fail at both app and database layers.
- Unlisted token is not rotated by ordinary edits and never appears in public browse data.

**Automated checks**

- Unit tests for every create/edit field and cross-field time/location rule.
- pgTAP tests for owner/non-owner create/update/cancel, immutable protected columns, capacity floor, and cancelled/ended restrictions.
- Playwright host flow for public and unlisted create, edit, validation, share link, cancel, and authorization denial.
- Lint, typecheck, and build.

**Manual browser checks**

- Complete forms with keyboard and mobile date/time controls.
- Test slow/double submissions and confirm only one session/mutation occurs.
- Verify cancel confirmation/copy, cancelled detail state, and browser back/refresh.
- Inspect long validation messages and server-failure recovery.

**Likely failure modes**

- Local datetime converts to the wrong UTC instant.
- Duplicate submissions create duplicate sessions.
- Direct Data API update bypasses protected-column expectations.
- Redirect after create loses an unlisted token.
- Concurrent join and capacity reduction overbook the session.

### Phase 5 — Join, leave, and atomic capacity enforcement

**Objective**

Implement authenticated participation with race-safe last-seat enforcement and clear action availability across every session state.

**User-visible result**

Eligible users can join and leave, see seat counts update, receive a useful full/closed message, and cannot overbook or join as the host.

**Files or systems likely affected**

- Detail-page action panel and authentication return flow.
- Join/leave Server Actions and database functions.
- `session_participants`, `participant_count`, RLS/grants, database tests.
- Status/card invalidation and revalidation behavior.

**Dependencies on previous phases**

- Phase 3 details/status and Phase 4 authoritative session mutations.

**Acceptance criteria**

- Join is allowed only under the documented identity, visibility, lifecycle, and capacity rules.
- Capacity includes the organizer, and join/leave close exactly 15 minutes after `starts_at` or at `ends_at`, whichever comes first.
- Duplicate joins and host self-joins are harmless, understandable failures.
- Leave is allowed only to the joined user under the documented time rules.
- Exactly one of two concurrent users receives the final seat; count and membership remain consistent.
- Login from a public or unlisted detail returns to that exact safe URL.
- Cards/details revalidate after actions and show accurate count/status.

**Automated checks**

- pgTAP function tests for allow/deny cases, duplicate operations, cancellation, time boundaries, and count invariants.
- Database integration test launches concurrent last-seat attempts and asserts one success, one full response, and no counter drift.
- Playwright tests join/leave, login return, full-state UI, host/non-host controls, and double-click behavior.
- Unit test maps database domain errors to user-facing messages.

**Manual browser checks**

- Use two browsers/accounts to take the last seat and verify the loser sees a recoverable message.
- Refresh/browse-back after join and leave; verify all pages agree.
- Check disabled/loading button states and keyboard/screen-reader announcements.
- Test public and unlisted sessions separately.

**Likely failure modes**

- Check-then-insert outside a row lock permits overbooking.
- Participant counter drifts after duplicate/retried requests.
- Stale cached reads show an available seat after it is taken.
- Auth return sanitization drops the token or allows an open redirect.
- Overly broad function grants permit caller-supplied identity or direct writes.

### Phase 6 — Dashboard and complete resilient UX

**Objective**

Complete hosted, joined, and past organization and systematically finish loading, empty, error, responsive, and accessibility states across P0.

**User-visible result**

Signed-in users have one reliable dashboard for active hosted sessions, active joined sessions, and past/cancelled history, with context-appropriate actions and polished behavior at all screen sizes. Active includes future and in-progress sessions until `ends_at`.

**Files or systems likely affected**

- `/dashboard` page and query-param view selection.
- Dashboard queries/cards/tabs and shared state/empty/error components.
- Loading/error boundaries across app route segments.
- Responsive and accessibility styling/components.
- Dashboard query indexes if proven necessary.

**Dependencies on previous phases**

- Phases 2–5 provide all dashboard data and actions.

**Acceptance criteria**

- Hosted, joined, and past views are mutually understandable and never leak another user's private/unlisted data.
- Hosted and Joined include non-cancelled future and in-progress sessions until `ends_at`; Past includes ended and cancelled sessions with explicit badges.
- No participant roster is exposed; every surface shows occupancy counts only.
- Empty, loading, expected error, unexpected error, 404, disabled, and success states exist for every P0 flow.
- UI is usable at 320 px minimum width through desktop, with no horizontal page scrolling.
- Forms, dialogs, tabs, alerts, and status changes meet keyboard and accessible-name expectations.

**Automated checks**

- RLS tests for dashboard ownership/membership isolation.
- Unit tests for dashboard grouping and status precedence.
- Playwright tests all dashboard views/actions, empty states, direct URL views, unauthorized data access, and 375 px mobile flow.
- Automated accessibility scan on landing, browse, detail, auth, form, and dashboard critical pages.

**Manual browser checks**

- Complete the full lifecycle at mobile and desktop sizes.
- Test slow network/offline and a forced server error for recovery affordances.
- Use keyboard-only navigation and a screen reader spot check for labels, errors, dialogs, and status announcements.
- Verify long content and zoom to 200% do not hide actions.

**Likely failure modes**

- A session appears in multiple dashboard views without clear rules.
- Joined unlisted sessions disappear because ordinary RLS does not account for membership.
- Route-level errors replace navigation or lack retry behavior.
- Mobile tables/cards overflow or dialogs are unusable.
- Loading UI causes layout shift or action flicker.

### Phase 7 — Release verification and public deployment

**Objective**

Prove the full P0 journey in production-like conditions, deploy the reviewed artifact publicly, and establish a repeatable rollback/smoke process for the submission.

**User-visible result**

StudyDrop is publicly reachable on Vercel, auth email links return correctly, seeded/demo flows work, and the complete P0 checklist passes without P1 placeholders.

**Files or systems likely affected**

- GitHub checks, Vercel project/environment settings, Supabase preview/production settings.
- Setup/deployment documentation and environment example.
- Final Playwright configuration and smoke suite.
- Migrations/seed scripts only if release rehearsal finds defects.

**Dependencies on previous phases**

- All prior phases complete and green.
- Production Supabase project, SMTP configuration/credentials, Vercel/GitHub access, final domain/URL, and—if demo data is used—an eligible `@calpoly.edu` demo account.

**Acceptance criteria**

- Every item in `TEST_CHECKLIST.md` passes on a Vercel preview, then the production smoke subset passes.
- Production database migrations match the repository and advisors report no unresolved security/performance issues relevant to P0.
- Supabase redirect allow-list and Vercel environment variables are correct and isolated by environment.
- Public deployment has no console errors, broken links, leaked unlisted sessions/tokens, or secrets in built assets.
- Rollback target/process and demo credentials are documented privately; repository and public app URLs are ready for submission.

**Automated checks**

- Clean install, format, lint, typecheck, unit, database, build, and Playwright suites in CI.
- Dependency audit reviewed for actionable production issues.
- Database type generation and migration drift checks.
- Post-deploy smoke: landing, browse, login, detail, create, join, dashboard, logout.

**Manual browser checks**

- Full two-user acceptance pass on the preview and production URLs.
- Signup confirmation via real email, session persistence, unlisted sharing in a private window, last-seat behavior, cancellation, and dashboard history.
- iOS-sized and Android-sized mobile checks plus Chrome/Safari desktop spot checks.
- Inspect Vercel and Supabase logs after smoke tests and confirm expected errors are friendly and unexpected errors are absent.

**Likely failure modes**

- Preview and production point to the same database or wrong environment variables.
- Database migration and application deployment occur in an incompatible order.
- Auth emails use localhost or an unallowlisted callback URL.
- Production SMTP throttles or fails during the demo.
- Build-time caching accidentally crosses user sessions.
- Seed timestamps expire before judging/demo day.

## 4. Resolved product decisions

The product owner confirmed these P0 rules on September 7, 2026:

1. Registration requires an email whose exact domain is `calpoly.edu`, followed by email confirmation.
2. Capacity includes the organizer; the organizer is not a participant row.
3. Starting Soon begins 60 minutes before `starts_at`.
4. Join and leave remain available for 15 minutes after `starts_at`, but never at or after `ends_at`.
5. All session fields freeze at `starts_at`; cancellation remains available to the host while in progress.
6. Organizer notes and meeting instructions are visible to anyone who can view the public or unlisted session link.
7. Collaboration styles are `collaborative`, `focused`, and `peer_teaching`. Purposes are `homework`, `exam_review`, `project_work`, `concept_questions`, and `quiet_coworking`.
8. The searchable course dropdown contains a static, versioned snapshot of every course in Cal Poly's official 2026–2028 Academic Catalog, without runtime scraping, section/schedule imports, or course-specific behavior.
9. Cancelled sessions appear under Past with a Cancelled badge and remain reachable by known detail links.
10. P0 displays occupancy counts only and has no participant roster.

No P0 product decision remains unresolved. The catalog source is Cal Poly's official 2026–2028 Courses index; implementation must produce and review the committed snapshot artifact. Production SMTP credentials are still an operational prerequisite, not a product decision.

## 5. Token-efficient MVP prompting plan

This section is a reference sequence for building the MVP later. It does not authorize implementation now. Run the prompts in order, one at a time, and do not start the next prompt until the current phase passes its checks.

### Demo MVP structure

The fastest presentable path is a vertical slice that becomes real incrementally:

1. Application shell and visual system.
2. Typed demo data and session-state rules.
3. Public browse and session-detail demo.
4. Minimal Supabase schema and Cal Poly authentication.
5. Create, join, leave, capacity, and cancellation vertical slice.
6. Minimal Hosted and Joined dashboard.
7. Focused release checks and Vercel smoke test.

This order produces the smallest credible hackathon vertical slice while preserving a direct route to full P0. It intentionally defers edit, Past dashboard, the complete catalog snapshot, secondary filters, exhaustive state variants, broad browser matrices, and production-hardening tests. These remain P0 requirements and must not be marked complete merely because the Demo MVP checkpoint passes. Mock data is temporary and must stay behind the same typed data-access interface that Supabase later implements. Do not create a separate backend, placeholder P1 feature, participant roster, runtime catalog scraper, or generic abstraction that serves only hypothetical future work.

### Context header to reuse

Begin each implementation prompt with this compact context instead of repeatedly pasting the full project brief:

```text
Read AGENTS.md, PROJECT_BRIEF.md, IMPLEMENTATION_PLAN.md, and the relevant section of TEST_CHECKLIST.md. Preserve P0 scope and confirmed product decisions. Do not add P1 features or non-goals. Inspect existing code before editing, preserve working behavior, and use the installed skills relevant to this phase. Implement only the requested phase, run its listed checks, and finish with a concise summary of changed files, checks, and blockers.
```

When a phase touches only a few files, name those files explicitly and ask the agent not to inspect unrelated directories. Refer to local documents by filename instead of pasting their contents.

### Prompt 1 — Scaffold and polished application shell

```text
[Context header]

Implement only Phase 1: scaffold the pinned Next.js App Router stack and create the StudyDrop visual shell. Add the landing page, responsive header/mobile navigation, global metadata, 404, and global error presentation. Establish a small shadcn-based component set and design tokens. Create route shells for /sessions, /sessions/new, /dashboard, /login, and /signup, but do not implement product logic or Supabase yet. Keep copy limited to confirmed P0 behavior. Run format, lint, typecheck, and build.
```

Expected result: the product looks intentional and navigates correctly, but route shells clearly avoid claiming that unfinished actions work.

### Prompt 2 — Typed demo model and deterministic state system

```text
[Context header]

Implement only the typed presentation model needed for the MVP demo. Add one small data module with realistic public and unlisted StudyDrop sessions and a pure status helper for upcoming, starting soon, full, in progress, cancelled, and ended states. Capacity includes the organizer; starting soon is 60 minutes; join/leave grace is 15 minutes. Add focused unit tests for status precedence and exact time/capacity boundaries. Do not add Supabase, API routes, persistence, or mutation logic. Keep the data interface replaceable by the later Supabase implementation.
```

Expected result: every important P0 state can be rendered consistently without duplicating business rules across pages.

### Prompt 3 — Browse and session details

```text
[Context header]

Implement only the Demo MVP read-only discovery slice using the existing typed demo-data interface. Build `/sessions` with course search, responsive cards, populated and zero-result states, `/sessions/[id]`, and `/s/[token]`. Browse shows only future, non-cancelled public sessions ordered soonest first. Reuse the shared status and occupancy helpers. Show organizer notes and meeting instructions on valid details. Unlisted sessions and tokens must never appear in browse or public-ID routes. Add focused tests for course search and public/unlisted routing. Defer secondary filters, DST coverage, simulated read failures, auth, forms, and persistence.
```

Expected result: a presentation-ready landing → browse/search → detail demo with safe public/unlisted behavior.

### Prompt 4 — Supabase schema, catalog, and authentication

```text
[Context header]

Implement only the Demo MVP Supabase/auth foundation. Add versioned migrations for profiles, sessions, and memberships; relationships, constraints, minimum indexes, RLS, cookie-based SSR clients, signup/login/logout, email confirmation, and protected-route redirects. Enforce exact `calpoly.edu` registration in shared validation and server-side/database enforcement. Use a small committed static course list for the demo; defer the complete catalog artifact, local Supabase automation, exhaustive pgTAP coverage, and separate Preview database unless already easy to configure. Do not implement session mutations yet. Run focused auth/RLS checks, lint, typecheck, and build.
```

Expected result: real accounts and database security work, while browse/detail may still use the existing typed demo-data adapter until the next prompt.

### Prompt 5 — Real session mutations and capacity enforcement

```text
[Context header]

Implement only the Demo MVP session-action vertical slice. Replace demo reads with Supabase and add create, cancel, join, and leave using Server Actions, shared validation, and narrow database functions/policies. Capacity includes the organizer and must not be exceeded. Keep public/unlisted behavior and token privacy. Add focused authorization, capacity, and happy-path tests. Defer editing, optimistic UI, exhaustive lifecycle/idempotency cases, and dedicated concurrency stress tooling; keep database writes atomic enough that two joins cannot knowingly overbook.
```

Expected result: the primary two-user StudyDrop journey is persistent, authorized, and race-safe.

### Prompt 6 — Dashboard and resilient UX completion

```text
[Context header]

Implement only the Demo MVP dashboard. Build real Hosted and Joined lists using existing data functions/components, with visibility/status badges, occupancy counts, and useful empty states. Never show a participant roster. Do a focused responsive, keyboard, and accessible-label check on the critical flow. Defer Past, exhaustive state coverage, and broad browser/accessibility audits. Run focused tests, lint, typecheck, build, and one mobile-sized browser pass.
```

Expected result: all P0 flows feel finished rather than merely functional.

### Prompt 7 — Release gate and deployment

```text
[Context header]

Implement no new product features. Execute only `TEST_CHECKLIST.md` → `Demo MVP checkpoint`, fixing Demo MVP defects. Verify formatting, lint, typecheck, unit tests, production build, secrets, and the critical two-account flow. Configure the required Supabase/Vercel environment variables, redirect URLs, confirmation email, migrations, and production Git deployment. Smoke-test production on desktop and a mobile-sized viewport. Defer the complete P0 checklist, broad browser matrix, formal rollback exercise, migration-drift automation, and unrelated dependency cleanup. Report the URL, commit, checks, blockers, and deferred P0 items.
```

Expected result: a publicly deployed, tested P0 artifact ready for the hackathon submission.

### Token-minimization rules

- Use one prompt per phase. Combining unrelated phases increases context, rework, and test output.
- Keep the four-document context header stable; do not paste the documents into prompts.
- Tell the agent exactly which phase and routes are in scope and explicitly forbid adjacent work.
- Ask for inspection before editing so existing components and helpers are reused.
- Keep one canonical type, one status helper, one validation schema per form, and one data-access function per query shape. Avoid duplicate implementations.
- Prefer Server Components for reads and Server Actions for UI mutations; do not spend tokens designing an internal REST layer that P0 does not need.
- Request focused checks during Phases 1–6. Reserve the full test suite and exhaustive checklist for Prompt 7.
- Ask for concise final reports: changed files, checks, blockers, and the next prompt number. Do not request tutorials or line-by-line explanations during implementation.
- When a command fails, provide the exact error in the next prompt rather than asking for a broad re-investigation.
- Start a fresh task only when the current context has become dominated by old logs. In the new task, reference the four local documents and the last phase result instead of copying conversation history.
- Do not regenerate the full Cal Poly course list in model output. Produce it once as a repository artifact from the documented official source, then refer to the file and its checksum.
- Do not ask the model to rewrite `IMPLEMENTATION_PLAN.md` or `TEST_CHECKLIST.md` after every phase. Update them only when an actual product or architecture decision changes.

### Minimal progress report format

Use this at the end of each implementation prompt to keep responses short and actionable:

```text
Return only:
1. Outcome (2–4 bullets)
2. Changed files (paths only)
3. Checks run and pass/fail
4. Blockers or “None”
5. Next prompt number
```

## 6. Documentation basis

- [Next.js App Router project structure](https://nextjs.org/docs/app/getting-started/project-structure)
- [Next.js testing guidance](https://nextjs.org/docs/app/guides/testing)
- [Supabase SSR client setup for Next.js](https://supabase.com/docs/guides/auth/server-side/creating-a-client?queryGroups=framework&framework=nextjs)
- [Supabase password authentication](https://supabase.com/docs/guides/auth/passwords)
- [Supabase Before User Created Auth Hook](https://supabase.com/docs/guides/auth/auth-hooks/before-user-created-hook)
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase database testing](https://supabase.com/docs/guides/database/testing)
- [Supabase Data API explicit-grant change](https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically)
- [shadcn/ui installation for Next.js](https://ui.shadcn.com/docs/installation/next)
- [Vercel Git deployments](https://vercel.com/docs/git)
- [Vercel environment variables](https://vercel.com/docs/environment-variables)
- [Cal Poly 2026–2028 Academic Catalog courses](https://catalog.calpoly.edu/courses/)
