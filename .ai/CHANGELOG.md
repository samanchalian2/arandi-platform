# Changelog

All important project changes are recorded here.

---

# Version 0.5.9

Date:

2026-08-03

## Phase 10 Quality and Production-like Staging

- Upgraded the verified runtime to Next.js 16.2.12 and React 19.2.8 and remediated all reported full/production dependency advisories.
- Added bilingual canonical/alternate/Open Graph metadata, Organization JSON-LD, Published-only sitemap, robots policy, health probes, security headers, standalone output, skip navigation, and repeatable production QA.
- Added bounded streaming JSON parsing and production-origin validation for reverse-proxied mutations; minimized CMS error logging.
- Added release/rollback, health, backup, isolated restore, systemd, Nginx, TLS-staging, SSH, journald, and CI operational assets.
- Activated PostgreSQL loopback access, least-privilege application connectivity, ClamAV, Nginx Media serving, key-only SSH, checksummed backups, restore verification, health timers, bounded journal retention, and a hardened systemd application service on the approved VPS.
- Preserved the existing WordPress public server block; no public cutover was performed.

## Brand assets and profile-content integration — 2026-08-10/11

- Added the supplied compact Arandi symbol and full lockup under `public/brand/`.
- Used the compact symbol in the public Header and favicon metadata, and the full lockup in the Footer and Organization JSON-LD.
- Added the two supplied assets to the default Media seed and set the default public `site.logo` value to the lockup; the live database branding records were updated in a controlled transaction.
- On 2026-08-11, received `Arandi_Company_Profile_Final.docx`, structurally extracted its content, and added the repeatable `scripts/import-company-profile.ts` importer.
- Imported validated bilingual content for Home, Company, Services, Solutions, Industries, Projects, and Contact into Published Prisma CMS records; changed the public portfolio to seven services, six target industries, and four profile-backed projects.
- Updated allowlisted public company/contact settings with the approved tagline and contact information; no secret-bearing setting was read or persisted.

## Verification

- 44/44 focused tests, strict typecheck, zero-warning lint, AI verifier, five-current-migration Prisma status, and the 56-page production build pass.
- Full and production-only `npm audit` report zero vulnerabilities.
- Active release: `20260803T093000Z-phase10-r6`.
- Production-like EN/FA QA passed 24 route/viewport combinations at 390/768/1280 px with zero Axe violations, no browser errors/overflow, valid SEO signals, and measured performance budgets.
- Nginx Media returned `200`; ClamAV found zero infections; checksum and isolated database restore passed; rollback and roll-forward passed.
- systemd security exposure is `3.0 OK`; SSH password authentication is disabled after separate key-login validation.
- Staging TLS negotiated TLS 1.3 and returned HSTS over loopback, but the certificate is self-signed and no production TLS claim is made.

## Remaining Gates

- Public DNS/trusted renewable certificate and final Nginx cutover.
- Approved OpenAI/SMTP/SMS.ir credentials and real provider checks.
- External alerting, encrypted off-host backup, observed GitHub CI, and stakeholder acceptance of the newly imported Persian copy and its English translation.

---

# Version 0.5.8

Date:

2026-08-03

## Phase 9 AI and Knowledge Application Layer

- Replaced the placeholder AI gateway with a server-only OpenAI Responses API streaming gateway.
- Added a bounded Published-only Prisma context projection with term ranking, exact locale selection, safe citations, and explicit unsupported-query behavior.
- Added `/api/ai/chat` with same-origin/JSON enforcement, body/history/message bounds, HMAC client identifiers, ten-per-minute in-process throttling, timeout, cancellation, and generic failures.
- Connected the existing bilingual ChatInterface to NDJSON streaming with incremental output, citations, stop control, and localized errors.
- Added private Admin-governed `ai.runtime` provider/model selection; credentials remain environment-only.
- Applied the fifth migration to create the private default runtime selection.
- Added focused AI tests and a deterministic PostgreSQL/provider-stub verifier.

## Verification

- 42/42 tests, strict typecheck, and zero-warning lint passed.
- Prisma schema/status passed with all five migrations applied.
- Live PostgreSQL verifier found two Published citations, invoked the Stub once for grounded content, and skipped it for no-answer.
- Production build passed with 54 route entries.
- Production Persian browser QA passed provider-unavailable behavior and 390px RTL layout without overflow.
- `OPENAI_API_KEY` is not configured; no real OpenAI request or model-quality claim is made.

---

# Version 0.5.7

Date:

2026-08-03

## Phase 8 Secured Contact Submission

- Added the `ContactSubmission` Prisma model and fourth applied migration.
- Added same-origin, JSON-only, 8 KB-bounded Contact API with strict validation and required consent.
- Added honeypot handling, HMAC client hashes, replay deduplication, cooldown, and hourly throttling.
- Added independent received/delivery states and fail-closed email gateway behavior.
- Converted the public Contact form into an accessible pending/success/error client workflow.
- Added a minimized Admin/SuperAdmin Contact requests view.

## Verification

- Focused tests increased to 35/35 and passed; typecheck and zero-warning lint passed.
- Live PostgreSQL verifier passed origin, validation, consent, honeypot, hashing, replay, throttling, unavailable delivery, and cleanup.
- Fourth migration is applied and Prisma schema/status are valid/up to date.
- Production build passed with 53 route entries.
- 390px Persian browser submission returned a tracking reference, cleared fields, retained one `main`, and had no overflow.
- Stored browser record had both client hashes, one unavailable delivery attempt, and no raw client identifiers; it was deleted after verification.
- SMTP was not configured and no delivery claim is made.

---

# Version 0.5.6

Date:

2026-08-03

## Phase 8 Published Details, Documents, Search, and 404

- Added Published-only bilingual Article, Knowledge, and Legal list/detail routes.
- Added constrained plain-text rich content rendering; raw HTML and unknown Section types fail closed.
- Seeded one create-if-absent bilingual Article, Knowledge document, and Privacy notice.
- Added Services, Solutions, Industries, and Projects detail routes from existing Published Cards.
- Added Published-content search with bounded queries, minimized results, Header discovery, and locale-query preservation.
- Added a bilingual custom 404 and aligned the Admin Section-type allowlist with constrained Page templates.

