# Current State

Last verified: 2026-08-29

## Current Phase

Phase 10 — Quality and Production

Status: the Node.js Scrollwise production deployment is live on the new `arandivps` host (`130.185.74.112`) as release `20260829T-compact-language-controls-r5` from reviewed commit `22a175b`. Public DNS resolves `arandi.io` and `www.arandi.io` to that host; Nginx serves the application at HTTPS, redirects HTTP and `www` to canonical `https://arandi.io`, and has a valid renewable Let's Encrypt certificate. The full CMS database and persistent Media state were migrated from the prior Node.js deployment, while the prior host remains an independent rollback source. Scrollwise internal pages, CTA, floating controls, and header now use the verified light cool-neutral treatment; its four-column footer is shared across all Scrollwise public pages. SMTP/provider delivery, external alerting/off-host backup, and observed GitHub CI remain unapproved.

## 2026-08-29 — Compact language-control correction (deployed)

- Restored the previous compact FA/EN segmented control on all standard internal-page headers after the larger touch-target variant proved visually unsuitable. Scrollwise Home uses the same compact two-option control, as requested.
- The correction is limited to language-control spacing and sizing. The shared Scrollwise footer, responsive Persian mobile brand, 64px governed symbol, and corrected Persian logo/name ordering remain in place.
- Commit `22a175b` passed 51 focused tests, strict typecheck, zero-warning lint, production build, diff check, and local visual review of Home and Services. Release `20260829T-compact-language-controls-r5` created a fresh backup, activated successfully, and returned `200` for Home and Services.

## 2026-08-29 — Scrollwise shared chrome (deployed)

- The complete four-column Scrollwise footer is now used on every public Scrollwise route; Classic and Arandi Pro retain the standard footer. The Scrollwise footer visibly renders `آرن دی بنیان` in Persian and `Arandi` in English alongside the existing lockup.
- On Scrollwise Home, the Persian brand name is visible beside the 64px mark on mobile with a responsive text size. Its language control uses the same compact two-option FA/EN segmented control used by internal pages.
- The standard Persian header no longer reverses the brand flex row: the logo is the rightmost brand item and the company name follows to its left. English order is unchanged.
- Commits `687533f` and `b9f4ff9` passed 51 focused tests, strict typecheck, zero-warning lint, production build, shell syntax validation, and diff check. Release `20260829T-scrollwise-unified-chrome-r3` created a fresh backup, found no pending Prisma migrations, activated successfully, and returned `200` for public Home, Services, and English Home.
- Browser QA passed Home and Services at 390px in Persian plus Home at 1280px in English; local responsive QA covered 390/768/1280px for both languages with no horizontal overflow. The Persian mobile brand was visible, Persian logo ordering was correct, the shared footer was present, and both language options measured 44px.

## 2026-08-29 — Persian default and public brand labels (deployed)

- Public routes without a `lang` query now resolve to Persian/RTL. Explicit `?lang=en` remains English/LTR; both `x-default` alternate metadata and sitemap now identify Persian as the canonical default.
- Scrollwise and standard headers read the public company short name as `آرن دی بنیان` in Persian and `Arandi` in English. The Persian copyright in both footer variants now says `شرکت آرن دی بنیان`.
- Migration `20260829133000_persian_default_language_and_branding` updates the persisted default Language record and the two public company short names without changing unrelated CMS data. The seed and local CMS fallback are aligned.
- The 51 focused tests, strict typecheck, zero-warning lint, production build, and diff check passed locally. Production release `20260829T-persian-default-r2` built successfully, applied migrations `20260829120000_contact_analytics_role_permissions` and `20260829133000_persian_default_language_and_branding`, activated cleanly, and returned `200` for internal Home, public Home, and explicit English requests.
- The private PostgreSQL runtime and backup credentials were synchronized before the release. Password-authenticated application-role access, a fresh encrypted-on-host backup, systemd service state, and readiness were verified. No credential value is stored in source, Git, deployment archives, or this document.

## 2026-08-29 — Production Dashboard RBAC repair (verified)

