# Current State

## WordPress Scrollwise Canvas — 2026-08-19

- The isolated `copilot/scrollwise-canvas-port` remote branch is based exactly on `webwordpress` at `fd2571f`; `main`, `scrollwise`, and `webwordpress` were not modified.
- The theme now independently recreates the complete visible Node.js Scrollwise contract in PHP/CSS/plain JavaScript: canonical copy, chapter roles and heights, sticky Canvas, bounded current-plus-two preloading, cinematic camera, episode-aware handoffs, crossfades, veil, Header, narrative menu, highlights, summary, and footer.
- The theme-level `?lang=en|fa` resolver now renders live English/LTR or Persian/RTL without altering the WordPress locale, database, menus, Customizer, or plugins.
- Before this deployment, the active theme and Nginx vhost were backed up at `/srv/arandi-wordpress/backups/scrollwise-node-parity-20260819T130951Z`. Only `front-page.php`, `style.css`, and `assets/scrollwise.js` were installed with `www-data:www-data` and mode `0644`.
- Server PHP lint, Nginx syntax, Home/English/Contact/Articles HTTP checks, JavaScript syntax, and diff whitespace checks passed.
- Live Chrome QA passed at 1280×900 and 390×844: one `main`, ten chapters, a real Canvas, no horizontal overflow, zero console/page errors, camera movement, handoff crossfade, deterministic reverse scroll, mobile narrative menu, English/LTR, static reduced-motion scenes, and preserved non-Scrollwise WordPress chrome on `/company/`.

## WordPress Edition — 2026-08-18

- Branch `webwordpress` is an independent WordPress delivery branch created directly from `main`; it does not modify the Next.js runtime, its Prisma/PostgreSQL database, or the `scrollwise` branch.
- VPS WordPress is installed under `/srv/arandi-wordpress/site` with the separate local MariaDB database `arandi_wordpress`; its credential file is root-readable only and no connection value is committed.
- GeneratePress 3.6.1, `Arandi Core`, `Arandi Default Enterprise`, and `Arandi Scrollwise` are installed. The Default Enterprise child theme is active; both themes use shared WordPress editorial content and can be selected from Appearance → Themes.
- Nginx now serves the WordPress site for `arandi.ir` over port 80. The prior Next.js vhost is copied to `/etc/arandi-platform/nginx-backups/arandi-platform-internal.before-wordpress-20260818`, and the Next.js release/service remains untouched for rollback.
- Direct HTTP, PHP lint, WordPress checksums, active-plugin/theme checks, default and Scrollwise live render checks, and the public browser check passed. `arandi.ir` is currently HTTP-only: trusted public TLS cannot be issued while the origin remains a private `172.20.190.16` address without publicly reachable ACME validation or DNS-API credentials.

Last verified: 2026-08-15

## Current Phase

Phase 10 — Quality and Production

Status: the application and production-like VPS staging boundary are validated. Release `20260803T093000Z-phase10-r6` is active behind loopback Nginx without replacing the existing WordPress public server block. Public production cutover remains unapproved until public DNS, a trusted renewable certificate, provider credentials, external alerting/off-host backup, and observed GitHub CI are available.

Local development verification on 2026-08-09: the public mobile navigation is interactive again at `http://127.0.0.1:3000/?lang=fa` and follows logical content-start placement (right in Persian/RTL, left in English/LTR). Next.js development assets/HMR had rejected the explicit loopback origin, preventing Client Component hydration; `allowedDevOrigins` now permits only `127.0.0.1`, and the development-only CSP exceptions required by Next.js tooling do not apply to production.

Branding update on 2026-08-10: supplied Arandi symbol and lockup assets are served locally from `/brand/`; the compact symbol is used in the public Header and favicon metadata, while the lockup is used in the Footer and Organization JSON-LD. PostgreSQL Media records and the public `site.logo` setting point to the supplied lockup.

