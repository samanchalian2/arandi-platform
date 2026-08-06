# Arandi Platform Architecture

## Architecture Version

Frozen v1.3

Status:
Approved

---

# Overview

Arandi Platform is built as a modern AI-ready enterprise web platform.

The architecture prioritizes:

- Scalability
- Maintainability
- Clean code structure
- AI-assisted development
- Automated testing
- Long-term evolution

---

# Technology Stack

## Framework

Next.js 16

Configuration:

- App Router
- TypeScript
- Server Components where applicable

---

## Language

TypeScript

Strict mode is required.

Purpose:

- Type safety
- Better maintainability
- Reduced runtime errors

---

## Styling

Tailwind CSS

Purpose:

- Utility-first styling
- Responsive design
- Consistent UI development

---

## UI Component System

shadcn/ui

Purpose:

- Reusable components
- Accessible UI primitives
- Maintainable design system

---

## Premium Components

21st.dev

Usage:

- Selected premium UI components
- Enhanced visual quality
- Accelerated development

Rule:

Components must follow the project Design System.

---

## Animation

Framer Motion

Usage:

- Page transitions
- Micro interactions
- Professional animations

Rule:

Animations should be purposeful and not excessive.

---
## Typography

Fonts:

- Exo for English/LTR content
- Vazirmatn for Persian/RTL content

Implementation:

Next.js font optimization system
---
## Icons

Lucide React

Usage:

- Interface icons
- Navigation icons
- UI elements

---

## Testing

Node test runner + tsx for focused logic/API tests.

Playwright/browser automation for runtime, responsive, and accessibility QA.

Responsibilities:

- Browser automation
- User flow testing
- Responsive testing
- Screenshot capture
- Detection of UI/runtime problems

---

## Version Control

Git

Purpose:

- Source control
- Change history
- Safe development

---

# AI Development Architecture

## ChatGPT

Role:

- System architect
- Project manager
- Technical reviewer
- Planning assistant

Responsibilities:

- Define architecture
- Create development tasks
- Review implementation
- Maintain project consistency

---

## Codex

Role:

- AI developer

Responsibilities:

- Create code
- Modify files
- Refactor
- Fix bugs
- Implement tasks

---

## Cursor

Role:

- Development environment

Responsibilities:

- Code editing
- Terminal execution
- Git operations
- Running project

---

# Development Workflow

Every development session follows:

1. Read CURRENT_STATE.md

2. Read NEXT_TASK.md

3. Implement only the active task

4. Test the result

5. Update:

- CURRENT_STATE.md
- CHANGELOG.md
- SESSION_LOG.md

6. Commit changes to Git

---

# Review Process

## Code Review

Performed by:

- ChatGPT
- Codex

Focus:

- Architecture
- Code quality
- Maintainability

---

## Visual Review

Performed by:

- Product Owner
- ChatGPT

Focus:

- User experience
- Design quality
- Brand consistency

---

# Architecture Change Policy

Architecture changes are allowed only when:

1. A serious technical limitation blocks progress.

or

2. A new major version is planned.

Minor preferences or external trends do not justify architecture changes.

---

# Content Domain Architecture (v1.3)

## Goal

The content layer is now entity-first instead of homepage-section-first.

This allows direct CMS mapping to enterprise entities without changing UI components.

## Canonical Entities

- Company
- Services
- Solutions
- Industries
- Projects
- Articles
- KnowledgeBase
- Contact
- Careers
- Pages

## Source of Truth

Canonical domain content is defined in:

- src/content/domain/types.ts
- src/content/domain/localDomainContent.ts

The local adapter projects UI-facing page data from domain entities.

## Provider and Adapter Contract

- ContentAdapter exposes:
	- getDomainContent(lang)
	- getPageContent(lang)
	- getMetadata(lang)
- ContentProvider mirrors the same contract.

getPageContent and getMetadata are projection APIs for current UI compatibility.

getDomainContent is the CMS-ready API for future integrations.

## CMS Integration Readiness

Payload, Strapi, and Directus integration can map directly to domain entities and then feed the adapter projection layer.

No UI changes are required for CMS migration.

## AI Integration Boundary

AI is an application integration service and not a content entity.

Integration flow:

1. Chat UI sends a bounded same-session user/assistant history to the same-origin Route Handler.
2. The server projects only Published, enabled, exact-locale Page/Section/Card text and safe public routes from Prisma.
3. Unsupported queries return a localized no-answer without a provider call.
4. The server-only gateway streams a grounded OpenAI Responses API answer as minimized NDJSON deltas and citations.
5. Cancellation and the 45-second timeout propagate to the upstream request.