- The live Admin Dashboard page could load for the persisted `SuperAdmin`, but its consent-analytics API returned `403 Insufficient permission.` The cause was verified in PostgreSQL: the existing `SuperAdmin` and `Admin` role records predated the inbox/analytics permissions and lacked `analytics.read` (as well as the Contact inbox permissions).
- The two system roles were updated atomically in production with `contact.read`, `contact.write`, and `analytics.read`. The same durable correction is represented by migration `20260829120000_contact_analytics_role_permissions` and the canonical role seed now includes the three permissions for both roles.
- The existing SuperAdmin browser session was reloaded without re-authentication and the Dashboard rendered its live 30-day metrics with no browser-console errors. Prisma schema validation, focused tests, strict typecheck, lint, diff check, and a production build completed locally. Prisma Client regeneration was blocked only by a locked local Windows engine DLL; no generated client or schema change is required for this data-only migration.

## 2026-08-27 — Scrollwise simple 64px brand (deployed)

- The generated crystal-orb asset was removed. Scrollwise now uses the project's original simple symbol (`/brand/arandi-symbol.png`) directly in its header with no special frame, glass treatment, or padding.
- The existing Admin-controlled header-logo default and seed baseline are 64px. Conditional migration `20260827120000_scrollwise_simple_logo` changes only the immediately preceding 128px/28px baseline to 64px, preserving later deliberate Admin changes. The approved 28px desktop title and existing 64–128px Admin range remain available.
- Commits `ff708eb` and `fe64acf` passed Prisma validation/migration deployment, 51 tests, strict typecheck, zero-warning lint, diff check, and the 63-route production build. Release `20260827T-scrollwise-simple-logo` is active; readiness and public Home returned `200`. Live Persian Browser QA verified the original asset at 64px, RTL, and no horizontal overflow.

## 2026-08-27 — Owner-authorized SuperAdmin credential recovery

- The verified production SuperAdmin credential was reset directly after the public recovery flow correctly reported unavailable email delivery. The reset uses the application Argon2id password routine, clears lockout failures, revokes active sessions and outstanding recovery tokens, and records a successful security event.
- The new credential was verified against its stored hash without creating a browser session. No password, environment value, database connection value, or other secret is retained in source, Git, or project documentation.

## 2026-08-27 — Scrollwise crystal-orb brand and assistant-send color (deployed)

- The stakeholder-selected solid owl mark within a circular smoky-brown crystal orb now replaces the prior generated glass owl only in the Scrollwise header. The redundant outer glass frame was removed, so the governed 128px size applies directly to the orb. Original brand files, other themes, favicon, metadata, and footer lockup remain unchanged.
- The floating assistant send control is now the requested exact Scrollwise primary `oklch(0.34 0.09 245)`, with its native focus and disabled state preserved. The assistant shell, bot control, and back-to-top control retain their scoped translucent surfaces.
- Commit `43cfe2e` passed 51 tests, strict typecheck, zero-warning lint, diff check, and the 63-route production build. Release `20260827T-scrollwise-crystal-orb` is active; readiness and public Home returned `200`. Live Persian Browser QA verified RTL, the new orb asset at 128px, the computed send color, and no horizontal overflow.

## 2026-08-27 — Scrollwise liquid-glass controls and header (deployed)

- A generated, transparent-background smoky-brown glass version of the supplied owl mark is available only in the Scrollwise header. The original supplied brand files, other public themes, favicon, metadata, and footer lockup remain unchanged.
- The Scrollwise brand container is 128px, with an approved 28px desktop title. Existing Admin Theme controls now safely allow 64–128px logo and 16–36px title values. Migration `20260827110000_scrollwise_liquid_header` updates only the former 48px/16px baseline, preserving deliberate Admin settings.
- The Scrollwise floating assistant shell, its bot/send controls, and the back-to-top control use a scoped translucent light surface with inner highlight, soft depth, and blur/saturation where supported. Their native focus and disabled states remain intact.
- Commit `a5cde7a` passed current Prisma status, 51 tests, strict typecheck, zero-warning lint, diff check, and the 63-route production build. Release `20260827T-scrollwise-liquid-glass` is active. Live Persian Browser QA verified the 128px outer brand frame, 28px title, new control surfaces, RTL, and no horizontal overflow.

