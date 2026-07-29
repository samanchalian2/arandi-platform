# Changelog

All important project changes are recorded here.

---

# Version 0.1.0

Date:

2026-07-23

## Added

- Created project workspace.
- Created project Brain structure.
- Initialized Next.js application.
- Configured TypeScript.
- Configured Tailwind CSS.
- Installed shadcn/ui.
- Installed Framer Motion.
- Installed Lucide React.
- Initialized Git repository.

## Architecture

- Frozen architecture v1.1 created.

## Git

Initial commit:

a3a8a77

Message:

chore: initialize arandi platform architecture

---

# Version 0.1.1

Date:

2026-07-23

## Added

- Added AI_CONTEXT.md as the AI entry point for project understanding.
- Defined AI reading order for project documentation.
- Defined AI operating rules and workflow.

---

# Version 0.1.2

Date:

2026-07-23

## Updated

- Refined AI_CONTEXT.md as a reusable AI documentation framework.
- Completed Brain architecture refinement.
- Verified GitHub repository workflow.
- Completed initialization phase preparation.
- Moved project toward Phase 1 UI foundation development.

## Fixed

- Removed duplicate documentation heading in CURRENT_STATE.md.

---

# Version 0.1.3

Date:

2026-07-26

## Added

- Introduced a localized content provider abstraction for homepage and layout content access.
- Centralized content resolution behind a provider interface while keeping UI components presentation-only.

## Verified

- npm run build ✅
- npm run lint ✅

---

# Version 0.2.0

Date:

2026-07-27

## Updated

- Replaced homepage-centric content architecture with an enterprise domain content model.
- Added canonical content entities for Company, Services, Solutions, Industries, Projects, Articles, KnowledgeBase, AI, Contact, Careers, and Pages.
- Added domain source-of-truth files in src/content/domain for entity definitions and local bilingual data.
- Refactored local content adapter to project UI page sections from domain entities.
- Extended provider and adapter contracts with getDomainContent(lang) for CMS-ready integration paths.
- Kept UI contracts and visual output unchanged while moving all content sourcing behind entity-based projection.

## Verification

- npm run build ✅
- npm run lint ✅

---

# Version 0.2.1

Date:

2026-07-28

## Added

- Created a shared enterprise page component framework in src/components/page.
- Added PageContainer, PageHero, PageSection, PageTitle, PageGrid, and PageCTA as reusable building blocks for upcoming enterprise routes.
- Reused the existing Container, SectionReveal, and Button system without changing homepage components or content architecture.

## Verification

- npm run build ✅
- npm run lint ✅ (with one pre-existing warning in src/integrations/ai/gateway.ts)

---
Added reusable enterprise page framework.

No routing changes.

No homepage changes.

No architecture changes.

---

# Version 0.2.2

Date:

2026-07-28

## Updated

- Refactored PageCTA to reuse PageTitle instead of rendering its own heading and description markup.
- Added an optional `titleAs` prop to PageCTA with a default of `h2`, aligned with the PageSection heading API.
- Extended PageHeroAction and PageCTAAction to support optional `href`, `target`, `rel`, and `icon` props while preserving existing button usage.

## Verification

- npm run build ✅
- npm run lint ✅ (with one pre-existing warning in src/integrations/ai/gateway.ts)

---

# Version 0.2.3

Date:

2026-07-28

## Added

- Added barrel export file at src/components/page/index.ts for PageContainer, PageHero, PageSection, PageTitle, PageGrid, and PageCTA.
- Added enterprise static routes:
	- /company
	- /services
	- /solutions
	- /industries
	- /projects
	- /contact

## Updated

- Implemented all enterprise route pages using the shared page framework imports from @/components/page.
- Added localized metadata generation for each new route using the existing content provider pattern.
- Updated Header navigation targets from homepage anchors to enterprise route links while preserving ?lang=en / ?lang=fa behavior.

## Verification

- npm run build ✅
- npm run lint ✅ (with one pre-existing warning in src/integrations/ai/gateway.ts)

---

# Version 0.2.4

Date:

2026-07-28

## Added

- Added src/components/page/PageBreadcrumb.tsx for reusable Home / Current Page breadcrumbs with RTL/LTR support.
- Added src/components/page/EnterprisePage.tsx as a shared template that composes PageBreadcrumb, PageHero, PageSection blocks, and PageCTA.
- Added src/lib/pageMetadata.ts to centralize shared localized metadata generation for enterprise pages.

## Updated

- Refactored enterprise route pages (company, services, solutions, industries, projects, contact) to use EnterprisePage.
- Reduced duplicated generateMetadata logic by using buildEnterprisePageMetadata and resolveLanguage helpers.
- Updated Header to use usePathname and highlight active enterprise navigation route.

## Verification

- npm run build ✅
- npm run lint ✅ (with one pre-existing warning in src/integrations/ai/gateway.ts)

---

# Version 0.2.5

Date:

2026-07-28

## Updated

- Populated all enterprise static pages with realistic enterprise content while preserving existing architecture and layout:
	- Company page now includes company overview, mission, vision, core values, and why Arandi.
	- Services page now includes six service cards: Artificial Intelligence, Software Development, Enterprise Solutions, Data & Analytics, Cloud & Infrastructure, and Digital Transformation.
	- Solutions page now includes enterprise solution cards with outcome-focused descriptions and a delivery pathway section.
	- Industries page now includes six industry cards: Oil & Gas, Petrochemical, Energy, Manufacturing, Government, and Smart Cities.
	- Projects page now includes realistic enterprise project showcase cards with impact statements.
	- Contact page now includes professional contact methods, office information, and UI-only contact form layout.

## Verification

- npm run build ✅
- npm run lint ✅ (with one pre-existing warning in src/integrations/ai/gateway.ts)

---

# Version 0.2.6

Date:

2026-07-28

## Updated

- Added centralized enterprise localization source in src/content/enterprise.ts for EN/FA route content.
- Localized header route labels through existing navigation content flow (no new localization framework).
- Refactored enterprise route pages (company, services, solutions, industries, projects, contact) to consume content-layer text for:
	- Metadata titles/descriptions
	- Breadcrumb labels
	- Hero copy and actions
	- Section headings/descriptions/cards
	- CTA copy
	- Contact form labels/placeholders/note
- Extended shared enterprise metadata helper to support content-driven metadata resolution callback.

## Verification

- npm run build ✅
- npm run lint ✅ (with one pre-existing warning in src/integrations/ai/gateway.ts)

---

# Version 0.2.7

Date:

2026-07-28

## Updated

- Applied lightweight Phase 2.3.1 localization cleanup without architecture refactor.
- Updated header logo link to preserve active language query (`?lang=en` / `?lang=fa`).
- Localized breadcrumb Home label from existing localization content.
- Localized header aria-label suffix from existing localization content.
- Added a canonical enterprise navigation items builder in src/content/navigation.ts and reused it in Header to eliminate duplicate construction.
- Kept provider, adapters, domain models, schemas, and overall content-system boundaries unchanged.

## Verification

- npm run build ✅
- npm run lint ✅ (with one pre-existing warning in src/integrations/ai/gateway.ts)

---

# Version 0.2.8

Date:

2026-07-28

## Updated

- Completed Phase 2.4A global design system polish with no architecture changes.
- Enhanced global CSS design tokens and reusable visual utilities for:
	- Typography rhythm
	- Spacing consistency
	- Elevation/shadow system
	- Glass surfaces
	- Gradient surfaces
	- Motion and transition timing
- Improved shared UI consistency across reusable components:
	- Button sizing, radius, hover/focus quality
	- Container and section spacing rhythm
	- Page primitives (hero, sections, grid, CTA, titles)
	- Header/footer polish
	- Home sections and chat surfaces
- Preserved layout structures, routing, localization behavior, provider/adapters/domain/schemas, AI integration, and enterprise content architecture.

## Verification

- npm run build ✅
- npm run lint ✅ (with one pre-existing warning in src/integrations/ai/gateway.ts)

---