## Verification

- 34/34 tests, typecheck, lint, Prisma validation, focused document verifier, and production build passed.
- Production build exposes 51 static/dynamic route entries including all new route families.
- Controlled Article Draft rendered 404 with no source marker; Published restoration returned Prisma content.
- EN/FA production QA passed document and organization detail routes with correct direction, one `main`, one `h1`, no UUID leakage, and no overflow.
- 390px mobile and 768px tablet QA passed Article, Search, and Service detail pages.
- Repeat seed preserved document timestamps; final baseline is Page 10, Section 15, Card 23, User 0, SecurityEvent 0.

---

# Version 0.5.5

Date:

2026-08-03

## Phase 7 Company and Contact Published Bridge

- Added create-if-absent bilingual Published Page/Section structures for Company and Contact.
- Added bounded Prisma mappers that reconstruct the exact existing Company and Contact output contracts.
- Moved contact coordinates to a validated, allowlisted public `site.contact` Setting boundary.
- Changed seed Setting updates to preserve later Admin-edited values.
- Switched Company/Contact rendering and metadata to fail-closed Published Prisma reads.
- Kept the Contact form presentation-only; no submission, persistence, or delivery claim was added.
- Added a self-cleaning fixed-page parity and publication-filter verifier.

## Verification

- 34/34 tests, typecheck, lint, and the 47-route production build passed.
- Exact Company/Contact EN/FA parity, Draft Page exclusion, disabled Section exclusion, and contact Setting validation passed.
- Browser QA passed both routes in both languages with Prisma source, correct LTR/RTL, one `main`, and no overflow.
- Persian Contact at 390px passed with one form and five fields.
- Final database baseline is Page 7, Section 9, Card 23, Media 1, User 0, SecurityEvent 0.

---

# Version 0.5.4

Date:

2026-08-03

## Phase 7 Enterprise Collection Published Bridge

- Added bilingual Published Page/Section/Card seed structures for Services, Solutions, Industries, and Projects.
- Made enterprise seed import create-if-absent so repeat seed runs preserve later Admin edits.
- Added bounded server-only Prisma mappers with exact existing public output shapes.
- Switched all four routes and localized metadata to Published Prisma reads with production fail-closed behavior.
- Added page-specific cache tags and retained immediate CMS mutation invalidation.
- Added a self-cleaning PostgreSQL verifier for exact EN/FA parity, Draft Pages, disabled Sections, and Draft Cards.
- Corrected the Industries page type to the canonical `industry` value.

## Verification

- 34/34 tests, typecheck, lint, and the 47-route production build passed.
- Prisma validate/status passed with all three migrations applied.
- Enterprise output parity and publication-filter verifier passed with full restoration.
- Database baseline is Page 5, Section 7, Card 23, Media 1, User 0, SecurityEvent 0; all five Pages are Published.
- Production browser QA passed Services, Solutions, Industries, and Projects in EN/LTR and FA/RTL with Prisma source, one `main`, no 404, and no horizontal overflow.
- Controlled Services Draft DOM rendered 404 with no source marker; Published restoration returned the Prisma-backed page.
- Persian Solutions at 390px passed without horizontal overflow.

---

# Version 0.5.3

Date:

2026-08-03

## Phase 7 Published Home and Shared Chrome Bridge

- Added a server-only Published Prisma adapter for Home, bilingual Navigation, and public company/footer settings.
- Preserved existing Home component contracts while mapping hero, chat, features, and service Cards from Page -> Section -> Card.
- Added exact-locale filtering, enabled/Published filters, bounded field validation, deterministic Card order, and a safe public source marker.
- Added one-hour Next.js ORM caching plus bounded immediate revalidation from Page, Section, Card, Navigation, and Settings mutations.
- Separated shared chrome queries from Home publication so unrelated public routes remain available when Home is Draft.
- Restricted local fallback to an explicit development-only source selection; production fails closed.

## Verification

- 34/34 tests, typecheck, lint, and production build passed; build remains 47 routes.
- Prisma validate/status passed with all three migrations applied.
- EN/LTR and FA/RTL production DOM returned `data-content-source="prisma"`.
- Draft isolation DOM returned 404 with no Home/source marker while Services remained available.
- Published restoration returned Home to Prisma output; desktop/mobile had one `main` and no overflow.
- Page, Navigation, and Theme/Settings live verifiers passed and restored all baseline data.

---

# Version 0.5.2

Date:

2026-08-03

## Phase 6 Constrained Page Templates

- Added nine allowlisted Page templates over the existing Page -> Section -> Card -> Media model.
- Added permission-aware responsive Page creation with required English/Persian content and SEO fields.
- Made Page plus starter-Section creation serializable and transactional; new Pages are always Draft.
- Added canonical slug/route validation and deployed database-level unique Page routes.
- Hardened Page updates to preserve canonical identifiers and return deterministic uniqueness conflicts.
- Added a Published-only server query boundary that also filters disabled Sections and Draft Cards for the upcoming public bridge.
- Added a self-cleaning PostgreSQL verifier covering RBAC, CSRF, validation rollback, Draft isolation, uniqueness, deletion, and baseline restoration.

## Verification

- Focused tests: 34/34 passed.
- Typecheck, lint, and production build passed; build exposes 47 routes.
- Prisma schema is valid and all three migrations are applied.
- Page-template runtime verification passed and restored baseline Page/Section counts.
- Desktop Editor and mobile creation-modal QA passed; Translator creation controls remain absent.
- Dependency audit remains 6 upstream/transitive findings; the unsafe suggested Next.js downgrade was not applied.

---

# Version 0.5.1

Date:

2026-08-02

## Phase 5 Identity Foundation