Company-profile content update on 2026-08-11: the supplied `Arandi_Company_Profile_Final.docx` was structurally extracted and mapped into Published PostgreSQL/CMS content through the idempotent `scripts/import-company-profile.ts` importer, exposed as `npm run content:import-profile`. The public Home, Company, Services, Solutions, Industries, Projects, and Contact pages now have validated EN/FA copy based on the profile; the service portfolio has seven capabilities, industries have six target sectors, and projects have four profile-backed entries. Public `site.company` and `site.contact` settings now use the approved brand tagline and contact information. English page copy is a faithful translation of the Persian profile where no English body copy was supplied. The document could not be rendered for visual inspection because LibreOffice is absent locally; its text structure was extracted successfully and public route plus headless-Chrome checks verified the resulting public content.

Final content audit on 2026-08-11: the CMS bridge verifiers were updated from obsolete sample-copy parity to the approved company-profile identifiers and content shape. The profile importer, 56 EN/FA public collection/detail routes, both brand assets, enterprise/fixed-page Published filters, 44 focused tests, strict TypeScript, lint, 24 Chrome QA checks (390/768/1280px), and the 56-route production build all passed.

Stakeholder content acceptance on 2026-08-11: the supplied Persian company-profile content and its English translation were explicitly approved. This closes the final content-review gate for Phase 10; public cutover is still separately blocked by the infrastructure and provider gates stated below.

Public presentation enhancement on 2026-08-11: Header brand treatment is larger and responsive; the Footer now renders contact details, a Google Maps link, and Instagram/Telegram/WhatsApp/Bale icons. Social URLs have a structured Admin Settings editor, strict provider-host HTTPS validation, and public cache invalidation; icons remain visibly disabled until actual profile URLs are entered. The four published project details now expose client/type, industry, overview, scope, technologies/capabilities, and outcome in EN/FA from the company profile through a repeatable importer.

InspectB remediation on 2026-08-12: public entrance motion no longer uses blur, the Header uses an eager local brand asset, the mobile menu has one close control, and desktop/mobile direction remains RTL-right for Persian and LTR-left for English. Home now presents a source-backed delivery-evidence section using the four published projects, seven services, and six industries; project Cards can display Media selected from the existing Admin Media Library, and the Admin Card editor provides a human-readable image selector rather than requiring a Media UUID. Projects, document lists, Search metadata, Contact, and Footer received corresponding presentation refinements. Footer now includes localized quick links, one rendered value per contact method, a safe Google Maps link, and the governed social-link controls. No new stock, AI-generated, customer-logo, or testimonial asset was introduced.

Generated project-media update on 2026-08-12: with stakeholder authorization, four original, unbranded illustrative project-cover images were generated and added under `public/media-generated/`. `scripts/import-generated-project-media.ts` registers them as Prisma Media records, attaches them to the four Published Project Cards, and is exposed as `npm run content:import-generated-project-media`. Every generated cover remains replaceable through Admin Card image selection / the Admin Media Library; the image captions explicitly identify them as illustrative generated covers rather than evidence of a client site. The same importer sets only Instagram to `https://instagram.com/arandi.io` and preserves any later Telegram, WhatsApp, or Bale values. A 9.966-second silent WebM hero background was also created from original generated imagery, registered as `video/webm` Media, and enabled by the governed public `site.heroMedia` Setting. Admin Settings provides a structured Hero background video editor selecting a registered video and poster Media asset; the public client honors `prefers-reduced-motion` and keeps the poster/gradient fallback. It is decorative, unbranded, and does not represent a specific customer facility.

`HEAD` and `origin/main` point to commit `a6325fb` (`complete contents - 14050520`). The earlier Phase 4.7/stabilization changes and the approved content integration are now committed; the next Git gate is observing CI for the exact reviewed commit before public cutover.