# Version 0.2.9

Date:

2026-07-28

## Updated

- Refined and locked Phase 2.4B requirements as a Design System-only implementation scope.
- Added strict token-only rule for visual values across reusable components.
- Added controlled glassmorphism constraints (Hero, CTA, Header, AI Chat container only).
- Added reusable motion-system requirements (stagger, hover micro-interactions, easing, focus, reduced-motion, animation tokens).
- Added AI chat architecture-readiness requirements for future typing/streaming/citations/thinking/suggestions/avatar animation support.
- Added mandatory responsive validation targets (Mobile/Tablet/Desktop/Ultra-wide) and overflow checks.
- Added WCAG AA accessibility validation requirements.
- Added dark mode readiness requirements through token and variable preparation only.
- Kept architecture and content-system constraints unchanged.

## Verification

- npm run build ✅
- npm run lint ✅ (with one pre-existing warning in src/integrations/ai/gateway.ts)

---

# Version 0.3.0

Date:

2026-07-28

## Updated

- Implemented Phase 2.4B Design System Refinement and Validation through shared reusable components and global design-system primitives.
- Expanded token framework in src/app/globals.css for typography, spacing rhythm, radius tiers, elevation, motion timing, z-index, chat sizing, and responsive readiness variables.
- Standardized shared motion behavior via reusable motion primitives in src/components/ui/motion.ts and SectionReveal integration.
- Refined shared UI and layout primitives:
	- button.tsx
	- Header.tsx
	- Footer.tsx
	- PageContainer/PageSection/PageTitle/PageHero/PageCTA/PageGrid
- Refined homepage shared sections (Hero, Features) for tighter enterprise visual rhythm and typography readability.
- Prepared AI chat reusable component architecture for future streaming-focused capabilities by adding UI scaffolding for:
	- message state (ready/thinking/streaming)
	- citation rendering slots
	- suggestion chips
	- animated avatar states
	- tokenized chat shell and scroll/empty-state utilities
- Kept architecture, routing, localization architecture, provider/adapter/domain/schema, and AI integration unchanged.

## Verification

- npm run build ✅
- npm run lint ✅ (with one pre-existing warning in src/integrations/ai/gateway.ts)

---

# Version 0.3.1

Date:

2026-07-28

## Updated

- Completed Phase 2.4C final UI polish and mobile completion using shared reusable components only.
- Implemented full responsive Header mobile navigation behavior with:
	- hamburger menu on mobile/tablet
	- animated slide-in menu
	- active-route highlighting
	- `?lang=` preservation across enterprise links
	- logo language preservation
	- body scroll lock while menu is open
	- Escape key close
	- keyboard focus trap in menu dialog
- Refined Header enterprise polish (spacing, hover states, sticky shadow transition, premium glass consistency).
- Refined Hero visual quality without layout redesign (gradient/background tuning, subtle floating accents, improved CTA spacing).
- Refined Footer hierarchy and spacing for stronger enterprise appearance while preserving content model.
- Strengthened reusable CTA visual emphasis through premium surface/gradient polish.
- Polished chat UI visuals only (no AI architecture changes):
	- bubble surfaces
	- avatar state styling
	- typing indicator surface
	- input area focus/hover quality
	- motion polish

## Verification

- npm run build ✅
- npm run lint ✅ (with one pre-existing warning in src/integrations/ai/gateway.ts)

---

# Version 0.3.2

Date:

2026-07-29

## Fixed

- Corrected the final Phase 2.4C responsive Header defect where desktop navigation could appear below the header at non-desktop widths.
- Moved the desktop navigation cutoff to `xl`; tablet and mobile now show only logo, language switch, and hamburger control.
- Added overflow containment to the off-canvas mobile drawer wrapper so a closed drawer cannot create horizontal page overflow.

## Verified

- Browser validation at 390px, 900px, and 1440px confirmed the required responsive navigation behavior.
- Mobile drawer validation confirmed `?lang=` preservation, body scroll lock, focus trap entry, Escape close, and focus return to the trigger.
- npm run build ✅
- npm run lint ✅ (with one pre-existing warning in src/integrations/ai/gateway.ts)