- Added migration-backed User, Role, UserRole, UserCredential, AuthSession, OtpChallenge, PasswordRecoveryToken, SecurityEvent, and ServiceRequest models.
- Applied migration `20260802120000_identity_foundation` and seeded six system roles while preserving existing CMS data.
- Added Iranian phone/email normalization, Argon2id password hashing, opaque token generation/hashing, HMAC OTP hashing, expiry helpers, and CSRF primitives.
- Added database session creation, resolution, permission loading, revocation, and hashed client-context support.
- Connected Admin Server Component guards and CMS API authorization to trusted database sessions.
- Kept Proxy limited to optimistic token-shape checks and preserved the gated development mock path.
- Added fail-closed SMS and email gateway boundaries.
- Added production password login with generic failures, Argon2 verification, IP throttling, transactional failure counters, timed lockout, and security events.
- Added secure session/CSRF cookie issuance and CSRF-protected database-session logout.
- Added the responsive production Admin login form and safe internal return-path handling.
- Added a one-time environment-driven SuperAdmin bootstrap command that refuses after the first SuperAdmin exists.
- Added non-enumerating OTP request/verify flows with committed attempt caps, cooldown/rate limits, atomic single-use consumption, and secure cookie issuance.
- Added single-use email recovery flows with password replacement, other-link consumption, full session revocation, and token removal from browser history.
- Added responsive recovery and customer account login UI.
- Added the Customer portal and owner-scoped, CSRF-protected service-request create/list workflow.
- Added a self-cleaning live PostgreSQL verifier for authentication and customer boundaries.
- Replaced the Users placeholder with Prisma-backed User filtering, SuperAdmin-only create/edit/suspend/revoke actions, and minimized security-event visibility.
- Added persistent identity permissions, CSRF enforcement, mock-session write denial, last-SuperAdmin/self-demotion protection, and audited mutations.
- Added `npm run admin:verify` and corrected verifier cleanup so SecurityEvent rows are removed before temporary User deletion.
- Replaced Navigation, Theme, and Settings placeholders with Prisma-backed workflows and responsive Admin UI.
- Added bilingual Navigation CRUD/translation, complete atomic reorder, constrained Theme token parsing, governed public Settings, and `/api/public/settings`.
- Added database-session CSRF enforcement to every CMS mutation and shared client-side CSRF header injection.
- Added Navigation and Theme/Settings live verifiers that restore original ordering/values and remove all temporary records.

## Verification

- Focused tests expanded to 28/28.
- Typecheck, lint, and production build passed with no warnings/errors.
- Prisma validate and live migration status passed with two applied migrations.
- Existing CMS seed counts remained intact; six roles and zero default users were verified.
- Runtime database-session checks: SuperAdmin read `200`, Viewer write `403`, revoked session `401`.
- Runtime password flow verified five-attempt lockout, locked correct-password rejection, successful cookie issuance, CSRF logout, and session revocation.
- Production login UI passed desktop/mobile checks with one `main` landmark and no horizontal overflow.
- Live OTP/recovery checks passed attempt persistence, single-use/replay rejection, unknown-account non-delivery, and session revocation.
- Live customer checks passed missing-CSRF denial, owner-scoped create/list, response minimization, and cleanup.
- Recovery and customer login passed 1280px/390px browser QA without horizontal overflow.
- Admin identity runtime checks passed SuperAdmin/Admin/Viewer, CSRF, suspension/revoke, self-demotion, audit-minimization, and zero-artifact cleanup.
- Users/security UI passed 1280px/390px browser QA with one `main` and no document overflow.
- Focused tests expanded to 33/33 and production build expanded to 47 routes.
- Navigation, Theme, and Settings passed desktop/mobile browser QA without document overflow.

---

# Version 0.5.0

Date:

2026-08-02

## Phase 4.7 Media Library

- Added managed-filesystem image upload with JPEG/PNG/WebP signature validation, size/dimension/pixel limits, quarantine, optional ClamAV scanning, Sharp sanitisation, and UUID filenames.
- Added development Media serving at immutable `/media/*` URLs; production serving remains behind the approved Nginx boundary.
- Added Admin/SuperAdmin upload and metadata-edit UI plus SuperAdmin-only deletion.
- Added staged file deletion/rollback and retained Card-reference deletion protection.
- Added Media client mutation APIs and React Query invalidation.
- Upgraded direct Sharp to 0.35.3.

## Accessibility and Runtime

- Added shared Admin modal semantics, accessible labels/descriptions, initial focus, Tab containment, Escape close, scroll locking, and focus return.
- Corrected Base UI link-button semantics and Next.js 16 smooth-scroll declaration.
- Verified Media at desktop, tablet, and mobile widths with EN/LTR and FA/RTL direction behavior.

## Verification

- Focused tests: 21/21 passed.
- Typecheck and lint: passed.
- Production build: passed with no warnings/errors.
- Prisma schema: valid and approved database up to date.
- Real upload/read/update/delete/file-cleanup cycle passed.
- Viewer upload and Admin delete were rejected with `403`.
- Dependency audit remains 6 findings (2 moderate, 4 high) in transitive/framework dependencies; unsafe Next downgrade was not applied.

---

# Version 0.4.9

- Activated the approved PostgreSQL environment with restricted network and `pg_hba.conf` access.
- Applied the baseline migration and verified Prisma reports the schema up to date.
- Ran seed successfully and verified Page/Section/Card/Media records.

Date:

2026-08-02

## Stabilized

- Completed a repository-wide post-Phase 4.6 architecture, security, QA, Prisma, and UI audit.
- Made the focused test suite reliable on the current Windows/Node environment and expanded it to 20 tests.
- Added a standalone typecheck command and restored zero-warning lint.
- Separated Admin UI from the public Header/Footer chrome.
- Corrected mobile navigation accessibility for both public and Admin shells.

## Security

- Hardened Card creation validation and relation/error handling.
- Hardened Media URL, MIME, dimension, text, metadata, duplicate, concurrency, and deletion rules.
- Prevented deletion of Media referenced by Cards.
- Added baseline response security headers.

## Prisma

- Added `prisma.config.ts`.
- Removed deprecated `package.json#prisma` configuration.
- Added the baseline PostgreSQL migration and migration lock.
- Schema validation passes; live migration/seed remains blocked by unavailable PostgreSQL connectivity.

## Phase 4.7 Foundation

