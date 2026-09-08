# StudyDrop P0 End-to-End Acceptance Checklist

This is the release gate for P0. Run the full checklist against a Vercel preview connected to a non-production Supabase project. After it passes, run the marked production smoke flows again on the public production URL. Record browser, viewport, build/commit, database migration version, test accounts, and failures in the release notes.

## 1. Test readiness and automated gates

- [ ] The tested build comes from the intended commit and contains no uncommitted application changes.
- [ ] Development, Preview, and Production use the intended separate Supabase configuration; no test points at production.
- [ ] A fresh local database reset applies every migration and deterministic seed without manual repair.
- [ ] Generated Supabase TypeScript types match the current migrations.
- [ ] Seed data includes upcoming, starting-soon, full, in-progress, cancelled, ended, public, and unlisted sessions.
- [ ] Clean dependency install from the committed lockfile passes.
- [ ] Formatting check passes.
- [ ] ESLint passes with no ignored new errors.
- [ ] `tsc --noEmit` passes.
- [ ] Unit tests pass.
- [ ] Database/pgTAP tests pass.
- [ ] Database concurrency test for the final seat passes repeatedly.
- [ ] Playwright P0 suite passes against the local production build.
- [ ] `next build` passes with no unexpected dynamic/caching warnings.
- [ ] Vercel preview deployment finishes successfully.
- [ ] Playwright preview smoke suite passes.
- [ ] Supabase database/security/performance advisors have no unresolved P0-relevant findings.

## 2. Landing page and global navigation — production smoke

- [ ] `/` loads over HTTPS without authentication.
- [ ] Page title, description, favicon/brand, and StudyDrop name are correct.
- [ ] Copy clearly explains small, course-specific study sessions happening soon.
- [ ] Public and unlisted sharing are explained accurately without promising P1/non-goal features.
- [ ] Browse, signup, and login calls to action go to the correct routes.
- [ ] Signed-in navigation shows dashboard/create/logout; signed-out navigation shows login/signup.
- [ ] Desktop and mobile navigation expose the same required destinations.
- [ ] Unknown route renders a helpful branded 404 with a working recovery link.
- [ ] No page has a broken link, missing asset, console error, hydration warning, or horizontal overflow.

## 3. Signup, confirmation, login, session persistence, and logout — production smoke

- [ ] Signup requires display name, an exact `calpoly.edu` email address, password, and matching password confirmation.
- [ ] Mixed-case `@CALPOLY.EDU` is normalized and accepted.
- [ ] Gmail, other domains, subdomain/lookalike forms such as `user@evilcalpoly.edu`, missing domains, and malformed addresses are rejected.
- [ ] A direct Supabase Auth signup request that bypasses the StudyDrop UI is rejected by the Before User Created hook unless the exact lowercased domain is `calpoly.edu`.
- [ ] Required, malformed, too-short, too-long, weak-password, and mismatched-password inputs show specific accessible errors.
- [ ] Leading/trailing whitespace is normalized where appropriate.
- [ ] Duplicate-email signup returns a safe, understandable response without exposing sensitive account detail.
- [ ] Valid signup creates one Auth user and exactly one matching profile.
- [ ] Confirmation email arrives through local Mailpit and the configured production SMTP path.
- [ ] Confirmation link returns to the allowed StudyDrop callback and establishes the expected session.
- [ ] Invalid, expired, or reused confirmation link shows a recoverable error.
- [ ] Wrong-password login shows an understandable error and retains the email field.
- [ ] Valid login reaches the validated return path or dashboard.
- [ ] Direct access to `/sessions/new`, `/sessions/[id]/edit`, and `/dashboard` while signed out redirects to login.
- [ ] After login, a protected-route return path is restored.
- [ ] A return path to an external origin is rejected and replaced with a safe internal default.
- [ ] Refreshing and opening a second tab preserve a valid login session.
- [ ] Logout clears authenticated UI/data and returns to `/`.
- [ ] Browser back after logout does not reveal actionable private content.
- [ ] No auth token, secret key, password, or sensitive error appears in rendered HTML, console, or application logs.

## 4. Browse upcoming sessions — production smoke