Implementation files:

- src/integrations/ai/types.ts
- src/integrations/ai/gateway.ts
- src/lib/ai/config.ts
- src/lib/ai/published-context.ts
- src/lib/ai/chat.ts
- src/app/api/ai/chat/route.ts
- src/components/ai/ChatInterface.tsx

Security and configuration:

- `ai.runtime` is a private, non-secret Admin setting with exact allowlists for provider and model syntax.
- `OPENAI_API_KEY` and `AUTH_TOKEN_PEPPER` are server environment secrets and never enter Prisma, client bundles, responses, logs, or `.ai`.
- Context never includes Prisma identifiers, private Settings, payload/style/data JSON, users, contacts, sessions, or audit/security records.
- Provider instructions treat retrieved content as untrusted data, require citations, and prohibit unsupported answers.
- Provider storage is disabled, output/context/history are bounded, client identifiers are HMAC-derived, and errors are generic.
- Rate limiting is ten requests per minute per hashed client key in one application process; a shared store is mandatory before multi-process scaling.
- Knowledge remains within the existing Page content domain. Only Published Knowledge Pages and other Published website content are eligible for grounding.

---

# Runtime Boundaries

## Public Website

- Home, Company, Services, Solutions, Industries, Projects, Contact, and shared bilingual Header/Footer chrome use server-only Prisma Published adapters.
- Public adapters read only Published Pages, enabled Sections, Published Cards, and exact EN/FA translations; shared chrome separately reads ordered Navigation translations and allowlisted public company settings.
- Public ORM results are cached for one hour with bounded tags and immediately expired by successful CMS mutations.
- A Draft/missing/incomplete migrated page fails closed to 404; it cannot silently surface local content in production.
- Local fallback requires the explicit `ARANDI_PUBLIC_CONTENT_SOURCE=local` selection and is development-only.
- Seeded public Page structures are create-if-absent compatibility imports; repeat seed runs must not overwrite later editorial changes.
- Company identity/Footer data and contact coordinates remain allowlisted public Settings, separate from Page editorial payloads.
- Contact submissions use a purpose-built persistence model separate from Page editorial content and customer-owned ServiceRequest records.
- The public Contact endpoint is same-origin, JSON-only, size-bounded, consent-required, honeypot-protected, rate-limited, and replay-deduplicated.
- Raw IP/User-Agent values are never stored; HMAC hashes support bounded abuse controls.
- Database acceptance and email delivery are independent states. Unconfigured SMTP records `unavailable` and never implies delivery.
- Article, Knowledge, and Legal public routes use constrained Page templates and render only Published exact-locale Page/Section text.
- Public rich text is plain text split into paragraphs; raw HTML and unsupported Section types are never interpreted.
- Services, Solutions, Industries, and Projects detail routes are projections of their Published Cards, not parallel records.
- Public search uses a bounded cached PostgreSQL projection of Published Page/Section/Card text and returns only route, type, title, and description.
- Search results are no-indexed and locale query state is preserved by the Header language switch.
- Public Header/Footer chrome is rendered only outside `/admin/*`.

## Admin CMS

- Uses React Query against `/api/cms/*`.
- CMS APIs use Prisma/PostgreSQL.
- Nested Page/Section/Card routes enforce ownership in Server Components.
- API permissions are the final authorization boundary.

## Authentication

- Development mock auth is explicitly gated and non-production only.
- Production identity uses Prisma-backed users, roles, credentials, opaque database sessions, OTP challenges, recovery tokens, security events, and customer service requests.
- Only SHA-256/HMAC token hashes and Argon2id password hashes are persisted; raw session, CSRF, OTP, password, and recovery secrets are never stored.
- Proxy performs only optimistic cookie-shape checks. Server Components and CMS APIs resolve the database session and enforce current roles/permissions.
- Development mock auth remains a separate explicitly gated path and is unavailable in production.
- SMS and email integrations use server-only gateway boundaries and fail closed until a verified provider transport is configured.
- OTP requests persist equivalent cooldown state for known and unknown phone numbers; only active known users reach the configured gateway.
- Recovery links use 256-bit single-use tokens, remove the token from browser history after capture, and revoke every active session when consumed.

## Customer Portal

