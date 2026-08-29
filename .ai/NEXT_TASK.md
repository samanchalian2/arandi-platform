# Active Task

Phase 10 — Controlled Production Cutover

## Verified Starting Point

- Release `20260827T-scrollwise-simple-logo`, sourced from reviewed commits `ff708eb` and `fe64acf`, is active on `arandivps` for the canonical `https://arandi.io` hostname. DNS, HTTPS, HSTS, canonical redirects, CMS/Media migration, readiness, public-route checks, and FA/EN Browser QA are directly verified. The active Scrollwise header defaults to the original simple 64px symbol and 28px desktop title, both adjustable through the private Admin Theme controls; internal pages, CTA, and floating controls use the verified light cool-neutral palette, the Home footer remains exactly `#EDEAE7`, and the prior VPS remains a rollback source and is not modified by this deployment.
- The Scrollwise v2 theme is the active public appearance. Its governed images and presentation controls remain Admin-editable through the existing private Settings contracts.
- The 2026-08-16 v2 correction verifies geometry-synchronized Canvas progression, major-boundary veils, shorter episode handoffs, calmer typography, 44px mobile assistant collapse, active-chapter assistant prompts, and bounded Persian/English editing for title/body/context/bridge/prompt across all ten states. Images and presentation controls live in Admin Theme editing through private Settings; proof links/copy remain Published CMS Project Cards. Stakeholder visual acceptance remains required before publication.
- The WordPress public and loopback staging vhosts are disabled. Its files, MariaDB data, Nginx configuration, and a fresh cutover snapshot remain retained for rollback; they must not be removed without explicit acceptance.
- Application readiness, public Persian routes, Scrollwise markup, public security headers, systemd health/backup jobs, public DNS, trusted TLS, HTTP-to-HTTPS, and `www` canonical redirect were directly verified on `arandivps`. Earlier local application/Prisma/SEO/accessibility checks remain recorded.
- The legacy VPS self-signed loopback certificate is not part of the current `arandi.io` production boundary. The new production hostname uses the verified trusted Let's Encrypt certificate.

## Next Implementation Slice

0. Preserve the verified private PostgreSQL runtime and backup credential synchronization. Before any later credential rotation, update both server-only stores atomically, verify password-authenticated application-role access, take a fresh backup, and then restart the service; never store the value in source, Git, documentation, or deployment archives.
1. Obtain stakeholder visual acceptance for the live Scrollwise release `20260829T-compact-language-controls-r5` at canonical `https://arandi.io` (including Persian as the default public language, the `آرن دی بنیان` Persian brand label, English `Arandi` via `?lang=en`, the mobile-visible 64px Scrollwise header symbol/name, the shared four-column Scrollwise footer, compact FA/EN language controls consistently shown on Home and internal pages, correct Persian logo ordering on internal pages, light internal-page/CTA palette, and primary-color assistant send control), then observe GitHub CI for the reviewed Scrollwise commits. Preserve the active release and immediate rollback release on `arandivps`.
2. Add approved SMTP credentials only to the server environment, set `EMAIL_PROVIDER=smtp`, and send a controlled notification/reply test to the configured `info@arandi.io` destination without exposing credentials.
3. Perform authenticated browser QA of the new Admin Dashboard, Settings recipient control, Contact inbox, reply/retry workflow, and public EN/FA consent preference at mobile/tablet/desktop viewports; install an approved Playwright browser locally if headless QA is required.
4. Obtain stakeholder acceptance or a concrete revision list from the active HTTPS Scrollwise site; preserve the current release and the prior-VPS rollback source until acceptance.
5. Review the three remaining high-severity Prisma/deepmerge audit entries in an isolated dependency-upgrade slice before production approval; do not use a forced upgrade without compatibility validation.
6. Monitor public DNS after the `arandi.io` cutover and document any future A/AAAA changes; do not alter the current verified A/CNAME mapping without approval.
7. Monitor the issued trusted certificate and certbot timer; its first renewal dry run passed, while HSTS and HTTP-to-HTTPS are already active for the trusted production hostname.
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