- [ ] `/sessions` loads while signed out.
- [ ] Only public, non-cancelled sessions with `starts_at > now` appear.
- [ ] Sessions are ordered soonest first with unambiguous local date/time.
- [ ] Each card shows course, topic, purpose, collaboration style, time, location mode/label, capacity/availability, and correct status.
- [ ] Search matches course subject, course number, and course title case-insensitively.
- [ ] Course filter works alone.
- [ ] Date filter uses `America/Los_Angeles` calendar dates and works alone.
- [ ] Purpose filter works alone.
- [ ] Collaboration-style filter works alone.
- [ ] Search and all filters work in combination.
- [ ] Filter state is represented in valid URL query parameters and survives refresh/back/forward.
- [ ] Invalid query parameters are ignored or normalized without an error or unsafe query.
- [ ] Clearing filters restores the full upcoming public result set.
- [ ] Zero matching results show a useful empty state and clear-filter action.
- [ ] Loading shows stable skeletons; an induced read failure shows a friendly retry state.
- [ ] Unlisted, cancelled, in-progress, and ended sessions never appear in browse.

## 5. Public session details — production smoke

- [ ] Selecting a public card opens `/sessions/[id]` directly and after refresh.
- [ ] Detail shows organizer notes and meeting instructions, along with all other public session fields, to an unjoined viewer.
- [ ] Organizer identity is limited to the approved safe display data.
- [ ] Time and date clearly use the expected local timezone.
- [ ] Seat count and status agree with the browse card.
- [ ] Signed-out join action asks for login and returns to the exact detail route afterward.
- [ ] Unknown/malformed UUID renders 404 without leaking database detail.
- [ ] Cancelled and ended public detail links render historical states and disable ineligible actions.
- [ ] A non-host never sees working edit/cancel controls.

## 6. Unlisted behavior and privacy — production smoke

- [ ] Creating or seeding an unlisted session produces `/s/[share_token]`, not a public UUID link.
- [ ] The unlisted session is absent from browse under every search/filter combination.
- [ ] Anonymous normal `study_sessions` queries cannot enumerate or select the unlisted row.
- [ ] `/sessions/[id]` does not reveal the unlisted session to a signed-out or unrelated signed-in user.
- [ ] A valid `/s/[share_token]` link opens the approved safe detail projection in a private window.
- [ ] An invalid/malformed token renders 404 without revealing whether a related session UUID exists.
- [ ] Login from an unlisted detail returns to the same token URL.
- [ ] A user who joins via token can later see the session in Joined and use its authorized detail route.
- [ ] Host can see the unlisted session in Hosted.
- [ ] Unlisted token never appears in browse payloads, page metadata, analytics, application log messages, or unrelated UI; provider access logs remain access-controlled.
- [ ] Copy/share action copies the complete correct unlisted URL.
- [ ] Cancellation remains visible through the known unlisted link with a prominent Cancelled state.

## 7. Create session — production smoke

- [ ] Signed-in user can open `/sessions/new`.
- [ ] Form includes only approved P0 fields: course, topic, purpose, collaboration style, mode/location, start/end, capacity, visibility, meeting instructions, and organizer notes.
- [ ] Required field errors appear next to the correct controls and are announced accessibly.
- [ ] Topic, notes, and instructions enforce approved trimmed length limits.
- [ ] Course is selected from the searchable dropdown containing the complete versioned Cal Poly 2026–2028 Academic Catalog snapshot.
- [ ] The course dropdown remains responsive with the full catalog, supports keyboard search, and does not render thousands of raw native-select options at once.
- [ ] Purpose accepts only Homework, Exam Review, Project Work, Concept Questions, or Quiet Co-working.
- [ ] Collaboration style accepts only Collaborative, Focused, or Peer Teaching.
- [ ] Meeting mode and location fields satisfy the documented conditional rules.
- [ ] Start time is at least 15 minutes in the future.
- [ ] End is after start and duration is between 30 minutes and 6 hours.
- [ ] Capacity is between 2 and 20 total people and includes the organizer.
- [ ] Public visibility creates a `/sessions/[id]` result visible in browse.
- [ ] Unlisted visibility creates a `/s/[share_token]` result absent from browse.
- [ ] Server-side validation rejects a handcrafted invalid submission even if client validation is bypassed.
- [ ] Double click/retry does not silently create duplicate sessions.
- [ ] Submission shows a pending state and a friendly recoverable server-error state.
- [ ] Successful create redirects to the correct detail page and appears in Hosted.