- Connected the Admin Media shell to real CMS Media list data.
- Added responsive search, type filtering, sorting, pagination, and load/error/empty states.
- Upload remains disabled pending an approved storage/security policy.

## Verification

- Focused tests: 20/20 passed.
- Typecheck: passed.
- Lint: passed with zero warnings/errors.
- Production build: passed.
- Prisma schema validation: passed.
- Runtime guards and security headers: passed.
- Admin responsive/accessibility QA passed at desktop and 390px.
- `npm install` audit reports 6 dependency vulnerabilities (2 moderate, 4 high); no forced fix applied.

---

# Version 0.4.8

Date:

2026-08-01

## Added

- Completed Phase 4.6 Admin Card Builder.
- Added nested Card list and detail routes under Page/Section ownership.
- Added the typed `src/lib/admin/cards` API, query, mutation, ordering, and ownership layers.
- Added reusable Card list, item, toolbar, badge, empty, detail, edit, and order components.
- Added Section Card count, previews, empty state, and management navigation.

## Behavior

- Added role-accurate Viewer, Translator, Editor, Admin, and SuperAdmin Card controls.
- Added independent EN/FA updates, `expectedUpdatedAt` conflicts, explicit media detach, and validated JSON editing.
- Added complete-collection, filter-safe, contiguous optimistic Card ordering with accessible move controls and rollback.
- Added Server Component Page -> Section -> Card ownership checks.
- Sanitized Card route internal failures and validated Card list `sectionId`.
- Renamed the Section detail dynamic folder parameter to `[sectionId]` to remove a nested Next.js route conflict without changing URLs.

## Verification

- Focused tests: 17/17 passed.
- `npm run lint`: passed with one pre-existing warning.
- `npm run build`: passed.
- Runtime unauthenticated Card API and nested-route guards returned `401` and login redirect respectively.
- `npm audit`: 6 dependency vulnerabilities (2 moderate, 4 high); no unsafe automated fix was applied.
- DB-backed CRUD/reorder and visual/mobile browser QA remain unexecuted because DATABASE_URL is unavailable.

## Scope

- Prisma schema, public website code, public routing, AI, localization, and unrelated Admin domains were unchanged.
- Admin Card changes are not consumed by the public website.

---

# Version 0.4.7

Date:

2026-08-01

## Security

- Completed Phase 4.5.1 CMS security and RBAC hardening.
- Removed trust in client-supplied identity/role headers.
- Denied unauthenticated CMS requests with `401` and permission failures with `403`.
- Restricted mock role login/session behavior to non-production with explicit `CMS_ENABLE_DEV_MOCK_AUTH=true`.
- Made Admin route-role matching prefix-aware and retained Server Component guards on nested routes.

## Ordering

- Corrected Section reorder to reject filtered, partial, duplicate, non-contiguous, invalid, and cross-page collections.
- Added serializable atomic Section reorder and canonical complete-list responses.
- Added accessible move controls and deterministic optimistic rollback/reconciliation.
- Added atomic complete-collection Card reorder scoped to one Section.

## Card API

- Added `GET /api/cms/cards/[id]`.
- Added `PATCH /api/cms/cards/reorder`.
- Hardened Card update validation, relation checks, duplicate-key mapping, translation requirements, and media detach semantics.
- Added Translator translation-only Card updates without granting structural `card.write`.
- Added `expectedUpdatedAt` stale-write protection with `409 CONFLICT`.

## Verification

- Focused tests: 11/11 passed.
- `npm run lint`: passed with one pre-existing warning.
- `npm run build`: passed.
- `npm audit`: 6 dependency vulnerabilities reported (2 moderate, 4 high); no forced dependency changes applied.

## Scope

- Public website code and behavior were unchanged.
- Admin data remains Prisma-backed; public rendering remains on the local content provider pending an approved consumption bridge.

---

# Version 0.4.6

Date:

2026-07-30

## Added

- Implemented Phase 4.5 Section Edit Mode and Ordering.
- Added admin section detail route:
	- `/admin/pages/[identifier]/sections/[id]`
- Added reusable admin components:
	- `AdminSectionEditForm`
	- `AdminSectionDetails`
	- `AdminSectionOrderEditor`
	- `AdminDeleteConfirmDialog`
- Added section mutation layer:
	- `src/lib/admin/sections/useSectionMutation.ts`

## Updated

- Upgraded `AdminSectionList` with:
	- drag handle
	- drag-and-drop reorder preview
	- save/reset order controls
	- optimistic reorder behavior
	- section detail navigation links
- Updated `AdminPageSectionsManagement` to support role-aware ordering controls.
- Expanded sections API client/types for detail update, reorder, and delete operations.

## API

- Extended `GET /api/cms/sections/[id]`.
- Extended `PUT /api/cms/sections/[id]` with section settings and translation updates plus validation.
- Added `PATCH /api/cms/sections/reorder` with ownership/id/order validation.
- Preserved `DELETE /api/cms/sections/[id]` with enforced permission checks.
- Enhanced CMS principal role mapping from admin session roles to CMS permission roles.

## RBAC Rules Applied

- Viewer: read-only.
- Editor: update/reorder allowed; delete denied.
- Admin/SuperAdmin: update/reorder/delete allowed.
- Translator: translation-only section updates; reorder/delete denied.

## Verification

- npm run build ✅
- npm run lint ✅ (with one pre-existing warning in src/integrations/ai/gateway.ts)
- Runtime RBAC probes verified expected 403 denials for restricted actions.

---

# Version 0.4.5

Date:

2026-07-30

## Added

- Implemented Phase 4.4 Section Management and Page Builder foundation (read-only).
- Added page-scoped sections route:
	- `/admin/pages/[identifier]/sections`
- Added reusable admin section components:
	- `AdminSectionList`
	- `AdminSectionCard`
	- `AdminSectionTypeBadge`
	- `AdminDragPlaceholder`
	- `AdminSectionEmptyState`
	- `AdminSectionToolbar`
	- `AdminPageSectionsManagement`
- Added new admin section data layer:
	- `src/lib/admin/sections/types.ts`
	- `src/lib/admin/sections/api.ts`
	- `src/lib/admin/sections/useSections.ts`
	- `src/lib/admin/sections/useSection.ts`

