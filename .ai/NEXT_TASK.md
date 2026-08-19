# Active Task

## Owner review and merge — WordPress Scrollwise Node parity

1. Review the deployed canonical Node-parity `Arandi Scrollwise` experience at `http://arandi.ir/` in Persian and `http://arandi.ir/?lang=en` in English.
2. Merge the reviewed `copilot/scrollwise-canvas-port` pull request into `webwordpress`; do not merge into or modify `main` or `scrollwise`.
3. If visual revisions are requested, implement them only on the isolated branch and preserve the restorable backup at `/srv/arandi-wordpress/backups/scrollwise-node-parity-20260819T130951Z`.
4. Keep the theme-level `?lang=en|fa` presentation resolver isolated from WordPress locale, MariaDB, Next.js/PostgreSQL, route, menu, Customizer, theme-switching, and contact-form boundaries.

Phase 10 — Controlled Production Cutover

## Verified Starting Point

- Release `20260803T093000Z-phase10-r6` is active on the approved VPS behind loopback Nginx staging.
- The existing WordPress `arandi.ir` port-80 server block is preserved and still returns `200`.
- Application, Prisma/PostgreSQL, SEO, accessibility, responsive EN/FA, security headers, ClamAV, Media, backup/restore, health monitoring, log retention, SSH hardening, staging TLS, and rollback checks passed.
- A self-signed loopback certificate validates only the staging TLS boundary. It is not a trusted production certificate.

## Next Implementation Slice

1. Obtain explicit public DNS authority and create the required public A/AAAA records for the VPS.
2. Back up the WordPress files, database, and active Nginx configuration immediately before cutover.
3. Issue a trusted certificate, validate its chain and renewal timer, then prepare an HTTP-to-HTTPS redirect and HSTS only for the trusted production hostname.
4. Obtain and independently runtime-test approved OpenAI, SMTP, and SMS.ir credentials; keep every unavailable provider fail-closed.
5. Configure an external health/incident alert destination and encrypted off-host backup replication, then exercise both.
6. Intentionally review/commit/push the current worktree and observe the GitHub CI workflow; do not claim CI success from the local workflow file alone.
7. Perform a controlled Nginx cutover with the tested release and rollback checkpoint, then rerun health, Prisma, Media, SEO, accessibility, responsive, TLS, and provider smoke checks on the public hostname.

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
