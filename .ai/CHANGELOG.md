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