## 2026-08-27 — Scrollwise CTA neutralization (deployed)

- The generic CTA previously compounded primary/accent radial gradients with the light card surface, producing an unwanted lavender/pink cast in the live Persian Projects call-to-action. Scrollwise now has a scoped CTA override with only a low-contrast cool-neutral card/background/muted gradient; the richer general CTA treatment remains available to Classic and Arandi Pro.
- Commit `8b2c2b2` passed 51 tests, strict typecheck, zero-warning lint, diff check, and the 63-route production build. Release `20260827T-scrollwise-neutral-cta` is active. Browser QA confirms the CTA has one cool-neutral gradient (`oklch(0.99578 0.00404 247)` to `oklch(0.99324 0.00442 247)`), Persian RTL, and no horizontal overflow.

## 2026-08-27 — Scrollwise internal-page palette (deployed)

- The active Scrollwise theme's generic internal-page tokens were moved from the warm cream baseline to a very light, cool-neutral palette aligned with the published narrative Home: background `oklch(0.985 0.006 247)`, cards/surfaces `oklch(0.996 0.004 247)`, muted panels `oklch(0.95 0.011 247)`, and a lighter matching border. The established blue action/accent colors and all content remain unchanged.
- Prisma migration `20260827090000_scrollwise_light_palette` is intentionally conditional: it updates only a Scrollwise theme that still holds the former baseline, preserving deliberate later Admin customizations. The seed baseline matches the revised tokens.
- First deployment exposed a shared Next data-cache entry retaining old public theme tokens even though PostgreSQL had the new values. Commit `c7ef375` updates the release workflow to clear only the disposable shared fetch cache after build/migration and before activation; this prevents future data-only releases from publishing stale CMS appearance data.
- Commits `a52267c` and `c7ef375` passed 51 tests, strict typecheck, zero-warning lint, diff checks, script syntax validation, and the 63-route production build. Release `20260827T-scrollwise-cache-refresh` is active; readiness and public Projects returned `200`. Live Browser inspection in Persian RTL verified all three new tokens on the root, section, card, and muted surfaces with no horizontal overflow.

## 2026-08-27 — Scrollwise light-surface color (deployed)

- The stakeholder-requested warm light Scrollwise footer surface is now exactly `#EDEAE7` (computed in the Browser as `rgb(237, 234, 231)`). The scope is limited to `.ds-scrollwise-footer`; white interaction surfaces, the bright finale panel, Canvas/media, and Classic/Arandi Pro remain unchanged.
- Commit `190165a` passed 51 tests, strict typecheck, zero-warning lint, diff check, and the 63-route production build. The rollback-aware deployment created a backup, found nine current Prisma migrations with none pending, and activated release `20260827T-scrollwise-footer-edeae7`.
- VPS readiness and public Home returned `200`; live Persian Browser QA confirmed the exact solid color with no background image, no horizontal overflow, and no console errors.

## 2026-08-26 — Scrollwise header controls (deployed)

- The existing private `site.scrollwiseExperience` contract now governs `headerLogoSize` (40–64px) and `headerTitleSize` (13–22px). Safe defaults preserve the approved 48px logo and 16px desktop title for existing settings; no Prisma migration was required.
- Admin Theme → Scrollwise experience provides two labelled 44px range controls. Saving uses the existing Admin/SuperAdmin API, CSRF protection, validation, cache invalidation, and theme-preview/publication workflow; compact mobile navigation continues to hide only the title for space.
- Commit `8fe17fb` was validated with 51 tests, strict typecheck, zero-warning lint, diff check, and the 63-route production build, then activated as release `20260826T-scrollwise-header-controls`. Readiness and public Home returned `200`; live Browser QA confirmed the default 48px/16px rendering, no horizontal overflow, and no console errors.

## 2026-08-26 — Scrollwise header brand scale (deployed)