## 8. Edit session

- [ ] Host can open edit from eligible detail/dashboard UI.
- [ ] Existing values are populated correctly, including local date/time.
- [ ] Host can save each approved editable field.
- [ ] Ordinary edit preserves session ID, share token, host, participant count, created time, and memberships.
- [ ] The same validation rules run on edit as create.
- [ ] Capacity cannot be reduced below current total occupancy.
- [ ] Every field becomes read-only exactly at `starts_at`; this is enforced in UI, Server Action, and database.
- [ ] Cancelled, in-progress, and ended sessions cannot be edited.
- [ ] Non-host direct navigation to edit is denied without leaking fields.
- [ ] Non-host direct Server Action/Data API/RPC mutation is denied by database authorization.
- [ ] Successful edit is immediately consistent on detail, browse, and dashboard after refresh.
- [ ] Concurrent join plus capacity reduction cannot overbook or corrupt the count.

## 9. Cancel session

- [ ] Eligible host sees Cancel; non-host does not.
- [ ] Cancel opens an accessible destructive confirmation dialog with clear consequences.
- [ ] Dismissing the dialog makes no change.
- [ ] Confirming cancellation sets cancellation state without deleting the session or memberships.
- [ ] Repeated cancellation is idempotent or returns a friendly already-cancelled result.
- [ ] Cancelled session disappears from browse immediately.
- [ ] Known detail link shows Cancelled and disables join, leave, and edit actions.
- [ ] Cancelled session appears under Past with a prominent Cancelled badge for host and joined users.
- [ ] Non-host cancellation attempt fails at the database layer.
- [ ] Ended-session cancellation behavior matches the documented rule.

## 10. Join and leave — two-account flow, production smoke

- [ ] Signed-in non-host can join an eligible public session.
- [ ] Signed-in non-host can join an eligible unlisted session reached by token.
- [ ] Successful join creates exactly one membership and increments participant count exactly once.
- [ ] Duplicate join/double click creates no duplicate membership or counter drift.
- [ ] Host cannot join their own session as a participant.
- [ ] Organizer notes and meeting instructions are visible before and after joining to anyone who can view the public or unlisted detail link.
- [ ] Joined session appears under Joined and remains absent from Hosted for that user.
- [ ] Joined user can leave strictly before the earlier of `starts_at + 15 minutes` and `ends_at`.
- [ ] Successful leave removes exactly one membership and decrements count exactly once.
- [ ] Duplicate leave/retry never makes participant count negative or inconsistent.
- [ ] Unrelated user cannot remove another user's membership.
- [ ] Host cannot remove a participant unless that capability is explicitly approved; default P0 has no remove-participant UI/API.
- [ ] Join and leave are rejected for cancelled and ended sessions.
- [ ] Join and leave remain available at exactly `starts_at` when all other rules pass.
- [ ] Join and leave work during the first 15 minutes after start when all other rules pass.
- [ ] Join and leave close exactly at `starts_at + 15 minutes`, and always close at `ends_at` if the session ends sooner.
- [ ] Failed actions show a current, understandable message and do not leave stale optimistic UI.

## 11. Capacity and concurrency

- [ ] Capacity display counts the organizer plus participant rows.
- [ ] Session becomes Full when `1 + participant_count = capacity`.
- [ ] Full session displays Full consistently on detail/dashboard and blocks new joins.
- [ ] Leaving a full eligible session reopens exactly one seat.
- [ ] Two simultaneous attempts for the final seat yield exactly one successful membership.
- [ ] Losing final-seat attempt receives a friendly full message, not a raw constraint error.
- [ ] Membership row count, `participant_count`, and displayed occupancy remain equal after concurrent, duplicate, and failed operations.
- [ ] Host cannot lower capacity below occupancy during a concurrent join.
- [ ] Direct insert/delete on `session_participants` is denied to browser roles.
- [ ] Direct update of `participant_count` is denied to browser roles.

## 12. Status rules and time boundaries

