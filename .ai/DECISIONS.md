# Architecture Decisions

This file contains important project decisions.

Only major decisions that affect the project direction are recorded here.

---

# Decision 001

## Use Next.js instead of WordPress

Date:

2026-07-23


Decision:

The project will be developed using Next.js App Router instead of WordPress.


Reason:

The project is planned as an AI-ready enterprise platform, not only a traditional company website.

Next.js provides:

- Better scalability
- Modern frontend architecture
- Better AI integration capability
- Full control over user experience
- Strong TypeScript support


Status:

Approved


---


# Decision 002

## Freeze Technology Architecture

Date:

2026-07-23


Decision:

The technology stack is frozen as Architecture Version 1.1.


Stack:

- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui
- 21st.dev
- Framer Motion
- Lucide
- Playwright
- Git


Reason:

Avoid unnecessary technology changes during development.


Status:

Approved


---

# Decision 003

## Use AI-Assisted Development Workflow

Date:

2026-07-23


Decision:

The project will use a structured workflow with:

- ChatGPT as Architect
- Codex as Developer
- Cursor as Development Environment


Reason:

Maintain development speed while preserving architecture quality.


Status:

Approved


---

# Decision 004

## Add Automated Browser Testing

Date:

2026-07-23


Decision:

Playwright is included from the beginning of the project.


Reason:

Prevent regression issues and create a reliable development workflow.


Status:

Approved


---

# Decision 005

## Documentation Driven Development

Date:

2026-07-23


Decision:

Project documentation inside .ai is part of the development process.


Reason:

The project must remain understandable regardless of future developers or AI models.


Status:

Approved


---

# Decision: AI_CONTEXT.md as Project-Independent Protocol

Date:

2026-07-23


## Decision

The AI_CONTEXT.md file is defined as a project-independent instruction layer for the AI documentation system.


## Reason

The project knowledge system must be reusable across different projects.

Project-specific information must not be mixed with the instructions that define how the AI should read and use the documentation.


## Rules

AI_CONTEXT.md must contain only:

- Documentation structure
- Reading order
- AI operating rules
- Development workflow
- Continuity instructions


AI_CONTEXT.md must not contain:

- Project name
- Project goals
- Business information
- Technology details
- Current status
- Active tasks


## Result

The `.ai` folder becomes a reusable AI project memory framework that can be copied to future projects.

---
## Typography Decision

Date:
2026-07-25

Decision:

The project will use a bilingual font system:

- Exo for English/LTR content
- Vazirmatn for Persian/RTL content

Reason:

Provides a modern technology-oriented visual identity while maintaining Persian readability.

Status:

Frozen for Version 1.

---

## AI Content Boundary Decision

Date:
2026-07-27

Decision:

AI assistant is not a content domain entity.

AI is treated as an application integration service with a gateway boundary:

- Chat UI sends user messages
- AI gateway forwards normalized requests to external model APIs
- Responses are returned to chat UI

Reason:

This separation prevents mixing business content modeling with runtime inference infrastructure and creates a cleaner CMS integration path.

Knowledge Base remains in content domain and is available as contextual input for AI requests.

Status:

Approved

---

## Landing Page Visual Direction Decision

Date:
2026-07-25

Decision:

The landing page visual direction will follow:

Enterprise Minimal + Subtle AI

Characteristics:

- Premium enterprise appearance
- Clean composition
- Generous whitespace
- Subtle AI-inspired visual elements
- Professional motion
- Technology leadership feeling

Reason:

This direction balances enterprise trust with innovation and AI positioning.

Status:

Frozen for Version 1.

---

## Visual Identity Refinement Decision

Date:
2026-07-25

Decision:

The landing page visual system follows:

Enterprise Minimal + Subtle AI

Implementation direction:

- Premium enterprise color palette
- Deep blue technology accents
- Neutral backgrounds
- Soft gradients
- Purposeful motion
- Clean spacing and hierarchy

Reason:

Creates a balance between enterprise trust and modern AI technology positioning.

Status:

Applied for Version 1.

---

## Bilingual and RTL Foundation Decision

Date:
2026-07-25

Decision:

The platform will support bilingual experiences:

- English (LTR)
- Persian (RTL)

Implementation direction:

- English uses Exo typography
- Persian uses Vazirmatn typography
- Components must be RTL-compatible
- Layouts must avoid directional CSS assumptions

