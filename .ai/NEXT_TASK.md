# Active Task

Phase 10 — Controlled Production Cutover

## Verified Starting Point

- Release `20260803T093000Z-phase10-r6` is active on the approved VPS behind loopback Nginx staging.
- Local branch `scrollwise` contains the validated v2 third-theme candidate: an unnumbered prelude, six numbered chapters, three industry episodes within chapter four, and a looped finale. Ten new governed desktop/mobile scene pairs plus four illustrative proof vignettes replace the public runtime imagery while preserving the prior files for rollback. It is intentionally unpublished and uncommitted; Classic remains the canonical public default.
- The 2026-08-16 v2 correction verifies geometry-synchronized Canvas progression, major-boundary veils, shorter episode handoffs, calmer typography, 44px mobile assistant collapse, active-chapter assistant prompts, and bounded Persian/English editing for title/body/context/bridge/prompt across all ten states. Images and presentation controls live in Admin Theme editing through private Settings; proof links/copy remain Published CMS Project Cards. Stakeholder visual acceptance remains required before publication.
- The existing WordPress `arandi.ir` port-80 server block is preserved and still returns `200`.
- Application, Prisma/PostgreSQL, SEO, accessibility, responsive EN/FA, security headers, ClamAV, Media, backup/restore, health monitoring, log retention, SSH hardening, staging TLS, and rollback checks passed.
- A self-signed loopback certificate validates only the staging TLS boundary. It is not a trusted production certificate.

## Next Implementation Slice

1. Obtain stakeholder acceptance or a concrete revision list for the private Scrollwise v2 preview; do not publish the theme before acceptance.
2. Intentionally review and commit the accepted Scrollwise worktree, then observe GitHub CI on the exact commit.
3. Obtain explicit public DNS authority and create the required public A/AAAA records for the VPS.
4. Back up the WordPress files, database, and active Nginx configuration immediately before cutover.
5. Issue a trusted certificate, validate its chain and renewal timer, then prepare an HTTP-to-HTTPS redirect and HSTS only for the trusted production hostname.
6. Obtain and independently runtime-test approved OpenAI, SMTP, and SMS.ir credentials; keep every unavailable provider fail-closed.
7. Configure an external health/incident alert destination and encrypted off-host backup replication, then exercise both.
8. Perform a controlled Nginx cutover with the tested release and rollback checkpoint, then rerun health, Prisma, Media, SEO, accessibility, responsive, TLS, and provider smoke checks on the public hostname.

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