- [ ] Cancelled overrides every other display status.
- [ ] Ended applies at `now >= ends_at` when not cancelled.
- [ ] In Progress applies at `starts_at <= now < ends_at` when not cancelled.
- [ ] Full applies to a future session when `1 + participant_count >= capacity`.
- [ ] Starting Soon begins exactly 60 minutes before start and ends at `starts_at`.
- [ ] Upcoming applies to remaining future sessions.
- [ ] Full remains available as a capacity fact if another lifecycle state is primary.
- [ ] Cards, details, actions, and dashboard use the same state at each exact boundary.
- [ ] State updates after refresh/navigation without requiring a database status job.
- [ ] Time display and date filters remain correct across Pacific daylight-saving transitions.

## 13. Dashboard — production smoke

- [ ] Signed-out user cannot view `/dashboard` data.
- [ ] Default dashboard view is Hosted; `?view=hosted|joined|past` selects the corresponding view.
- [ ] Hosted shows only non-cancelled future and in-progress sessions owned by the current user, ordered by start time.
- [ ] Joined shows only non-cancelled future and in-progress sessions with a current membership and excludes hosted-only sessions.
- [ ] Past shows ended and cancelled hosted/joined sessions; cancelled entries have a prominent Cancelled badge.
- [ ] Public and unlisted hosted/joined sessions appear with clear visibility badges.
- [ ] Host actions and participant actions appear only where eligible.
- [ ] Empty Hosted, Joined, and Past views each explain the state and offer an appropriate P0 action.
- [ ] Loading and induced failures have stable skeleton/retry UI.
- [ ] Refresh and direct query-param navigation retain the selected view.
- [ ] User A cannot retrieve User B's private dashboard/unlisted data through UI, Server Action, or direct Data API request.
- [ ] No dashboard or detail page exposes a participant roster; only occupancy counts are shown.

## 14. Validation, failure recovery, and data integrity

- [ ] Every mutation validates on the server; client validation is not the only defense.
- [ ] Database constraints reject invalid enum-like values, blank/oversize text, invalid times, out-of-range capacity, duplicate memberships, and missing relationships.
- [ ] Expected domain failures map to friendly messages without SQL/internal details.
- [ ] Unexpected route errors render a recovery action and are logged server-side with sufficient correlation detail.
- [ ] Retrying a transient read error works.
- [ ] Retrying/double-submitting create, update, cancel, join, leave, login, and logout does not corrupt data.
- [ ] Slow network shows pending/disabled state for every mutation.
- [ ] Offline/network failure does not falsely show success.
- [ ] Refresh/back/forward after each mutation shows authoritative server state.
- [ ] No user-entered content causes script execution or broken layout.
- [ ] Application logs exclude passwords, access/refresh tokens, unlisted share tokens, full token URLs, and unnecessary personal data.

## 15. Loading, empty, error, and not-found coverage

- [ ] Landing has no misleading loading UI.
- [ ] Browse has loading, empty-filtered, error/retry, and populated states.
- [ ] Public detail has loading, error/retry, not-found, cancelled, ended, and populated states.
- [ ] Unlisted detail has loading, safe not-found, error/retry, cancelled, and populated states.
- [ ] Create/edit have initial, validating, submitting, success, expected-error, and unexpected-error states.
- [ ] Join/leave/cancel controls have idle, pending, success, stale-conflict, expected-error, and retry behavior.
- [ ] Dashboard Hosted/Joined/Past each have loading, empty, error/retry, and populated states.
- [ ] Auth screens have initial, submitting, confirmation-required, success, invalid-credentials, duplicate/invalid signup, callback-error, and retry states.
- [ ] Global 404 and unexpected root error pages provide safe recovery navigation.

## 16. RLS, grants, and privacy matrix

- [ ] RLS is enabled on every table in an exposed schema.
- [ ] Grants are explicit and no role retains an operation it does not need.
- [ ] `anon` can select courses and approved safe public session/profile data only.
- [ ] `anon` cannot insert/update/delete application rows.
- [ ] `authenticated` session reads are limited to public, hosted-by-self, or joined-by-self rows, except exact unlisted-token lookup.
- [ ] Inserted session `host_id` must equal `(select auth.uid())`.
- [ ] Update/cancel requires the current user to be the host and uses both ownership and new-row checks.
- [ ] Participant table writes are available only through the narrow functions.
- [ ] Functions reject missing identity and never trust a passed user ID.
- [ ] Security-definer functions have empty `search_path`, fully qualified objects, revoked `PUBLIC` execution, and minimum explicit grants.
- [ ] Columns used by foreign keys and RLS predicates have appropriate indexes.
- [ ] Unlisted lookup accepts only the bearer token and returns only the approved projection.
- [ ] A list/range/filter call cannot enumerate unlisted rows or tokens.
- [ ] No view bypasses RLS; any exposed view is security-invoker or otherwise proven safe.
- [ ] Publishable key is the only Supabase key in browser bundles.
- [ ] `getSession()` is not used as server authorization evidence; protected paths/actions validate claims/user.