Reason:

Arandi Platform targets enterprise users and requires a flexible bilingual foundation without future component rewrites.

Scope:

This phase only establishes technical foundation.
Content translation is not included.

Status:

Planned for Version 1.

---

## AI Interface Experience Decision

Date:
2026-07-25

Decision:

The Arandi Platform homepage will follow a Hybrid AI-first experience.

Structure:

- Enterprise introduction layer
- Primary AI assistant interaction
- Capability discovery sections

The AI assistant is the central interaction point of the platform.

Reason:

The platform identity is based on AI-enabled enterprise services.
The experience should communicate both trust and intelligence.

Implementation direction:

Phase 2 will create the AI interface foundation without backend integration.

Scope:

This decision covers UX architecture only.
AI models, APIs, and knowledge systems will be implemented separately.

Status:

Frozen for Version 1.

---
## Brand Identity Decision

Date:
2026-07-26

Decision:

Company name:
- Persian: آرن دی بنیان
- English: Arandi Bonyan

AI Assistant:
- Persian: ژوپیتر
- English: Jupiter / Jupiter AI

Relationship:

Arandi Bonyan is the technology company.
Jupiter is the AI assistant/product.

Reason:

Maintain clear separation between corporate identity and product identity.

Status:
Frozen for Version 1.

---
Decision:
AI assistant is not a content entity.
AI is implemented as an external service integration.

---

## Admin Shell Separation Decision

Date:
2026-08-02

Decision:

Admin routes use a dedicated visual/application shell and do not render the public Header/Footer chrome.

Reason:

This prevents duplicate navigation systems, nested main landmarks, sticky-header conflicts, and mobile accessibility problems.

Status:
Approved and applied.

---

## Media Filesystem Storage Decision

Date:
2026-08-02

Decision:

Media binaries use the managed VPS filesystem and stable `/media/<uuid>.<ext>` URLs. Nginx serves these URLs in production, while a Node.js Route Handler supports local development.

Only JPEG, PNG, and WebP are accepted. Uploads are bounded, detected by content, quarantined, malware-scanned in production, re-encoded to strip metadata, and stored under collision-resistant UUID names.

Admin and SuperAdmin may upload/edit. Only SuperAdmin may delete. Referenced Media cannot be deleted, and filesystem deletion is staged around the database operation.

Reason:

This preserves simple VPS operations without coupling binary storage to PostgreSQL, while enforcing explicit validation, access, scanning, retention, and deletion boundaries.

Status:
Approved and implemented in the Phase 4.7 application layer. Nginx/ClamAV production activation is part of deployment hardening.

---

## Prisma Migration Baseline Decision

Date:
2026-08-02

Decision:

The Prisma schema must be accompanied by versioned migrations and `prisma.config.ts`. Seed configuration no longer lives in deprecated `package.json#prisma`.

Reason:

Schema-only persistence is not reproducible or deployable. A migration baseline is required before DB-backed Admin validation.

Status:
Approved and applied. The baseline migration is deployed and the approved database is up to date.

---

## Persistent Identity and Database Session Decision

Date:
2026-08-02

Decision:

Production authentication uses opaque random session tokens backed by PostgreSQL. The browser stores only an HttpOnly SameSite cookie; the database stores a SHA-256 token hash, CSRF hash, expiry, revocation state, and optionally peppered client-context hashes.

Passwords use Argon2id. Six-digit OTPs use HMAC with a server-only pepper. Recovery and session tokens use at least 256 bits of entropy. Proxy performs optimistic token-shape checks only; authorization remains in the DAL/API boundary.

Reason:

Database sessions provide explicit revocation, role updates, auditability, and fail-closed behavior while avoiding role or permission trust in client cookies.

Status:

Approved and implemented. Password, OTP, recovery, logout, and customer-portal application flows are active. SMS.ir/SMTP network transports remain fail-closed pending verified configuration.

---

## Customer Portal Authorization Decision

Date:
2026-08-02

Decision:

Customer account and service-request operations reuse the persistent database session, require explicit `account.*` or `service_request.*` permissions, derive ownership only from the authenticated session, and require CSRF validation for writes.

Reason:

This keeps Admin and customer authorization on one revocable identity foundation while preventing client-selected ownership, cross-account reads, and cross-site writes.

Status:
Approved and implemented.

---

## Governed Navigation, Theme, and Settings Decision