## Updated

- Enhanced page details (`/admin/pages/[identifier]`) sections panel with:
	- section count
	- section preview
	- link to page-scoped section management
- Replaced legacy mock content in `/admin/sections` with guidance to use page-scoped section management flow.

## Architecture Readiness

- Prepared section management UX and component structure for:
	- Phase 4.5 section editing
	- Phase 4.6 card builder

## Scope Compliance

- No public website UI changes.
- No public routing changes.
- No AI chat changes.
- No authentication/RBAC architecture changes.
- No localization architecture changes.
- No section editing/write actions introduced.

## Verification

- npm run build ✅
- npm run lint ✅ (with one pre-existing warning in src/integrations/ai/gateway.ts)

---

# Version 0.4.4

Date:

2026-07-30

## Added

- Implemented Phase 4.3 admin page edit mode on `/admin/pages/[identifier]`.
- Added reusable admin form components for edit workflows:
	- `AdminValidationMessage`
	- `AdminTextField`
	- `AdminTextarea`
	- `AdminSelect`
	- `AdminSwitch`
	- `AdminTabs`
	- `AdminFormSection`
	- `AdminCancelButton`
	- `AdminSaveBar`

## Updated

- Upgraded page details UI to support read-only/edit-mode toggle with:
	- EN/FA independent tab editing
	- dirty-state tracking
	- save/cancel flow
	- unsaved-change browser unload warning
- Extended admin page client API/hook flow for optimistic-safe page updates.

## API

- Extended `GET /api/cms/pages/[identifier]` to return page-level settings payload.
- Extended `PUT /api/cms/pages/[identifier]` to support edit-mode settings fields and stronger validation.
- Added duplicate slug conflict check with `409 CONFLICT` response behavior.
- Added `Setting` upsert persistence for `themeSlug`, `navigationVisible`, and `pageOrder`.

## Scope Compliance

- No public website changes.
- No public routing changes.
- No AI chat changes.
- No Prisma schema changes.
- No auth/RBAC model changes.
- No localization architecture changes.

## Verification

- npm run build ✅
- npm run lint ✅ (with one pre-existing warning in src/integrations/ai/gateway.ts)

---

# Version 0.1.0

Date:

2026-07-23

## Added

- Created project workspace.
- Created project Brain structure.
- Initialized Next.js application.
- Configured TypeScript.
- Configured Tailwind CSS.
- Installed shadcn/ui.
- Installed Framer Motion.
- Installed Lucide React.
- Initialized Git repository.

## Architecture

- Frozen architecture v1.1 created.

## Git

Initial commit:

a3a8a77

Message:

chore: initialize arandi platform architecture

---

# Version 0.1.1

Date:

2026-07-23

## Added

- Added AI_CONTEXT.md as the AI entry point for project understanding.
- Defined AI reading order for project documentation.
- Defined AI operating rules and workflow.

---

# Version 0.1.2

Date:

2026-07-23

## Updated

- Refined AI_CONTEXT.md as a reusable AI documentation framework.
- Completed Brain architecture refinement.
- Verified GitHub repository workflow.
- Completed initialization phase preparation.
- Moved project toward Phase 1 UI foundation development.

## Fixed

- Removed duplicate documentation heading in CURRENT_STATE.md.

---

# Version 0.1.3

Date:

2026-07-26

## Added

- Introduced a localized content provider abstraction for homepage and layout content access.
- Centralized content resolution behind a provider interface while keeping UI components presentation-only.

## Verified

- npm run build ✅
- npm run lint ✅

---

# Version 0.2.0

Date:

2026-07-27

## Updated

- Replaced homepage-centric content architecture with an enterprise domain content model.
- Added canonical content entities for Company, Services, Solutions, Industries, Projects, Articles, KnowledgeBase, AI, Contact, Careers, and Pages.
- Added domain source-of-truth files in src/content/domain for entity definitions and local bilingual data.
- Refactored local content adapter to project UI page sections from domain entities.
- Extended provider and adapter contracts with getDomainContent(lang) for CMS-ready integration paths.
- Kept UI contracts and visual output unchanged while moving all content sourcing behind entity-based projection.

## Verification

- npm run build ✅
- npm run lint ✅

---

# Version 0.2.1

Date:

2026-07-28

## Added

- Created a shared enterprise page component framework in src/components/page.
- Added PageContainer, PageHero, PageSection, PageTitle, PageGrid, and PageCTA as reusable building blocks for upcoming enterprise routes.
- Reused the existing Container, SectionReveal, and Button system without changing homepage components or content architecture.

## Verification

- npm run build ✅
- npm run lint ✅ (with one pre-existing warning in src/integrations/ai/gateway.ts)

---

# Version 0.4.3

Date:

2026-07-29

## Added

- Implemented Phase 3.4 CMS API layer under `src/app/api/cms`.
- Added shared API utilities:
	- `src/app/api/cms/_lib/http.ts`
	- `src/app/api/cms/_lib/validation.ts`
	- `src/app/api/cms/_lib/security.ts`
	- `src/app/api/cms/_lib/queries.ts`
	- `src/app/api/cms/_lib/mappers.ts`
- Added route handlers:
	- `src/app/api/cms/pages/route.ts`
	- `src/app/api/cms/pages/[identifier]/route.ts`
	- `src/app/api/cms/sections/route.ts`
	- `src/app/api/cms/sections/[id]/route.ts`
	- `src/app/api/cms/cards/route.ts`
	- `src/app/api/cms/cards/[id]/route.ts`
	- `src/app/api/cms/theme/route.ts`
	- `src/app/api/cms/media/route.ts`
	- `src/app/api/cms/media/[id]/route.ts`

## Implemented

- CRUD-style CMS APIs for Pages, Sections, Cards, Theme, and Media.
- Translation-aware reads using `lang=en|fa`.
- Consistent API response/error handling with centralized helpers.
- Validation guards for request payloads and query parameters.
- RBAC-ready authorization hooks for future strict access control.

## Fixed