## 17. Responsive design, accessibility, and browser quality — production smoke

- [ ] Critical flows work at 320 px, 375 px, 768 px, 1280 px, and a wide desktop viewport.
- [ ] No horizontal page scroll, clipped text, overlapped control, or off-screen dialog occurs.
- [ ] Touch targets are usable and primary actions remain reachable on mobile.
- [ ] All interactive controls are reachable and operable by keyboard.
- [ ] Focus is visible; dialogs trap/restore focus; mobile navigation opens/closes correctly.
- [ ] Every form control has an accessible name and errors are programmatically associated.
- [ ] Status is not communicated by color alone.
- [ ] Loading/action status and important errors are announced appropriately.
- [ ] Heading hierarchy and landmark/navigation structure are sensible.
- [ ] Text and controls meet contrast expectations in every state.
- [ ] Page remains usable at 200% zoom.
- [ ] Automated accessibility scans have no serious/critical violations on all critical routes.
- [ ] Chrome and Safari desktop spot checks pass; iOS-sized and Android-sized responsive checks pass.

## 18. Public deployment and operations — production smoke

- [ ] Production Vercel URL is publicly reachable over HTTPS.
- [ ] Production branch is `main`; non-production branches create preview deployments.
- [ ] Preview and Production environment variables use their intended Supabase projects and publishable keys.
- [ ] Supabase Site URL and redirect allow-list include the final production/auth callback URLs and only intended preview patterns.
- [ ] Production custom SMTP is configured and a real confirmation round trip succeeds.
- [ ] Production migrations match the reviewed repository migrations.
- [ ] The versioned static snapshot of all Cal Poly 2026–2028 catalog courses and any approved demo data are present, reproducible, and idempotent.
- [ ] The catalog artifact records the official source URL, catalog edition, snapshot date, reviewed row count, and integrity checksum.
- [ ] No runtime catalog scraping, section/schedule importing, or course-specific behavior is required.
- [ ] Demo session timestamps will remain useful through judging or are safely generated immediately before the demo.
- [ ] Production landing, browse, detail, signup/login, create, join, dashboard, cancel, and logout smoke flows pass with two accounts.
- [ ] Vercel and Supabase logs show no unexpected errors during the smoke run.
- [ ] Built assets and runtime responses contain no service-role/secret key.
- [ ] Unlisted share tokens/full token URLs do not appear in application log messages or analytics; provider access logs remain access-controlled.
- [ ] A known-good previous Vercel deployment and rollback procedure are identified.
- [ ] GitHub repository and public application URLs are ready for submission.
- [ ] No P1 feature or explicit non-goal is partially exposed, promised, or required for a P0 flow.

## 19. Final P0 product sign-off

- [ ] Landing page is complete and polished.
- [ ] Browse upcoming sessions is complete.
- [ ] Course/date/purpose/collaboration-style search and filtering are complete.
- [ ] Session detail is complete.
- [ ] Create, edit, and cancel are complete.
- [ ] Join, leave, and capacity enforcement are complete.
- [ ] Starting soon, full, in progress, cancelled, and ended states are complete.
- [ ] Public and unlisted behavior is complete and privacy-tested.
- [ ] Signup, login, and logout are complete.
- [ ] Hosted, joined, and past dashboard views are complete.
- [ ] Organizer notes and meeting instructions are visible to anyone who can view the session link.
- [ ] Responsive mobile design is complete.
- [ ] Validation and loading/empty/error states are complete.
- [ ] Supabase RLS and explicit privilege model are tested.
- [ ] Public Vercel deployment is verified.
- [ ] Confirmed product decisions match `IMPLEMENTATION_PLAN.md` and `PROJECT_BRIEF.md`.
