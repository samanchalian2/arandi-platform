Phase 3.4

CMS Consumption Bridge on Prisma Data (No UI Changes)

Context

- Phase 3.3 Prisma/PostgreSQL database foundation is implemented.
- Prisma schema, seed, and Prisma-backed repositories are now available.
- Existing pages still use backward-compatible local-provider outputs.

Goals

- Move content consumption path to CMS service/repository data flow while preserving exact page output contracts.
- Keep UI/layout/routing unchanged.

Tasks

1. Add projection layer from Prisma-backed CMS models to existing adapter schemas (`HeroSectionSchema`, `FeaturesSectionSchema`, `ChatSectionSchema`, navigation/footer/company metadata outputs).
2. Refactor `LocalContentAdapter` internals to optionally source from `CmsContentService` (Prisma path) while preserving exact return shapes.
3. Add runtime-safe fallback chain (`prisma -> local`) to guarantee no production break when DB is unavailable.
4. Add integrity checks for required CMS data (home page, sections, translations, navigation keys) with deterministic fallback behavior.
5. Keep all existing public content APIs unchanged.

Constraints

- No UI changes.
- No layout redesign.
- No routing changes.
- No admin panel.
- No AI chat modifications.

Acceptance

- Existing pages render identically before/after bridge.
- Prisma-backed CMS path is usable without breaking service/provider contracts.
- `npm run build` passes.
- `npm run lint` passes (allowing only pre-existing known warning).