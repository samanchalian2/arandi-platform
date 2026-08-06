# Master Plan

Last aligned: 2026-08-03

## Completed

### Phase 0 — Foundation

- Next.js, TypeScript, Tailwind, component foundation, Git, and `.ai`.

### Phase 1 — Design System and UI Foundation

- Bilingual typography, layout primitives, tokens, responsive foundation, and shared components.

### Phase 2 — Public Enterprise Website

- Public routes, bilingual content, local provider/adapter architecture, responsive navigation, visual refinement, and accessibility foundation.

### Phase 3 — CMS Architecture and Persistence Foundation

- Entity-first CMS contracts and services.
- Local and Prisma repository layers.
- PostgreSQL Prisma schema and seed.
- CMS API families for Pages, Sections, Cards, Theme, and Media.
- API validation and error envelope.

### Phase 4.1–4.6 — Admin Page Builder

- Admin shell and development mock RBAC.
- Page list/detail/edit.
- Section list/detail/edit/reorder/delete.
- Card list/detail/edit/reorder/delete.
- API security hardening, ownership checks, atomic ordering, optimistic concurrency, and focused tests.

### Phase 4.7 — Media Library Application Layer

- Activated PostgreSQL migration and seed lifecycle.
- Added Prisma-backed Media browse, upload, metadata edit, and protected delete.
- Added validated JPEG/PNG/WebP filesystem storage, stable URLs, image sanitisation, and production malware-scan policy.
- Added Admin/SuperAdmin write and SuperAdmin delete UX matching API RBAC.
- Verified real database/file CRUD plus mobile/tablet/desktop and EN/FA direction behavior.
- Production Nginx/ClamAV activation remains a deployment concern.

### Phase 5 — Production Identity and Customer Foundation

Delivered foundation:

- Persistent User, role/permission, session, credential, OTP/recovery, security event, and customer service-request entities.
- Iranian phone/email normalization, Argon2id, hashed opaque tokens, HMAC OTPs, cookie/CSRF primitives.
- Trusted database-session authorization for Admin Server Components and CMS APIs.
- Server-only SMS/email gateway boundaries with fail-closed unconfigured behavior.
- Password, OTP, logout, and recovery services/routes with persistent lockout, cooldown, expiry, replay protection, and session revocation.
- Responsive Admin/customer login and recovery UI.
- Authenticated customer profile and owner-scoped service-request create/list workflow with CSRF enforcement.
- Self-cleaning live PostgreSQL verification for authentication and customer flows.

Validated application scope:

- Admin user/role management, suspension/session revocation, and minimized security-event visibility.
- Phase 5 application architecture is approved; provider network activation remains deployment/configuration work.

### Phase 6 — Remaining Admin CMS

- Navigation editor for EN/FA menus. (validated)
- Site settings, contact/company identity, logo/favicon, Footer, and SEO defaults. (settings/theme foundation validated)
- Permission-aware, transactional Draft Page creation with nine constrained bilingual templates over Page -> Section -> Card -> Media. (validated)
- Service, solution, industry, project, article, knowledge, legal, and contact editorial workflows use the generic Page Builder rather than parallel models. (validated)
- User/role administration and minimized audit visibility. (validated)

### Phase 7 — Published CMS to Public Bridge

- Read only Published content from Prisma. (validated)
- Preserve current public provider output contracts and visual components. (validated)
- Add safe caching and revalidation so Admin publication becomes visible without exposing Draft content. (validated)
- Preserve the currently implemented canonical route plus validated `?lang=en|fa` locale contract until a dedicated locale-path migration is approved.
- Home, shared chrome, Services, Solutions, Industries, Projects, Company, and Contact page-body bridges are validated.

### Phase 8 — Public Site Completion

- Complete detail pages, news/articles, legal pages, 404, and full search. (validated)
- Add database-backed contact form with SMTP delivery, anti-spam controls, consent, and operational status. (application/persistence validated; real SMTP activation pending configuration)
- Enter and validate real Persian/English content. (initial public content validated; broader editorial completion remains ongoing)

### Phase 9 — AI and Knowledge

- Implement the server-only provider gateway with OpenAI as default and Admin-configurable non-secret provider/model selection. (application validated; real credential activation pending)
- Add streaming, cancellation, timeouts, rate limiting, same-session history, safe links, and grounded no-answer behavior. (validated)
- Ground responses only in Published CMS content, including Published Knowledge Pages. (validated)
- Keep provider keys environment-only and fail closed when unavailable. (validated)

## In Progress

### Phase 10 — Quality and Production

- SEO, accessibility, performance, 390/768/1280 responsive, RTL/LTR, security-header, bounded-JSON, and dependency remediation are validated.
- Release-based standalone deployment, loopback Nginx, Nginx Media, ClamAV, PostgreSQL policy, systemd hardening, backups/isolated restore, readiness monitoring, log retention, SSH hardening, staging TLS, and rollback are validated on the approved VPS.
- Public cutover remains gated by public DNS, trusted renewable TLS, provider credentials, external alert/off-host backup destinations, observed GitHub CI, and stakeholder content approval.

## Phase Gates

Every phase requires:

- architecture review
- actual diff review
- focused tests and typecheck
- lint and production build
- runtime checks
- responsive and accessibility QA
- security review
- database/infrastructure checks when applicable
- `.ai` updates only after validation