Date:
2026-08-02

Decision:

Navigation continues to use ordered Navigation/NavigationTranslation rows with structural versus translation permissions. Theme accepts only bounded passive token maps. Settings writes are restricted to a public allowlist, while secret-like keys/fields are redacted or rejected. Every production CMS mutation requires database-session CSRF.

Reason:

These controls preserve the existing persistence architecture, support bilingual governance, prevent arbitrary CSS/secret storage, and close the cross-site mutation boundary consistently across the CMS.

Status:
Approved and implemented.

---

## Identity Administration Decision

Date:
2026-08-02

Decision:

User-directory and minimized audit reads are available to Admin and SuperAdmin. Identity mutations and session revocation require a persistent SuperAdmin session plus CSRF. Mock sessions cannot mutate persistence, and the last active SuperAdmin plus the actor's own active SuperAdmin role are protected.

Reason:

Identity governance is higher risk than content editing and needs database-authoritative permissions, lockout prevention, auditable writes, and strict secret minimization.

Status:
Approved and implemented.

---

## Constrained Page Template Decision

Date:
2026-08-03

Decision:

Service, Solution, Industry, Project, Article, Knowledge, Legal, and Contact workflows are allowlisted Page templates over the existing Page, Section, Card, and Media hierarchy. Template creation is transactional, bilingual, and always starts as Draft. Slug and canonical route are unique persistence identifiers.

Public reads independently require a Published Page, enabled Sections, and Published Cards.

Reason:

Editorial presets provide safe, understandable starting structures without creating parallel content silos or coupling Admin persistence directly to public components. Independent public filtering prevents Draft leakage even if an Admin payload or status transition is incorrect.

Status:
Approved and implemented for Phase 6. Public consumption is the Phase 7 boundary.

---

## Published Public Adapter and Cache Decision

Date:
2026-08-03

Decision:

Public CMS reads use server-only Prisma queries with independent filters for Published Pages, enabled Sections, Published Cards, exact EN/FA translations, and allowlisted public Settings. Database query results use Next.js tagged caching with a one-hour safety revalidation and immediate tag expiry after successful CMS mutations.

The shared Header/Footer chrome is independent from the Home Page publication state. Production never falls back automatically to local content; local fallback requires an explicit development-only source selection.

Reason:

This preserves existing UI contracts while ensuring Admin Draft/unpublish actions cannot leak or be silently overridden by static local content. Independent chrome availability prevents one unpublished Page from taking down unrelated public routes.

Status:
Approved and implemented for the Phase 7 Home/shared-chrome slice. Enterprise page bodies remain incremental migration work.
# Decision 006

## Use a Published-only server AI gateway

Date:

2026-08-03

Decision:

- OpenAI Responses API is the default provider boundary.
- Provider/model selection is an exact, non-secret private Admin Setting; API keys remain environment-only.
- AI context is a bounded projection of exact-locale Published CMS text and safe public routes.
- Unsupported queries must return a deterministic no-answer without a provider call.
- Chat history remains browser-session state and is not persisted in this phase.
- Streaming uses minimized NDJSON frames from the same-origin Node Route Handler.

Reason:

This preserves the editorial source of truth, prevents Draft/private data from crossing the provider boundary, avoids parallel knowledge persistence, and allows the provider to be changed or disabled without coupling the UI to credentials or SDK-specific types.

Status:

Approved for the Phase 9 application layer. Real provider activation requires approved environment credentials and a successful runtime check.

---

# Decision 007

## Use immutable releases and preserve the existing public site until cutover gates pass

Date:

2026-08-03

Decision:

- Build Linux standalone releases under `/srv/arandi-platform/releases` and activate them through the `current` symlink plus systemd.
- Keep Node and staging Nginx loopback-only.
- Keep persistent Media/cache and root-only backup/secrets outside releases.
- Require readiness, production-like EN/FA QA, backup/restore, and rollback validation before public cutover.
- Preserve the existing WordPress server block until public DNS, trusted renewable TLS, external operations destinations, provider checks, observed CI, and stakeholder acceptance pass.
- Treat self-signed loopback TLS as a staging boundary check only.

Reason:

This creates a reversible production-like environment without risking the current public site, separates persistent state and secrets from immutable code, and prevents partial infrastructure success from being mislabeled as a public production launch.

Status:

Approved and implemented for Phase 10 staging. Public cutover is not approved.

---
