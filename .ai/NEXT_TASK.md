# Active Task

Phase 10 — Controlled Production Cutover

## Verified Starting Point

- Release `20260823T1630Z-crypto-fix`, including the verified contact/inbox/analytics slice, hydration-safe consent handling, and browser-compatible analytics tokens, is active on the approved VPS. Nginx serves the Node.js application for `arandi.ir` and the server IP over HTTP.
- The Scrollwise v2 theme is the active public appearance. Its governed images and presentation controls remain Admin-editable through the existing private Settings contracts.
- The 2026-08-16 v2 correction verifies geometry-synchronized Canvas progression, major-boundary veils, shorter episode handoffs, calmer typography, 44px mobile assistant collapse, active-chapter assistant prompts, and bounded Persian/English editing for title/body/context/bridge/prompt across all ten states. Images and presentation controls live in Admin Theme editing through private Settings; proof links/copy remain Published CMS Project Cards. Stakeholder visual acceptance remains required before publication.
- The WordPress public and loopback staging vhosts are disabled. Its files, MariaDB data, Nginx configuration, and a fresh cutover snapshot remain retained for rollback; they must not be removed without explicit acceptance.
- Application readiness, eight public Persian routes, Scrollwise markup, public security headers, the closed WordPress listener, and the release-local health/backup jobs were directly verified after cutover. Earlier local application/Prisma/SEO/accessibility checks remain recorded; public external DNS/TLS checks remain pending.
- A self-signed loopback certificate validates only the staging TLS boundary. It is not a trusted production certificate.

## Next Implementation Slice

1. Obtain stakeholder visual acceptance for the live Scrollwise footer/Taupe release `20260825T125938Z-scrollwise-footer-rollback`, then observe GitHub CI for commits `cf4cd8e`, `98785ef`, and `f623fbc`. Before another deployment, inspect and explicitly approve release-retention cleanup because the VPS has only 1.6GB free.
2. Add approved SMTP credentials only to the server environment, set `EMAIL_PROVIDER=smtp`, and send a controlled notification/reply test to the configured `info@arandi.io` destination without exposing credentials.
3. Perform authenticated browser QA of the new Admin Dashboard, Settings recipient control, Contact inbox, reply/retry workflow, and public EN/FA consent preference at mobile/tablet/desktop viewports; install an approved Playwright browser locally if headless QA is required.
4. Obtain stakeholder acceptance or a concrete revision list from the active HTTP Scrollwise site; preserve the current release and WordPress rollback artifacts until acceptance.
5. Review the three remaining high-severity Prisma/deepmerge audit entries in an isolated dependency-upgrade slice before production approval; do not use a forced upgrade without compatibility validation.
6. Obtain explicit public DNS authority and create the required public A/AAAA records for the VPS.
7. Issue a trusted certificate, validate its chain and renewal timer, then prepare an HTTP-to-HTTPS redirect and HSTS only for the trusted production hostname.
8. Configure an external health/incident alert destination and encrypted off-host backup replication, then exercise both.
9. After DNS/TLS readiness, rerun health, Prisma, Media, SEO, accessibility, responsive, TLS, provider, analytics, and inbox smoke checks on the public hostname.

## Constraints

- Do not overwrite or reset the intentional uncommitted worktree.
- Do not expose or persist secrets in source, logs, commands, `.ai`, or deployment archives.
- Do not remove the WordPress rollback source/database/configuration until post-cutover acceptance is explicit.
- Do not claim trusted TLS, provider delivery, external alerting, off-host recovery, CI execution, or public production success before direct observation.
- Preserve the single-process deployment until the AI limiter is moved to a shared store.
- Preserve Published/exact-locale public and AI reads and `Page -> Section -> Card -> Media`.

## Acceptance

- Public DNS resolves to the intended VPS from independent public resolvers.
- A trusted certificate, renewal dry run/timer, HTTPS route, redirect, and production headers pass.
- WordPress rollback data and the previous Nginx configuration restore successfully in a controlled check.
- Approved providers pass independent real-network tests without secret leakage.
- External alerts and encrypted off-host restore are directly exercised.
- GitHub CI passes on the exact reviewed commit.
- Public EN/FA QA passes at 390/768/1280 px with valid SEO, zero serious accessibility violations, and acceptable performance.
- Only then may the public production release be approved.