Assistant entry-point update on 2026-08-12: every public informational route now has a bilingual fixed floating chat launcher. Its locally held, bounded input transfers visitors to `/assistant?lang=en|fa` through `sessionStorage` rather than the URL, then sends exactly once through the existing same-origin, rate-limited, Published-content-grounded AI endpoint. `/assistant` reuses the governed Home Chat content and is marked `noindex, follow`; it omits the floating launcher itself. The launcher is also omitted from Admin, account, and recovery surfaces. The existing Home chat remains independently governed by its Admin Section enabled switch: Home now loads complete section data and applies the enabled flag at rendering time, so disabling Chat no longer makes the page data invalid. No AI provider credential, runtime setting, API boundary, or Prisma schema was changed.

Public-theme expansion on 2026-08-15: the original `default` public appearance remains Arandi Classic and a second source-owned `arandi-pro` Enterprise Glass appearance is now available. The public page theme is resolved server-side from the single canonical `Theme.isDefault` record; Admin is deliberately outside this wrapper. SuperAdmin/Admin can edit constrained tokens, set a 30-minute HttpOnly/SameSite preview cookie, and publish exactly one global public theme through `/api/cms/themes`, `/activate`, and `/preview`. The former public `theme.default` Setting is no longer editable and no page-level `themeSlug` is treated as a runtime override. Migration `20260815120000_theme_public_variants` adds a partial unique default constraint and the `Arandi Pro` row without altering existing custom themes.

## Verified Architecture

- Next.js 16 App Router, React 19, strict TypeScript, and Tailwind CSS 4.
- Public Home, Company, Services, Solutions, Industries, Projects, Contact, and shared bilingual Header/Footer chrome now read validated Published content, Navigation, and allowlisted public settings from Prisma through cached server-only adapters.
- Article, Knowledge, and Legal lists/details plus Services/Solutions/Industries/Projects detail routes are Published-only and bilingual.
- Public search projects only bounded Published Page/Section/Card text and never returns Prisma identifiers or Admin payloads.
- The company-profile importer changes only Published CMS Page/Section/Card translations and the allowlisted `site.company`/`site.contact` settings; it does not alter Prisma schema, Admin permissions, infrastructure, contact-submission data, or secrets.
- Contact submissions persist through a bounded same-origin endpoint with consent, honeypot, throttling, replay deduplication, hashed client identifiers, and explicit delivery state.
- Admin CMS uses React Query against `/api/cms/*`; APIs persist through Prisma/PostgreSQL.
- Validated Home/Page, Section, Card, Navigation, and company-setting mutations invalidate bounded public cache tags immediately.
- Admin routes use a dedicated shell and API permission checks remain the final authorization boundary.
- Development mock auth is opt-in and unavailable in production.
- Production password authentication is active. OTP and recovery routes/UI are active but delivery remains fail-closed until verified SMS.ir/SMTP transports are configured.

## Completed Admin/CMS Scope

- Page list/detail/edit.
- Permission-aware Page creation with nine allowlisted templates: Standard, Service, Solution, Industry, Project, Article, Knowledge, Legal, and Contact.
- Transactional EN/FA Page plus starter-Section creation; every new Page is forced to Draft.
- Canonical safe slug/route validation and database uniqueness for both fields.
- Section list/detail/edit/reorder/delete.
- Card list/detail/edit/reorder/delete.
- Independent EN/FA content translation editing.
- Viewer, Translator, Editor, Admin, and SuperAdmin RBAC enforcement.
- Complete-collection atomic reorder and optimistic concurrency.
- Card Media attach/detach and dependency-aware deletion.
- Card image selection from the existing Admin Media Library for editors with the necessary Card permission; public project Cards and project detail pages render only the selected safe Media URL.
- Focused API/input/security tests.
- Prisma-backed Navigation list/create/edit/translation/reorder/delete with independent EN/FA labels.
- Multi-theme public appearance management backed by `/api/cms/theme` plus `/api/cms/themes`, with private preview and explicit global publish.
- Governed Settings editor plus public allowlisted settings endpoint.
- Database-session CSRF enforcement across every CMS mutation, with shared Admin client header injection.