- Commit `cc8b724` enlarges only the active Scrollwise header brand: the symbol now renders at 48px (from 36px), and the desktop brand name at 16px (from 12px). On compact mobile viewports the title remains intentionally hidden to preserve navigation space, while the larger symbol remains visible.
- Local 51-test, strict typecheck, zero-warning lint, diff check, and the 63-route production build passed. The rollback-aware deployment created a new backup, found nine Prisma migrations with none pending, and activated release `20260826T-brand-header-scale`.
- Direct VPS readiness and public Home returned `200`. Live Persian Browser inspection confirmed the 48px symbol, the visible 16px `آرندی` title on the active viewport, no horizontal document overflow, and no console errors.

## 2026-08-26 — arandivps production deployment (verified)

- Fresh Ubuntu `arandivps` was provisioned with Node.js 22, PostgreSQL 16, Nginx, certbot, UFW, a systemd-hardened `arandi` application account, release/backup layout, health and daily-backup timers, and a 2GB persistent swap file appropriate to its memory capacity.
- The real PostgreSQL CMS state was restored before activation (10 Pages, one existing User, and 58 Media records). Existing persistent Media storage was transferred; no credential, private setting value, database connection string, or authentication pepper was stored in source or `.ai`.
- UFW permits only SSH, HTTP, and HTTPS. PostgreSQL stays local-only. Nginx reverse-proxies Node on loopback, serves governed `/media/`, adds HSTS on HTTPS, and leaves the application CSP/security headers intact.
- Let's Encrypt issued a certificate for both `arandi.io` and `www.arandi.io` (expiry 2026-11-24); `certbot renew --dry-run` passed. Public checks passed for Home, Company, Services, Projects, Contact, readiness, HTTP-to-HTTPS, and `www`-to-canonical redirects. Browser QA passed FA RTL and EN LTR with Scrollwise, footer, no horizontal overflow, and no console errors.
- `clamdscan` media protection is active and a clean-file scan passed. The VPS CDN initially blocked FreshClam database download, so the existing verified signature database was copied from the prior deployment; automatic updater remains installed and should be observed after its provider cooldown. SMTP stays disabled until approved credentials are supplied.

## 2026-08-25 — Scrollwise footer and Taupe surfaces (deployed)

- Stakeholder requested a light footer surface. Commit `e8a54c1` changes only the scoped Scrollwise footer background from the Taupe gradient to exact `#EDE9E1`; footer text remains `#121010`, the finale panel remains light, and Classic/Arandi Pro are untouched. Local 51-test, typecheck, lint, diff-check, and 63-route production-build validation passed. Three obsolete releases were removed after confirming the active release and rollback release were retained; release `20260825T142500Z-scrollwise-ede9e1` was then activated. VPS readiness and Home returned `200`; live Browser computed style is `rgb(237, 233, 225)` with no background image.

- The Scrollwise Home now receives a dedicated CMS-backed four-column organization footer through `AppChrome`; the previous minimal footer inside `ScrollwiseStory` was removed. Classic and Arandi Pro retain the existing standard Footer structure.
- The new footer uses existing public company, contact, navigation, map, and social settings only. It provides brand/tagline/contact CTA, Company/Services/Solutions, Industries/Projects/Articles, contact/map, an enabled-only social group, copyright, Privacy, and analytics-preference controls. No Prisma model, Admin form, or public-settings contract changed.
- Only the Scrollwise footer and the Scrollwise finale panel use the scoped `#847D7B` Taupe gradient. Header, cards, chat launcher, Canvas, scene media, Classic, and Arandi Pro are unchanged. Persian footer rendering is explicitly RTL and English is LTR.
- Browser QA on the local app passed FA/RTL and EN/LTR at 390, 768, and 1280px: Footer present, no horizontal overflow, no missing hrefs, one configured Instagram link only, map link valid, and the bottom bar remains clear of the fixed chat/back-to-top controls. Taupe base against `#121010` text measured 4.7:1. Visible focus outlines are provided for footer links, CTA, social controls, and privacy preferences.
- Local validation passed: Prisma migration status (9 applied), 51 focused tests, strict typecheck, zero-warning lint, diff check, and the 63-route production build. Commit `cf4cd8e` was pushed to `origin/scrollwise` and deployed as VPS release `20260825T123724Z-scrollwise-footer` through the rollback-aware release script. Follow-up commit `98785ef` made the footer text white and restored the finale panel to a warm light surface. Stakeholder review then requested the footer palette revert only: commit `f623fbc` restores the prior dark footer text/Taupe gradient while retaining the bright finale panel; it is active as release `20260825T125938Z-scrollwise-footer-rollback`. Backup, Linux build, Prisma deployment (no pending migration), service activation, readiness, and Home checks passed. Browser inspection of the active release confirmed dark footer text, a light finale panel, and Persian RTL. Only 1.6GB disk remained after this third build, so release-retention cleanup must precede another release.