- Resolved Prisma JSON input typing in API write/update paths using explicit `Prisma.InputJsonValue` casts.

## Scope Compliance

- No UI changes.
- No layout redesign.
- No routing changes outside CMS API endpoints.
- No AI integration changes.
- Backward compatibility preserved.

## Verification

- npm run build ✅
- npm run lint ✅ (with one pre-existing warning in src/integrations/ai/gateway.ts)

---
Added reusable enterprise page framework.

No routing changes.

No homepage changes.

No architecture changes.

---

# Version 0.2.2

Date:

2026-07-28

## Updated

- Refactored PageCTA to reuse PageTitle instead of rendering its own heading and description markup.
- Added an optional `titleAs` prop to PageCTA with a default of `h2`, aligned with the PageSection heading API.
- Extended PageHeroAction and PageCTAAction to support optional `href`, `target`, `rel`, and `icon` props while preserving existing button usage.

## Verification

- npm run build ✅
- npm run lint ✅ (with one pre-existing warning in src/integrations/ai/gateway.ts)

---

# Version 0.2.3

Date:

2026-07-28

## Added

- Added barrel export file at src/components/page/index.ts for PageContainer, PageHero, PageSection, PageTitle, PageGrid, and PageCTA.
- Added enterprise static routes:
	- /company
	- /services
	- /solutions
	- /industries
	- /projects
	- /contact

## Updated

- Implemented all enterprise route pages using the shared page framework imports from @/components/page.
- Added localized metadata generation for each new route using the existing content provider pattern.
- Updated Header navigation targets from homepage anchors to enterprise route links while preserving ?lang=en / ?lang=fa behavior.

## Verification

- npm run build ✅
- npm run lint ✅ (with one pre-existing warning in src/integrations/ai/gateway.ts)

---

# Version 0.2.4

Date:

2026-07-28

## Added

- Added src/components/page/PageBreadcrumb.tsx for reusable Home / Current Page breadcrumbs with RTL/LTR support.
- Added src/components/page/EnterprisePage.tsx as a shared template that composes PageBreadcrumb, PageHero, PageSection blocks, and PageCTA.
- Added src/lib/pageMetadata.ts to centralize shared localized metadata generation for enterprise pages.

## Updated

- Refactored enterprise route pages (company, services, solutions, industries, projects, contact) to use EnterprisePage.
- Reduced duplicated generateMetadata logic by using buildEnterprisePageMetadata and resolveLanguage helpers.
- Updated Header to use usePathname and highlight active enterprise navigation route.

## Verification

- npm run build ✅
- npm run lint ✅ (with one pre-existing warning in src/integrations/ai/gateway.ts)

---

# Version 0.2.5

Date:

2026-07-28

## Updated

- Populated all enterprise static pages with realistic enterprise content while preserving existing architecture and layout:
	- Company page now includes company overview, mission, vision, core values, and why Arandi.
	- Services page now includes six service cards: Artificial Intelligence, Software Development, Enterprise Solutions, Data & Analytics, Cloud & Infrastructure, and Digital Transformation.
	- Solutions page now includes enterprise solution cards with outcome-focused descriptions and a delivery pathway section.
	- Industries page now includes six industry cards: Oil & Gas, Petrochemical, Energy, Manufacturing, Government, and Smart Cities.
	- Projects page now includes realistic enterprise project showcase cards with impact statements.
	- Contact page now includes professional contact methods, office information, and UI-only contact form layout.

## Verification

- npm run build ✅
- npm run lint ✅ (with one pre-existing warning in src/integrations/ai/gateway.ts)

---

# Version 0.2.6

Date:

2026-07-28

## Updated

- Added centralized enterprise localization source in src/content/enterprise.ts for EN/FA route content.
- Localized header route labels through existing navigation content flow (no new localization framework).
- Refactored enterprise route pages (company, services, solutions, industries, projects, contact) to consume content-layer text for:
	- Metadata titles/descriptions
	- Breadcrumb labels
	- Hero copy and actions
	- Section headings/descriptions/cards
	- CTA copy
	- Contact form labels/placeholders/note
- Extended shared enterprise metadata helper to support content-driven metadata resolution callback.

## Verification


---

# Version 0.2.7


2026-07-28

## Updated

- Applied lightweight Phase 2.3.1 localization cleanup without architecture refactor.
- Updated header logo link to preserve active language query (`?lang=en` / `?lang=fa`).
- Localized breadcrumb Home label from existing localization content.
- Localized header aria-label suffix from existing localization content.
- Added a canonical enterprise navigation items builder in src/content/navigation.ts and reused it in Header to eliminate duplicate construction.
- Kept provider, adapters, domain models, schemas, and overall content-system boundaries unchanged.

---

# Version 0.2.8
Date:

2026-07-28
	- Typography rhythm
	- Spacing consistency
	- Elevation/shadow system

	---

	# Version 0.4.4

	Date:

	2026-07-30

	## Updated

	- Executed Phase 3.5 CMS API Validation & Integration QA (no UI/layout/routing/AI changes).
	- Validated endpoint families and methods:
	  - Pages: GET/POST/PUT/DELETE
	  - Sections: GET/POST/PUT/DELETE
	  - Cards: GET/POST/PUT/DELETE
	  - Theme: GET/PUT
	  - Media: GET/POST/PUT/DELETE
	- Validated translation behavior for EN/FA and fallback path.
	- Validated RBAC gates across all routes using forbidden-role matrix.
	- Validated request schema guards on malformed UUID and bad translation payload paths.
	- Performed backward-compatibility route smoke checks across existing website pages.

	## Fixed

	- Sanitized internal DB/Prisma operational errors in API responses to prevent leaking internal stack/invocation details:
	  - `src/app/api/cms/_lib/http.ts`
	- Corrected page validation error mapping from 500 to 400 (`BAD_REQUEST`) for invalid translation payloads:
	  - `src/app/api/cms/pages/route.ts`
	  - `src/app/api/cms/pages/[identifier]/route.ts`

	## Validation

	- npm run build ✅
	- npm run lint ✅ (with one pre-existing warning in src/integrations/ai/gateway.ts)

	## Risks / Blockers

	- Full DB-backed CRUD happy-path validation is blocked in this environment until `DATABASE_URL` is configured to a reachable PostgreSQL instance.
	- `npm run prisma:seed` currently fails because no PostgreSQL server is reachable at localhost:5432.

	## Admin Panel Readiness

	- API surface and validation contracts are ready.
	- Admin Panel implementation remains intentionally not started.

	---

	# Version 0.5.0

	Date:

	2026-07-30

	## Added

	- Implemented Phase 4.1 Admin Panel foundation under `/admin`.
	- Added complete admin route skeleton:
		- `/admin`
		- `/admin/login`
		- `/admin/dashboard`
		- `/admin/pages`
		- `/admin/sections`
		- `/admin/cards`
		- `/admin/media`
		- `/admin/navigation`
		- `/admin/theme`
		- `/admin/settings`
		- `/admin/users`
		- `/admin/forbidden`
	- Added reusable admin design-system components:
		- `AdminCard`
		- `AdminTable`
		- `AdminSidebar`
		- `AdminHeader`
		- `AdminToolbar`
		- `AdminStatCard`
		- `AdminEmptyState`
		- `AdminLoading`
		- `AdminModal`
		- `AdminConfirmDialog`
	- Added admin shell orchestration component:
		- `AdminLayoutShell`

	## Security / Auth Foundation

	- Added mock authentication/session abstraction and role model.
	- Added route-role RBAC map for all admin routes.
	- Added proxy-based admin protection under `/admin/:path*`.
	- Added role-aware forbidden route response behavior.

	## Updated

	- Replaced deprecated `middleware` convention with Next.js `proxy` convention.
	- Fixed role-denied runtime behavior to avoid experimental `forbidden()` dependency in current Next config.

	## Scope Compliance

	- No public website changes.
	- No public routing changes.
	- No AI chat changes.
	- No CMS service changes.
	- No Prisma schema changes.
	- No localization behavior changes.
	- No CRUD/forms/editors/uploads.

	## Validation

	- npm run build ✅
	- npm run lint ✅ (with one pre-existing warning in src/integrations/ai/gateway.ts)

	## Runtime Verification

	- Unauthenticated `/admin/*` access redirects to `/admin/login`.
	- Unauthorized role access returns 403 route behavior.
	- Authorized role access returns 200 on permitted routes.
	- Motion and transition timing
- Improved shared UI consistency across reusable components:
	- Button sizing, radius, hover/focus quality
	- Container and section spacing rhythm
	- Page primitives (hero, sections, grid, CTA, titles)
	- Header/footer polish
	- Home sections and chat surfaces
- Preserved layout structures, routing, localization behavior, provider/adapters/domain/schemas, AI integration, and enterprise content architecture.

## Verification

- npm run build ✅
- npm run lint ✅ (with one pre-existing warning in src/integrations/ai/gateway.ts)

---

# Version 0.2.9

Date:

2026-07-28

## Updated

- Refined and locked Phase 2.4B requirements as a Design System-only implementation scope.
- Added strict token-only rule for visual values across reusable components.
- Added controlled glassmorphism constraints (Hero, CTA, Header, AI Chat container only).
- Added reusable motion-system requirements (stagger, hover micro-interactions, easing, focus, reduced-motion, animation tokens).
- Added AI chat architecture-readiness requirements for future typing/streaming/citations/thinking/suggestions/avatar animation support.
- Added mandatory responsive validation targets (Mobile/Tablet/Desktop/Ultra-wide) and overflow checks.
- Added WCAG AA accessibility validation requirements.
- Added dark mode readiness requirements through token and variable preparation only.
- Kept architecture and content-system constraints unchanged.

## Verification

- npm run build ✅
- npm run lint ✅ (with one pre-existing warning in src/integrations/ai/gateway.ts)

---

# Version 0.3.0

Date:

2026-07-28

## Updated

- Implemented Phase 2.4B Design System Refinement and Validation through shared reusable components and global design-system primitives.
- Expanded token framework in src/app/globals.css for typography, spacing rhythm, radius tiers, elevation, motion timing, z-index, chat sizing, and responsive readiness variables.
- Standardized shared motion behavior via reusable motion primitives in src/components/ui/motion.ts and SectionReveal integration.
- Refined shared UI and layout primitives:
	- button.tsx
	- Header.tsx
	- Footer.tsx
	- PageContainer/PageSection/PageTitle/PageHero/PageCTA/PageGrid
- Refined homepage shared sections (Hero, Features) for tighter enterprise visual rhythm and typography readability.
- Prepared AI chat reusable component architecture for future streaming-focused capabilities by adding UI scaffolding for:
	- message state (ready/thinking/streaming)
	- citation rendering slots
	- suggestion chips
	- animated avatar states
	- tokenized chat shell and scroll/empty-state utilities
- Kept architecture, routing, localization architecture, provider/adapter/domain/schema, and AI integration unchanged.

---

# Version 0.5.1

Date:

2026-07-30

## Updated

- Implemented Phase 4.2 Admin Page Management as read-only CMS integration.
- Replaced mock data in `/admin/pages` with live data from CMS APIs.
- Added `/admin/pages/[identifier]` read-only detail screen.
- Added React Query-based CMS data hooks:
	- `usePages()`
	- `usePage()`
- Added read-only list features:
	- search
	- sorting
	- pagination
	- status filter
	- language filter
	- loading/empty/error states
- Added responsive table/card rendering for pages management.

## Added

- New reusable admin components:
	- `AdminSearchBar`
	- `AdminFilterBar`
	- `AdminPagination`
	- `AdminStatusBadge`
	- `AdminLanguageBadge`
	- `AdminPageCard`
	- `AdminDescriptionList`
	- `AdminSkeleton`
	- `AdminPagesManagement`
	- `AdminPageDetails`
	- `AdminQueryProvider`

## Scope Compliance

- No public website changes.
- No public routing changes.
- No AI chat changes.
- No Prisma schema changes.
- No CMS service changes.
- No localization/auth/RBAC changes.
- No CRUD actions implemented.

## Validation