## Phase 4.7 — Media Library

Application layer validated and architecture-approved:

- PostgreSQL-backed Media list with search, type filter, sorting, pagination, and responsive table/card states.
- Admin/SuperAdmin image upload and metadata edit.
- SuperAdmin-only delete; referenced Media returns `409`.
- JPEG, PNG, and WebP only, detected by file signature rather than declared MIME.
- Maximum upload size 10 MB, maximum dimension 12,000px, and maximum 40 million pixels.
- Quarantine before processing, optional `clamdscan`, and production fail-closed scanning policy.
- Sharp re-encoding strips metadata and writes collision-resistant UUID filenames.
- Stable root-relative `/media/*` URLs.
- Local Node Route Handler for development; production boundary reserved for Nginx filesystem serving.
- Staged filesystem deletion with rollback when database deletion fails.
- Storage directory ignored by Git; no binary upload or secret is committed.

## Phase 5 — Identity Foundation

Implemented and validated:

- Additive Prisma models for User, Role, UserRole, UserCredential, AuthSession, OtpChallenge, PasswordRecoveryToken, SecurityEvent, and ServiceRequest.
- Migration `20260802120000_identity_foundation` applied to the approved database.
- Six system roles seeded without creating a default user or password.
- Iranian phone normalization to canonical `+98` E.164 form and bounded email normalization.
- Argon2id password hashing with 64 MiB memory cost and fail-closed verification.
- 256-bit opaque session/recovery/CSRF token generation and SHA-256 storage hashes.
- HMAC-SHA-256 OTP hashing with a required server-only pepper.
- Strict SameSite, HttpOnly session-cookie and double-submit CSRF primitives.
- Database session create/read/revoke with expiry, user status, role, and persistent permission resolution.
- Optional IP/user-agent values are HMAC-hashed before persistence.
- CMS APIs and Admin Server Component guards now accept trusted database sessions while preserving gated development mock sessions.
- Proxy performs only optimistic token-shape checks and does not query the database.
- SMS and email gateway boundaries fail closed while provider transports are unconfigured.
- Production password login service and `/api/auth/password` route with same-origin enforcement, generic errors, 4 KB body limit, IP-window throttling, five-attempt/15-minute credential lockout, security events, and secure session/CSRF cookies.
- `/api/auth/logout` requires matching CSRF cookie/header, revokes the database session, and expires both cookies.
- Production Admin login form preserves a safe internal `next` destination and has desktop/mobile responsive QA.
- One-time `npm run auth:bootstrap` command creates the first SuperAdmin only from runtime environment input and refuses once a SuperAdmin exists.
- OTP request/verify routes with non-enumerating request responses, 60-second cooldown, five-per-hour request cap, five verification attempts, five-minute expiry, HMAC-only persistence, and atomic single-use consumption.
- Recovery request/consume routes with generic request responses, 256-bit single-use tokens, 30-minute expiry, Argon2id password replacement, other-link consumption, and full session revocation.
- Recovery and password/OTP login UI, including immediate removal of recovery tokens from the visible URL and no-referrer/no-index metadata.
- Customer `/account` portal with persistent-session profile access plus owner-scoped service-request create/list APIs and responsive UI.
- Customer writes require database-session permissions and matching CSRF cookie/header; client-supplied ownership identifiers are ignored and internal ownership IDs are not exposed.
- `npm run auth:verify` performs a self-cleaning live PostgreSQL verification of OTP, recovery, session revocation, CSRF, service-request ownership, and replay protection.
- Admin User list/search/status/role filters backed by Prisma, with read access for Admin and SuperAdmin.
- SuperAdmin-only persistent User creation, identifier/status/role updates, suspension, and explicit session revocation; every write requires CSRF and a non-mock database session.
- Last-active-SuperAdmin, self-suspension, and self-demotion lockout protections.
- Minimized security-event API/UI that omits metadata, IP hashes, session hashes, credential fields, and other secret-bearing data.
- `npm run admin:verify` validates SuperAdmin success, Admin/Viewer denial, CSRF rejection, suspension/revocation, self-demotion protection, audit minimization, and full cleanup.