## 2026-08-22 — Consent analytics and contact inbox

- The PostgreSQL schema is now at nine applied migrations. `ContactReply`, consented first-party analytics tables, and the private `contact.notifications` Setting are present; existing contact submissions remain intact.
- The public site presents a bilingual accept/decline analytics notice. Only after acceptance does it record hashed random visitor/session identifiers, a path without query data, referrer host, language, and aggregated device classification. Raw IP and raw User-Agent values are not persisted for analytics; DNT is respected.
- Admin/SuperAdmin Dashboard reads live 7/30/90-day first-party metrics. The protected Contact inbox supports search/filtering, status changes, delivery visibility, notification retry, SMTP reply composition, reply history, CSRF, RBAC, and security-event audit records.
- SMTP transport is implemented but not yet configured or network-tested with a real provider. Credentials remain server-only; the editable non-secret notification recipient defaults to `info@arandi.io` in Admin Settings.
- The feature slice and its contact-origin repair are deployed as `20260822T1430Z-contact-inbox-r2`. During the HTTP-only cutover, same-origin validation now accepts only the configured `arandi.ir` host when Nginx attests the matching forwarded protocol; arbitrary origins remain rejected. A live honeypot contact request with the real HTTP Origin returned `202` without persisting a message or sending email.
- The release backup initially exposed missing application-role grants on four tables created by the development migration. Least-privilege DML grants were applied to the application role for `ContactReply` and the three consented analytics tables; the canonical release backup, Prisma status, build, activation, and healthcheck then passed.
- A verified `SuperAdmin` bootstrap account now exists in the production database with the approved `info@arandi.io` email. Its credential is not recorded in source, documentation, logs, or Git; the account has an audit event and a successful password-login verification.
- Release `20260822T1615Z-consent-fix` is active. The consent UI no longer reads browser storage during its initial render, preventing a server/client hydration mismatch after a prior choice. It uses a subscription-safe storage bridge and an accessible inline error only when browser storage cannot persist the preference. Live health (`200`), password login (`200`), analytics recording (`202`), and a Browser contact-page load without console errors were verified.
- Release `20260823T1630Z-crypto-fix` is active. The in-app Browser lacks `crypto.randomUUID`, which caused the analytics-consent client component to crash the entire page. Token creation now uses `randomUUID` when available, a cryptographically secure `getRandomValues` fallback otherwise, and fails closed by skipping analytics if neither capability exists. The previously failing live tab was reloaded and rendered full Scrollwise content with no error page.
- Verified locally against the configured PostgreSQL instance: current migration status, contact/analytics persistence verifier, contact verifier, 50 focused tests, strict typecheck, zero-warning lint, and 63-route production build. Headless visual QA is blocked locally because the Playwright browser binary is unavailable.
- `npm audit --omit=dev` still reports three high-severity Prisma/deepmerge advisory entries. The suggested fix is a potentially incompatible Prisma version change and was not applied in this feature slice; it remains a production security-review item.

## 2026-08-22 — Node.js Scrollwise HTTP cutover

- The VPS release `20260822T123000Z-scrollwise-r2` was built from the clean local `scrollwise` branch at `db06045` and activated through the canonical release script. Prisma reported seven current migrations and no pending migration.
- A rollback snapshot of the prior WordPress site, its MariaDB database, the relevant Nginx configuration, and the prior Next.js target was created under the protected VPS cutover-backup directory before the vhost change. No credential is recorded in source or documentation.
- `/etc/nginx/sites-enabled` now contains the Node.js public vhost plus the existing loopback staging/TLS vhosts. The WordPress public port-80 vhost and its loopback staging vhost are disabled; MariaDB and the WordPress files remain retained solely for rollback.
- VPS checks passed: application readiness `200`, eight public Persian routes `200`, Scrollwise markup present, expected public security headers present, WordPress loopback listener closed, and the repaired release-local health and backup systemd jobs both exited successfully.
- Local validation before deployment passed: 50 focused tests, strict typecheck, zero-warning lint, and the 60-route production build.
- This is an HTTP cutover only. It does not establish publicly resolvable DNS, a trusted renewable certificate, HTTPS redirect/HSTS, live provider delivery, external alerts, off-host recovery, or observed GitHub CI.

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