---

# Version 0.4.0

Date:

2026-07-29

## Added

- Added Phase 3.1 Enterprise CMS architecture foundation documentation (architecture-only).
- Added conceptual CMS layered architecture covering presentation, application/content orchestration, domain entities, and infrastructure repositories.
- Added conceptual enterprise database model for pages, versions, sections, blocks, cards, themes, localization, media, and RBAC.
- Added multilingual architecture design including locale fallback policy and translation status tracking.
- Added reusable Page Builder entity model (`Page -> Section -> Block`) with schema-versioning strategy.
- Added generic Card system architecture with typed card variants and shared card contracts.
- Added Theme architecture model mapped to existing runtime token variables for zero-UI-change compatibility.
- Added Roles & Permissions (RBAC) architecture with enterprise role set and permission groups.
- Added backward compatibility strategy preserving existing provider/adapter contracts.

## Scope Compliance

- No admin panel UI implemented.
- No page layout changes.
- No UI redesign.
- No AI integration changes.

## Verification

- npm run build ✅
- npm run lint ✅ (with one pre-existing warning in src/integrations/ai/gateway.ts)

---

# Version 0.4.1

Date:

2026-07-29

## Added

- Implemented Phase 3.2 CMS foundation code under `src/content/cms`.
- Added canonical CMS models for:
	- page/page version
	- page section/page block
	- generic card
	- translation
	- theme
	- navigation
	- media
	- roles and permissions (RBAC)
- Added repository interfaces and local repository implementation.
- Added service layer with locale fallback resolution, page retrieval, page builder assembly, navigation/theme resolution, and translation retrieval.
- Added local mapping layer from existing domain content to CMS entities to preserve compatibility.

## Updated

- Extended `ContentProvider` with additive `getCmsService()` API without breaking existing methods.
- Extended `src/content/index.ts` exports with CMS service/contracts for incremental adoption.

## Scope Compliance

- No UI changes.
- No layout redesign.
- No routing changes.
- No admin panel implementation.
- No AI integration changes.
- Existing pages preserved through backward-compatible additive integration.

---

# Version 0.4.2

Date:

2026-07-29

## Added

- Implemented Phase 3.3 CMS Database Foundation with Prisma + PostgreSQL.
- Added `prisma/schema.prisma` with complete models:
	- Theme
	- Language
	- Page
	- PageTranslation
	- Section
	- SectionTranslation
	- Card
	- CardTranslation
	- Navigation
	- NavigationTranslation
	- Media
	- Setting
- Added UUID primary keys and `createdAt`/`updatedAt` audit fields for all listed entities.
- Added translation-table architecture using `languageCode` (`en`, `fa`) to avoid page duplication.
- Added Prisma seed script (`prisma/seed.ts`) seeded from current local CMS/domain content for compatibility.
- Added Prisma runtime/generate/seed tooling:
	- `@prisma/client`
	- `prisma`
	- `tsx`
	- npm scripts: `prisma:generate`, `prisma:seed`

## Updated

- Added Prisma-backed CMS repository implementation:
	- `src/content/cms/prismaRepositories.ts`
	- `createPrismaCmsRepositories(...)`
	- `loadCmsCollectionFromPrisma(...)`
- Added async Prisma service bootstrap in `src/content/cms/factory.ts`:
	- `createPrismaCmsContentService(...)`
- Refactored local repository module to expose reusable collection-backed constructor:
	- `createCmsRepositoriesFromCollection(...)`
- Extended CMS/content barrel exports for Prisma repository/service constructors.

## Scope Compliance

- No UI changes.
- No layout redesign.
- No routing changes.
- No admin panel implementation.
- No AI chat modifications.
- Backward compatibility preserved.

## Verification

- npm run build ✅
- npm run lint ✅ (with one pre-existing warning in src/integrations/ai/gateway.ts)

## Verification

- npm run build ✅
- npm run lint ✅ (with one pre-existing warning in src/integrations/ai/gateway.ts)