Runtime database authorization checks:

- SuperAdmin database session Media read: `200`.
- Viewer database session Media write: `403`.
- Revoked database session Media read: `401`.
- Temporary runtime users/sessions were deleted after validation.
- Password runtime:
  - five invalid attempts: five `401` responses and credential lockout
  - correct password while locked: `401`
  - successful login after controlled unlock: `200` with session and CSRF cookies
  - CSRF logout: `200` and zero active sessions
- OTP/recovery/customer runtime verifier:
  - unknown-account OTP enters cooldown state without gateway delivery
  - five failed OTP attempts persist and prevent later acceptance
  - valid OTP is accepted once and replay is rejected
  - service-request write without CSRF is `403`
  - owner-scoped service-request create/list succeeds without exposing `userId`
  - recovery changes the password, consumes other recovery links, revokes all sessions, and rejects replay
  - all temporary users, requests, sessions, challenges, and tokens are removed
- Admin identity runtime verifier:
  - Admin read `200`; Viewer read `403`
  - Admin mutation and missing-CSRF mutation `403`
  - SuperAdmin create/update/revoke succeeds
  - suspension revokes every active target session
  - self-demotion returns `409`
  - audit response omits metadata and client hashes
  - post-verification User 0 and SecurityEvent 0

## Prisma and Database

- `prisma.config.ts`, baseline migration, schema, and seed are present.
- Approved PostgreSQL is reachable using the ignored environment configuration.
- Migrations `20260802000000_initial_cms`, `20260802120000_identity_foundation`, `20260803090000_unique_page_route`, and `20260803130000_contact_submissions` are applied.
- `prisma migrate status` reports all four migrations and the schema up to date.
- Seeded baseline verified: Page 10, Section 15, Card 23, Media 1, User 0, SecurityEvent 0.
- No database credential or connection value is stored in source-controlled documentation.

## Validation

- Focused automated tests: 35/35 passed.
- `npm run typecheck`: passed.
- `npm run lint`: passed with zero warnings/errors.
- `npm run build`: passed with no warnings/errors.
- `npx prisma validate`: passed.
- `npx prisma migrate status`: database up to date.
- Real Media runtime cycle:
  - upload `201`
  - stored asset `200 image/png`
  - metadata update `200`
  - delete `200`
  - deleted asset `404`
- Runtime RBAC:
  - Viewer upload `403`
  - Admin delete `403`
  - SuperAdmin upload UI present
  - Viewer upload UI absent
- Browser QA:
  - desktop 1280px, tablet 768px, and mobile 390px
  - one `main` landmark and no horizontal document overflow
  - English/LTR and Persian/RTL direction behavior
  - upload dialog stays within the mobile viewport
  - dialog semantics, initial focus, body scroll lock, Escape close, and focus return verified
  - recovery and customer-login flows at desktop 1280px and mobile 390px
  - customer unauthenticated redirect, one `main`, one form, and no horizontal overflow verified
  - Users/security read-only mock QA at 1280px and 390px, one `main`, no document overflow
  - Navigation at 1280px/390px, six seeded items, bounded modal, body lock, and translation-only controls
  - Theme desktop editor and Settings mobile cards, one `main`, no document overflow
- Navigation runtime:
  - Viewer read `403`; Translator read/translation `200`; Translator structural update `403`
  - missing-CSRF create `403`
  - Editor create and complete reorder `200/201`; partial reorder `400`
  - Admin delete `200`; original six-item order restored and all temporary records removed