- `/account` resolves the same trusted database session used by Admin, but requires Customer permissions rather than Admin roles.
- Service-request reads are always scoped to the authenticated `userId`; create payloads never accept ownership or status fields.
- State-changing customer APIs require the session-bound double-submit CSRF token.
- API responses and Server-to-Client props omit internal ownership IDs.

## Identity Administration

- Admin and SuperAdmin may read the User directory and minimized security-event feed.
- Only a persistent, CSRF-validated SuperAdmin database session may create users, change identifiers/status/roles, suspend accounts, or revoke sessions.
- Development mock sessions are always read-only for identity persistence.
- The last active SuperAdmin cannot be removed or suspended; actors cannot suspend or demote themselves.
- Security-event presentation omits raw metadata, IP/user-agent hashes, token/session fields, and credential data.

## Navigation, Theme, and Settings

- Navigation remains the existing ordered `Navigation` plus `NavigationTranslation` model; structural changes and translation changes have separate permissions.
- Navigation reorder always submits the complete collection with unique contiguous orders and executes in a serializable transaction.
- Theme editing is limited to bounded JSON token maps; active CSS constructs such as `url(...)`, statement delimiters, braces, and malformed keys are rejected.

## Constrained Page Templates

- Page creation is permission-aware and uses the existing `Page -> Section -> Card -> Media` hierarchy exclusively.
- The allowlisted template keys are Standard, Service, Solution, Industry, Project, Article, Knowledge, Legal, and Contact.
- A template creates only a Draft Page, required EN/FA Page translations, and bounded starter Sections in one serializable transaction.
- Slugs are safe lowercase URL segments. Routes are canonical root-relative paths. Both are database-unique, and create/update conflicts return `409`.
- Templates are editorial structure presets, not new domain tables or public rendering contracts.
- Public content queries must independently enforce Page `published`, Section `enabled`, and Card `published`; Admin status cannot be trusted after the query boundary.
- Admin Settings may read redacted metadata for private/secret-like keys. Public settings and the single non-secret private `ai.runtime` key are writable through exact allowlists; credentials remain forbidden.
- `/api/public/settings` returns only public allowlisted keys and never returns secret-like keys.
- All production database-session CMS mutations require the session-bound CSRF cookie/header pair. Admin browser clients inject this through the shared `cmsFetch` boundary.

## Media

- Media metadata is stored in PostgreSQL through Prisma.
- Binary image files are stored on the managed filesystem; production serves `/media/*` through Nginx.
- Development serves the same immutable URLs through a Node.js Route Handler.
- Upload accepts JPEG, PNG, and WebP only, validates magic bytes, limits size/dimensions/pixels, re-encodes through Sharp, strips metadata, and uses UUID filenames.
- Production upload fails closed unless `clamdscan` is configured or an explicit unscanned override is set.
- Admin/SuperAdmin can upload and edit metadata; only SuperAdmin can delete.
- Referenced Media cannot be deleted. Filesystem deletion is staged and rolled back when database deletion fails.

## Database Lifecycle

- Prisma schema is canonical.
- `prisma.config.ts` defines schema, migrations, and seed paths.
- `prisma/migrations` contains the baseline PostgreSQL migration.
- Secrets and connection details remain outside source control and `.ai`.

## Production Operations Boundary

- The application is built as Next.js standalone releases under `/srv/arandi-platform/releases/<release-id>`.
- `/srv/arandi-platform/current` points to the active standalone release; systemd runs Node as the non-root `arandi` user on loopback port 3000.
- Nginx is the only HTTP boundary. Staging listeners are loopback-only; `/media/*` is served from persistent shared storage.
- PostgreSQL is local to the VPS for the deployed application. The development interface remains separately restricted by UFW and PostgreSQL host policy.
- Runtime secrets are read from root-controlled `/etc/arandi-platform/app.env`; backup authentication is isolated in a root-only pgpass file.
- Media storage and build cache are the only application-writable paths. ClamAV is mandatory in production upload policy.
- Releases are preceded by checksummed PostgreSQL/Media backups. Restore verification always targets an isolated temporary database.
- Readiness is monitored by systemd; application logs use bounded journald retention. External alert delivery and off-host backup are separate provider boundaries.
- Password SSH is disabled after validated key login. Local SSH forwarding is retained solely for loopback staging QA.
- Trusted production TLS is distinct from self-signed staging TLS and requires public DNS, certificate issuance, renewal validation, redirect testing, and a controlled Nginx cutover.
