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