- Theme/Settings runtime:
  - active CSS `url(...)` rejected `400`
  - valid constrained theme update `200` and original theme restored
  - secret-like setting key and nested `apiKey` rejected `400`
  - private secret-like setting redacted in Admin and excluded from public endpoint
  - original values restored and all temporary records removed
- Page-template runtime:
  - Viewer list `200`; Translator create `403`; missing-CSRF create `403`
  - incomplete bilingual input `400` with no Page/Section count change
  - Editor Article create `201` as Draft with two translations and two bilingual starter Sections
  - Draft lookup through the future public query returns no result
  - duplicate slug and route each return `409`
  - Admin delete `200`; baseline Page/Section counts restored and temporary users removed
- Page creation browser QA:
  - Editor desktop list exposes Create Page without document overflow
  - 390px modal remains within the viewport, locks body scroll, and scrolls internally
  - all nine templates and ten bilingual/SEO fields remain reachable
  - Translator list does not expose Page creation
- Published Home bridge:
  - production render exposes the safe source marker `prisma` in EN and FA
  - Page, Section, Card, Navigation, and public company setting data is selected through server-only Prisma reads
  - Page Draft, disabled Sections, Draft Cards, missing locale translations, and incomplete chrome settings fail closed
  - automatic local fallback is forbidden in production; local fallback requires an explicit development-only source selection
  - Home Draft DOM renders 404 with no public content/source marker while `/services` remains available through independent chrome data
  - restoring Published returns Home to Prisma-backed output
  - EN/LTR, FA/RTL, desktop, and 390px mobile pass with one `main` and no horizontal overflow
- Published enterprise collection bridge:
  - Services, Solutions, Industries, and Projects map validated Page/Section/Card records back to their existing public component contracts
  - bilingual seed structures are created only when absent, so later Admin edits are not overwritten by repeat seed runs
  - exact EN/FA output-shape parity passed for all four routes
  - Page Draft, disabled Section, and Draft Card exclusion passed in the live PostgreSQL verifier
  - controlled Services Draft DOM rendered 404 with no source marker; restoring Published returned six Prisma-backed Cards
  - production EN/FA QA passed all eight route/locale combinations with correct LTR/RTL, one `main`, no 404, and no horizontal overflow
  - 390px Persian Solutions QA passed with seven content articles and no horizontal overflow
- Published fixed-page bridge:
  - Company and Contact map validated bilingual Page/Section payloads back to their exact existing public component contracts
  - contact coordinates are read independently from the allowlisted public `site.contact` Setting
  - repeat seeds preserve existing Setting values and create fixed Pages only when absent
  - exact EN/FA output parity, Page Draft exclusion, disabled Section exclusion, and contact-setting completeness passed
  - Company and Contact desktop EN/FA QA passed with Prisma source, correct direction, one `main`, and no overflow
  - Persian Contact at 390px passed with one presentation-only form, five fields, and no overflow
  - no contact submission endpoint, persistence, or delivery behavior was introduced in Phase 7
- Phase 8 public content completion:
  - Published Article, Knowledge, and Legal list/detail routes use a bounded `hero` plus plain-text `richText` contract
  - raw HTML and unsupported Section types fail closed
  - three create-if-absent bilingual starter documents provide real initial Article, Knowledge, and Privacy content without overwriting Admin edits
  - Services, Solutions, Industries, and Projects Cards now link to bilingual Published detail routes
  - search is discoverable from Header, preserves query parameters across locale switching, and searches only Published exact-locale content
  - custom bilingual 404 includes automatic `noindex`
  - controlled Article Draft DOM rendered 404 with no source marker; restoring Published returned the Prisma-backed document
  - desktop EN/FA, 390px mobile, and 768px tablet passed one `main`, one `h1`, correct direction, no UUID leakage, and no horizontal overflow