Scrollwise experience on 2026-08-15: branch `scrollwise` adds a third additive, unpublished `scrollwise` theme without replacing Classic or Arandi Pro. Its Home route is a nine-chapter, native-scroll industrial narrative backed by current Published CMS services, industries, projects, and metrics. Eighteen original local WebP scene assets are independently art-directed as 3200×900 desktop panoramas and 900×1200 mobile compositions, registered as Prisma Media, and mapped through nine private, strictly allowlisted `site.scrollwise.scene.*` Settings. Admin Settings can replace each scene only with governed Media Library assets. The experience uses `motion` with a visible pause control and static reduced-motion mode, preserves the bilingual `?lang=en|fa` contract, and keeps detail pages on the shared public chrome. Migration `20260815170000_scrollwise_theme` is applied to PostgreSQL, while Classic remains the single public default and Scrollwise is available only through authenticated private preview until explicit publication.

Scrollwise validation on 2026-08-15: 48/48 focused tests, strict TypeScript, zero-warning lint, production build (60 generated pages), Theme/Settings runtime verification, enterprise/fixed public verifiers, Prisma validation/migration status, whitespace validation, and a full dependency audit passed with zero known vulnerabilities. The repository quality suite passed all 24 EN/FA route and 390/768/1280 viewport checks with zero accessibility violations; Home transfer fell to 734,850 bytes on the cold mobile EN run after replacing the legacy 1.89 MB Hero PNG path and versioning its content cache. In-app Browser QA at the available 479×585 viewport verified FA/RTL and EN/LTR, nine chapters/scenes/interludes/context menus, one H1, no broken images, and no horizontal overflow. The branch worktree is intentionally uncommitted; no deployment or public theme activation occurred.

Scrollwise canvas correction on 2026-08-15: the initial per-chapter sticky-image treatment did not create the requested video-like continuity. The Home narrative now uses one viewport-sticky Canvas across the complete native-scroll story. Scroll progress drives continuous camera travel inside each governed scene and eased crossfades between all nine original illustrations, while chapter content moves independently above the persistent visual layer. Manual pause and `prefers-reduced-motion` quantize the canvas to static chapter images instead of removing content or hijacking scroll. Browser sampling verified deterministic forward/reverse camera motion and complete scene progression from gateway through outcomes.

Scrollwise cinematic polish on 2026-08-15: the final composition uses true 32:9 desktop panoramas with alternating focus travel (`0.08 → 0.92` or reverse), restrained zoom (`1.015 → 1.09`), and separately composed mobile art. Every chapter is followed by a semantic contextual menu sourced from current Published routes. A warm-white veil rises toward `0.94` opacity during the interlude and recedes before the next scene, softening the handoff without hiding navigation or hijacking scroll. Header, mobile navigation, chapter panels, highlight cards, scroll cue, and floating assistant use brighter warm-white translucent surfaces rather than repeating the artwork's cream tone.

Scrollwise loading/Admin correction on 2026-08-16: the first implementation assigned `loading="lazy"` to programmatic `Image` objects that are not attached to the DOM; browsers did not reliably fetch scenes three through nine, leaving the Canvas white after the second scene. The Canvas now explicitly loads the current scene plus the next two governed sources as scroll progresses, exposes a diagnostic loaded/error state, and clips transformed off-screen chapter panels at the Scrollwise root. This preserves all nine scenes without downloading the complete sequence during initial page load. In-app Browser traversal verified early and late FA/EN scenes, including `intelligence`, with no broken images or horizontal overflow. The Scrollwise Theme editor now owns 18 Media Library image selectors/previews plus allowlisted controls for heading scale, camera preset, transition-veil opacity, story length, and interlude length. A private `site.scrollwiseExperience` Setting stores only those bounded values; story copy and business content remain Published CMS data. PostgreSQL initialization, real Admin save/restore, 49/49 tests, lint, typecheck, build, Theme/Settings runtime verification, Prisma validation/status, zero-vulnerability dependency audit, diff check, and 24 responsive quality checks passed. Classic remains public and Scrollwise remains an unpublished private-preview candidate.