- npm run build ✅
- npm run lint ✅ (with one pre-existing warning in src/integrations/ai/gateway.ts)

## Verification

- npm run build ✅
- npm run lint ✅ (with one pre-existing warning in src/integrations/ai/gateway.ts)

---

# Version 0.3.1

Date:

2026-07-28

## Updated

- Completed Phase 2.4C final UI polish and mobile completion using shared reusable components only.
- Implemented full responsive Header mobile navigation behavior with:
	- hamburger menu on mobile/tablet
	- animated slide-in menu
	- active-route highlighting
	- `?lang=` preservation across enterprise links
	- logo language preservation
	- body scroll lock while menu is open
	- Escape key close
	- keyboard focus trap in menu dialog
- Refined Header enterprise polish (spacing, hover states, sticky shadow transition, premium glass consistency).
- Refined Hero visual quality without layout redesign (gradient/background tuning, subtle floating accents, improved CTA spacing).
- Refined Footer hierarchy and spacing for stronger enterprise appearance while preserving content model.
- Strengthened reusable CTA visual emphasis through premium surface/gradient polish.
- Polished chat UI visuals only (no AI architecture changes):
	- bubble surfaces
	- avatar state styling
	- typing indicator surface
	- input area focus/hover quality
	- motion polish

## Verification

- npm run build ✅
- npm run lint ✅ (with one pre-existing warning in src/integrations/ai/gateway.ts)

---

# Version 0.3.2

Date:

2026-07-29

## Fixed

- Corrected the final Phase 2.4C responsive Header defect where desktop navigation could appear below the header at non-desktop widths.
- Moved the desktop navigation cutoff to `xl`; tablet and mobile now show only logo, language switch, and hamburger control.
- Added overflow containment to the off-canvas mobile drawer wrapper so a closed drawer cannot create horizontal page overflow.

## Verified

- Browser validation at 390px, 900px, and 1440px confirmed the required responsive navigation behavior.
- Mobile drawer validation confirmed `?lang=` preservation, body scroll lock, focus trap entry, Escape close, and focus return to the trigger.
- npm run build ✅
- npm run lint ✅ (with one pre-existing warning in src/integrations/ai/gateway.ts)

---

# Version 0.4.0

Date:

2026-07-29

## Added

- Added Phase 3.1 Enterprise CMS architecture foundation documentation (architecture-only).
- Added conceptual CMS layered architecture covering presentation, application/content orchestration, domain entities, and infrastructure repositories.
- Added conceptual enterprise database model for pages, versions, sections, blocks, cards, themes, localization, media, and RBAC.
- Added multilingual architecture design including locale fallback policy and translation status tracking.
- Added reusable Page Builder entity model (`Page -> Section -> Block`) with schema-versioning strategy.
- Added generic Card system architecture with typed card variants and shared card contracts.
- Added Theme architecture model mapped to existing runtime token variables for zero-UI-change compatibility.
- Added Roles & Permissions (RBAC) architecture with enterprise role set and permission groups.
- Added backward compatibility strategy preserving existing provider/adapter contracts.

## Scope Compliance

- No admin panel UI implemented.
- No page layout changes.
- No UI redesign.
- No AI integration changes.

## Verification

- npm run build ✅
- npm run lint ✅ (with one pre-existing warning in src/integrations/ai/gateway.ts)

---

# Version 0.4.1

Date:

2026-07-29

## Added

- Implemented Phase 3.2 CMS foundation code under `src/content/cms`.
- Added canonical CMS models for:
	- page/page version
	- page section/page block
	- generic card
	- translation
	- theme
	- navigation
	- media
	- roles and permissions (RBAC)
- Added repository interfaces and local repository implementation.
- Added service layer with locale fallback resolution, page retrieval, page builder assembly, navigation/theme resolution, and translation retrieval.
- Added local mapping layer from existing domain content to CMS entities to preserve compatibility.

## Updated

- Extended `ContentProvider` with additive `getCmsService()` API without breaking existing methods.
- Extended `src/content/index.ts` exports with CMS service/contracts for incremental adoption.

## Scope Compliance

- No UI changes.
- No layout redesign.
- No routing changes.
- No admin panel implementation.
- No AI integration changes.
- Existing pages preserved through backward-compatible additive integration.

---

# Version 0.4.2

Date:

2026-07-29

## Added

- Implemented Phase 3.3 CMS Database Foundation with Prisma + PostgreSQL.
- Added `prisma/schema.prisma` with complete models:
	- Theme
	- Language
	- Page
	- PageTranslation
	- Section
	- SectionTranslation
	- Card
	- CardTranslation
	- Navigation
	- NavigationTranslation
	- Media
	- Setting
- Added UUID primary keys and `createdAt`/`updatedAt` audit fields for all listed entities.
- Added translation-table architecture using `languageCode` (`en`, `fa`) to avoid page duplication.
- Added Prisma seed script (`prisma/seed.ts`) seeded from current local CMS/domain content for compatibility.
- Added Prisma runtime/generate/seed tooling:
	- `@prisma/client`
	- `prisma`
	- `tsx`
	- npm scripts: `prisma:generate`, `prisma:seed`

## Updated

- Added Prisma-backed CMS repository implementation:
	- `src/content/cms/prismaRepositories.ts`
	- `createPrismaCmsRepositories(...)`
	- `loadCmsCollectionFromPrisma(...)`
- Added async Prisma service bootstrap in `src/content/cms/factory.ts`:
	- `createPrismaCmsContentService(...)`
- Refactored local repository module to expose reusable collection-backed constructor:
	- `createCmsRepositoriesFromCollection(...)`
- Extended CMS/content barrel exports for Prisma repository/service constructors.

## Scope Compliance

- No UI changes.
- No layout redesign.
- No routing changes.
- No admin panel implementation.
- No AI chat modifications.
- Backward compatibility preserved.

## Verification

- npm run build ✅
- npm run lint ✅ (with one pre-existing warning in src/integrations/ai/gateway.ts)

## Verification

- npm run build ✅
- npm run lint ✅ (with one pre-existing warning in src/integrations/ai/gateway.ts)