- Phase 8 Contact submission:
  - purpose-built `ContactSubmission` persistence stores bounded enquiry fields, consent time, operational status, and delivery state
  - raw IP and User-Agent values are never persisted; optional values are HMAC-hashed with the required server pepper
  - same-origin JSON-only requests, an 8 KB body limit, honeypot, 60-second cooldown, five-per-hour IP limit, and hour-bucket replay deduplication are active
  - provider-unavailable delivery preserves the accepted database record and records `unavailable` without claiming email success
  - public responses omit delivery state, hashes, provider metadata, and internal IDs
  - Admin/SuperAdmin have a minimized latest-100 read view that omits client hashes and provider metadata
  - production browser QA at 390px Persian returned a tracking reference, cleared the form, kept one `main`, and had no overflow
  - controlled browser record was verified as hashed plus `unavailable`, then deleted; ContactSubmission baseline is 0

## Phase 9 — AI and Knowledge

Application layer validated and architecture-approved:

- `/api/ai/chat` is a Node.js same-origin, JSON-only, 8 KB-bounded public mutation.
- Chat history is session-local and restricted to eight user/assistant messages, 1,000 characters per message, and 6,000 characters total; clients cannot submit system prompts, provider names, models, context IDs, or secrets.
- The Prisma context query independently requires Published Pages, enabled Sections, Published Cards, and an exact EN/FA translation.
- The AI context projection excludes Prisma identifiers, private Settings, editorial payload/style/data JSON, audit timestamps, contact submissions, users, and security records.
- Retrieval ranks bounded query terms, selects at most eight sources, and caps supplied context at 12,000 characters.
- Unsupported queries return an explicit localized no-answer without invoking the provider.
- The OpenAI integration uses the Responses API with `store: false`, streaming text deltas, low reasoning, bounded output, a 45-second timeout, and a privacy-preserving HMAC safety identifier.
- Published context is treated as untrusted data in the provider instruction, and bracket citations map only to locale-preserving internal public routes.
- Browser cancellation aborts the server request and upstream provider signal.
- The endpoint hashes the client identifier before retaining a bounded in-process rate-limit key; the limit is ten requests per minute per application process.
- `ai.runtime` is a private Admin-editable Setting containing only the allowlisted `openai` provider and safe model name. The API key remains environment-only and nested secret-like fields are rejected.
- Migration `20260803160000_ai_runtime_setting` is applied; five migrations are current.
- Deterministic PostgreSQL/provider-stub verification found two Published citations, called the Stub exactly once for the supported query, and avoided the provider for the unsupported query.
- Focused suite is 42/42; strict typecheck, zero-warning lint, Prisma validate/status, and the 54-entry production build pass.
- Persian production-browser QA passed desktop semantics, explicit provider-unavailable UI, and 390px RTL layout without horizontal overflow.

## Phase 10 — Verified Quality and VPS Staging

- Next.js is 16.2.12 with React 19.2.8; both full and production-only `npm audit` report zero vulnerabilities.
- Canonical/EN-FA alternate metadata, Open Graph data, Organization JSON-LD, Published-only sitemap, and Admin/API-blocking robots rules are active.
- CSP, COOP, CORP, frame denial, nosniff, referrer policy, permissions policy, and powered-by suppression are active.
- Health endpoints, standalone output, a least-privilege systemd service, loopback Node/Nginx staging, and a loopback self-signed TLS validation listener are active.
- PostgreSQL 16 listens on loopback plus the explicitly restricted development interface. The application role is non-superuser and all five migrations are current.
- Nginx Media serving, ClamAV scan, daily checksummed database/Media backup, isolated restore verification, recurring readiness monitoring, bounded journald retention, and release rollback were exercised.
- SSH accepts public keys only; root password authentication, keyboard-interactive authentication, X11, agent forwarding, and remote TCP forwarding are disabled. Local forwarding remains available for staging QA.
- JSON mutations use bounded reads; public/auth mutations enforce same-origin through the configured public origin behind the reverse proxy. CMS and authenticated customer/Admin mutations retain database-session CSRF and RBAC enforcement.
- The active systemd unit scores `3.0 OK` in `systemd-analyze security`.
- The focused suite is 44/44; typecheck, zero-warning lint, AI verifier, production build, Prisma status, dependency audits, and diff checks pass.
- Production-like QA passed 24 EN/FA route/viewport cases at 390/768/1280 px with zero Axe violations, no horizontal overflow/browser errors, and load/transfer budgets well inside thresholds.