Scrollwise typography adjustment on 2026-08-16: a full-page stakeholder review identified both story and contextual-menu headings as visually aggressive. The coherent default hierarchy is now 26–48px for chapter headings, 18–32px for contextual interludes, and 22–40px for the closing summary, with calmer tracking and locale-appropriate line heights. Admin Theme editing exposes one bounded `Heading size` control from 90–115% so all three tiers scale together without breaking hierarchy. In-app Browser measured 26/18/22px at the 479px FA and EN viewport, no broken images, and no horizontal overflow; automated production QA passed mobile, tablet, and desktop viewports.

Scrollwise bilingual content editing on 2026-08-16: Admin Theme editing now provides Persian/English tabs and nine progressive-disclosure chapter groups for editing each chapter-card title/body and following contextual-card title/body. The private `site.scrollwiseCopy` Setting has a fixed two-language, nine-scene, four-field schema with trimmed required text, 160-character title limits, 600-character body limits, extra-field rejection, existing Setting RBAC/CSRF, and public-cache invalidation. Linked service, solution, industry, and project highlight cards remain canonical Published CMS Cards and are not duplicated inside the theme setting. Real Admin save/display/restore cycles passed for FA/RTL and EN/LTR; 50/50 tests, lint, typecheck, production build, Theme/Settings verification, Prisma validation/status, zero-vulnerability audit, diff check, and 24 responsive quality checks passed. No schema migration, commit, deployment, or public theme activation occurred.

Scrollwise narrative v2 on 2026-08-16: the stakeholder-approved analysis was implemented without replacing the Next.js/Prisma/CMS/theme architecture. The public story is now an unnumbered disconnect prelude, six numbered chapters, three shorter industry episodes inside chapter four, and an unnumbered looped finale. Ten entirely new versioned desktop/mobile scene pairs and four Scrollwise-only illustrative project-proof vignettes are governed as Prisma Media; prior assets remain on disk for rollback. The 10-scene Canvas resolves the active scene from measured chapter geometry so unequal chapter rhythm stays synchronized, applies short episode handoffs and major-boundary veils, and retains native scrolling/reduced-motion behavior. Proof copy and links remain canonical Published Project Cards and no unsupported KPI was introduced. The fixed private `site.scrollwiseCopy` contract now has ten scenes and six bounded fields (`title`, `description`, contextual title/body, bridge, assistant prompt) per locale; Admin exposes all of them plus 20 scene-image selectors. The floating assistant tracks the active narrative prompt and collapses to a 44px mobile control. PostgreSQL remains at seven current migrations; no Prisma schema/API/auth/infrastructure migration was added. Browser QA verified FA 390×844 and EN desktop, all ten roles, six numbers, late-scene alignment, four proof images, Admin controls, zero broken images, and no horizontal overflow. Final validation passed: 50/50 tests, typecheck, zero-warning lint, production build (60 pages), Prisma validation/status, Theme/Settings and enterprise/fixed verifiers, 24 responsive quality checks with zero accessibility violations, production audit with zero known vulnerabilities, and diff check. Classic remains public; Scrollwise remains private and unpublished pending stakeholder acceptance.

Scrollwise card-shape correction on 2026-08-17: the three compact industry contextual cards (`oilGas`, `petrochemical`, and `connectedOperations`) used `rounded-full`, producing unintended oval surfaces. They now use a controlled 24px corner radius (`rounded-[1.5rem]`) while keeping their compact content density. In-app Browser recheck confirmed that all nine interludes have finite 24px or 32px radii, with no `rounded-full` contextual card. `npm test` (50/50), typecheck, zero-warning lint, and the 60-route production build passed.

