Phase 2.4

Enterprise Localization QA and Final Review

Goals

- Perform final bilingual QA across enterprise routes after Phase 2.3.1 cleanup.
- Verify language persistence behavior for header logo and enterprise route links.
- Verify breadcrumb Home label and header aria-label localization behavior.
- Confirm no architecture drift from the frozen boundaries.

Constraints

- Keep architecture frozen (no provider/adapter/domain/schema/content-system redesign).
- Keep existing enterprise route/page composition unchanged.
- Keep AI integration unchanged.

Acceptance

- Header logo preserves active `?lang` query.
- Breadcrumb Home label and header aria suffix are localized from existing content.
- Enterprise navigation item construction remains centralized in one canonical builder.
- Build and lint continue to pass.