## Security State

- CMS APIs reject anonymous and spoofed client identity.
- Every database-session CMS mutation requires the session-bound CSRF cookie/header pair.
- Media validation rejects SVG and unsupported file signatures.
- Images are decoded and re-encoded before publication.
- Production requires malware scanning unless an explicit operational override is set.
- Baseline response headers include CSP, COOP/CORP, nosniff, frame denial, strict referrer policy, and restrictive permissions policy.
- Direct application Sharp was upgraded to 0.35.3.
- Full and production-only dependency audits report zero known vulnerabilities.

## Explicit Boundaries and Remaining Risks

- Public CMS consumption is implemented for Home, shared chrome, and all six fixed public page bodies.
- SMS.ir and SMTP transports are not implemented because verified provider endpoint/template/sender configuration is unavailable; routes fail closed and no delivery claim is made.
- No permanent SuperAdmin or customer is seeded; first Admin bootstrap requires explicit runtime credentials.
- Real SMTP, SMS.ir, and OpenAI activation remain pending because no approved provider credentials/configuration were supplied.
- Article, Knowledge, Legal, and Contact are constrained Page templates, not parallel persistence models; their public list/detail and submission application layers are implemented.
- Public DNS has no public A/AAAA record. A trusted ACME certificate, renewal timer, public 80-to-443 redirect, and final Nginx cutover therefore remain blocked; staging TLS was exercised but is not a production certificate.
- The current WordPress site remains available on its original port-80 server block and was not modified.
- Health monitoring and bounded log retention are active, but no external alert destination is configured.
- Local backup/restore is validated; encrypted off-host replication remains unconfigured.
- The CI workflow exists but cannot be claimed as executed until the worktree is intentionally committed/pushed and GitHub Actions is observed.
- The current AI rate limiter is intentionally single-process memory state; a shared store is required before horizontal scaling or multi-worker deployment.
- Admin interface strings remain English; EN/FA content fields and document direction are supported.
- The current worktree contains intentional uncommitted project changes and must not be overwritten or reset.

## Approval State

- Phase 4.6 stabilization: verified.
- Phase 4.7 application architecture: approved.
- Phase 4.7 production infrastructure activation: deferred to Phase 10 deployment.
- Phase 5 application architecture: approved.
- Phase 6 Admin CMS architecture: approved, including Navigation/Theme/Settings and constrained Page templates.
- Phase 7 Home/shared-chrome bridge slice: architecture-approved.
- Phase 7 Services/Solutions/Industries/Projects bridge slice: architecture-approved.
- Phase 7 Company/Contact bridge slice: architecture-approved.
- Phase 7 Published CMS-to-public bridge: architecture-approved.
- Phase 8 Published documents, organization details, search, and 404 slice: architecture-approved.
- Phase 8 Contact persistence/application slice: architecture-approved.
- Phase 9 AI/Knowledge application architecture: approved.
- Phase 9 real-provider activation: blocked until an approved `OPENAI_API_KEY` is supplied and runtime-tested.
- Phase 10 application quality and production-like VPS staging: architecture/security/data/UI/UX approved.
- Phase 10 public production cutover: not approved.
- Next approved implementation scope: public DNS/trusted TLS, provider activation, external alerting/off-host backup, observed CI, stakeholder content acceptance, and controlled Nginx cutover.
