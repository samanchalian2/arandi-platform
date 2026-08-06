# Arandi Platform Project

## Identity

- Name: Arandi Platform
- Company: Arandi Bonyan
- Type: bilingual AI-ready enterprise website, governed CMS, identity/customer foundation, and Published-content assistant

## Purpose

Provide a premium English/Persian public website whose editorial content is governed in Admin, persisted in PostgreSQL through Prisma, and safely projected to public and AI consumers.

## Current Version

- Architecture baseline: entity-first content architecture v1.3
- Application version: 0.5.9
- Current phase: Phase 10 — Quality and Production
- Phase status: production-like staging is validated on the approved VPS; public cutover is not approved
- Next phase: Phase 10 cutover gates and provider activation
- Last verified: 2026-08-03

## Technology

- Next.js 16 App Router, React 19, strict TypeScript
- Tailwind CSS 4 and shadcn-based reusable UI
- Prisma 6 and PostgreSQL
- React Query for Admin CMS workflows
- Node test runner with tsx and in-app browser QA
- OpenAI Responses API behind a server-only gateway

## Canonical Boundaries

- Editorial persistence remains `Page -> Section -> Card -> Media`; EN/FA are translation records, not duplicate Pages.
- Public routes read only Published Pages, enabled Sections, Published Cards, exact-locale translations, ordered Navigation, and explicitly public Settings.
- Admin CMS writes through permission-checked, CSRF-protected `/api/cms/*` APIs to Prisma/PostgreSQL.
- Identity/customer data, contact submissions, and operational security events are purpose-built persistence domains and are not editorial content.
- AI is an application integration, not a content entity. Its context projection contains only bounded Published exact-locale text and safe public routes.
- `ai.runtime` stores only the non-secret allowlisted provider/model choice and must remain private. `OPENAI_API_KEY` and `AUTH_TOKEN_PEPPER` remain environment-only.
- Media metadata is in PostgreSQL; sanitized image binaries are on managed storage served through the validated Nginx/ClamAV boundary.

## Verified Delivery

- Phases 0–9 are application-validated.
- Phase 9 includes Published grounding, citations, streaming NDJSON, bounded history/input/output, cancellation, timeout, same-origin enforcement, per-process rate limiting, provider fail-closed behavior, and responsive EN/FA chat UI.
- Five migrations are applied on the approved PostgreSQL database at the configured host; connection details and credentials remain outside `.ai`.
- Current focused suite: 44 passing tests, zero-warning lint, strict typecheck, deterministic AI/PostgreSQL verifier, and 56 generated production pages.
- Release `20260803T093000Z-phase10-r6` is active behind loopback Nginx staging on the approved VPS. PostgreSQL migrations, health monitoring, ClamAV, Media serving, backup/restore, rollback, SSH key-only access, journald retention, and staging TLS were exercised.
- EN/FA production-like QA passed 24 route/locale/viewport combinations at 390, 768, and 1280 pixels with zero Axe violations, no browser errors, valid SEO signals, and measured load/transfer budgets.

## Remaining Scope

- Configure and independently verify approved OpenAI, SMTP, and SMS.ir credentials.
- Create public DNS records, issue a trusted certificate, validate renewal and HTTP-to-HTTPS redirect, and only then cut over from the preserved WordPress server block.
- Configure an external alert destination and encrypted off-host backup target.
- Commit/push the intentional worktree and observe the GitHub CI workflow before claiming CI execution.
- Complete broader real EN/FA editorial entry and final stakeholder acceptance.