Floating assistant copy correction on 2026-08-17: the floating chat input no longer observes Scrollwise scene prompts, so its placeholder cannot change while visitors scroll. It now uses the stakeholder-approved fixed copy: FA `پرسش‌تان را مطرح کنید؛ پاسخ، همین‌جاست.` and EN `Ask your question—your answer is right here.` The bounded handoff, dedicated Assistant route, locale direction, mobile collapse, and typed-draft precedence are unchanged. Live Browser checks confirmed the exact placeholder before and after forward/reverse scrolling in FA and EN; `npm test` (50/50), typecheck, zero-warning lint, and the 60-route production build passed.

Scrollwise mobile camera correction on 2026-08-17: portrait 900×1200 mobile scenes were filling the Canvas but forced `cameraX` to `0.5`, removing the horizontal narrative movement that makes the 3200×900 desktop panorama sequence work. The Canvas now uses the governed desktop panoramas for its camera track at every viewport; portrait scenes remain the responsive first-paint fallback beneath it. Mobile therefore follows the same direction, zoom, and crossfade logic as desktop, while retaining native scroll, reduced-motion behavior, bounded preloading, and clipped overflow. Live mobile checks at 574×754 observed changing scene keys and horizontal camera positions (`0.92 → 0.6791 → 0.08`), loaded imagery, no console errors, and no document horizontal overflow; desktop also retained changing camera positions. `npm test` (50/50), typecheck, zero-warning lint, and the 60-route production build passed.

Scrollwise navigation simplification on 2026-08-17: non-semantic numeric prefixes are removed from the desktop chapter menu and every public story card, leaving only the meaningful labels. The pause/play control is hidden by default for a quieter Header. A bounded private `showMotionControl` boolean was added to `site.scrollwiseExperience`, exposed as the Admin Theme checkbox `Show pause/play control`; it is resolved server-side and passed only to the Scrollwise Header, with public-cache revalidation on save. Existing installations safely default to hidden until an Admin explicitly enables it. Live Browser checks confirmed nine text-only desktop menu links, zero displayed story numbers, and zero public pause/play controls; 50/50 tests, typecheck, lint, and production build passed.

Floating assistant mobile and return control update on 2026-08-17: the floating assistant launcher no longer has a collapsed mobile state, so its text field and send control are always visible at every viewport. A separate, accessible `BackToTopButton` appears only after 480px of document scroll and smoothly returns the visitor to the top. It uses a 44px touch target, logical `end` positioning for RTL/LTR, safe-area spacing, and a vertical offset above the chat launcher so the two fixed controls never overlap. In-app Browser QA at 574×754 confirmed the FA field is visible immediately, the FA/EN return labels and action work, no console errors, and no horizontal overflow; 50/50 tests, typecheck, zero-warning lint, and the 60-route production build passed.

Scrollwise classic navigation option on 2026-08-17: the Scrollwise Header can now resolve either its original story-chapter navigation or a classic public-pages navigation from the bounded private `menuMode` enum in `site.scrollwiseExperience`. `classic` renders the current Published CMS navigation for Company, Services, Solutions, Industries, Projects, Contact, plus the Articles route in both desktop and mobile menus; it does not duplicate navigation data or alter the Classic/Arandi Pro Headers. Admin Theme editing exposes a `Navigation menu` selector, and absent legacy values fail safely to the existing narrative menu until an Admin saves a selection. Parsing rejects arbitrary modes, save invalidates public settings as before, and no Prisma migration is required. Browser QA confirmed the narrative default (nine story links), the two Admin options, no console errors, and no mobile overflow; 50/50 tests, typecheck, zero-warning lint, production build, and diff check passed.

Floating assistant input direction correction on 2026-08-17: the launcher no longer delegates direction to browser auto-detection. Its input now receives explicit locale direction and alignment (`rtl`/right for Persian, `ltr`/left for English), so the localized placeholder and typed text start on the appropriate edge without affecting the bounded handoff. Browser inspection confirmed the exact FA and EN `dir` attributes and computed alignment, with no console errors or horizontal overflow; 50/50 tests, typecheck, zero-warning lint, and the 60-route production build passed.

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
