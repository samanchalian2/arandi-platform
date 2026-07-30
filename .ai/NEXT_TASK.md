Phase 4.6

Card Builder Foundation (Do Not Expand Beyond Cards)

Context

- Phase 4.5 completed section detail editing and section ordering.
- Section-level builder workflow now has list, detail, edit, reorder, and role-aware constraints.

Goals

- Introduce card management foundations scoped to existing section architecture.
- Keep implementation isolated to admin CMS and card domain only.

Tasks

1. Add page-scoped section card listing route and data integration from `/api/cms/cards`.
2. Add read-only card details first, then controlled edit mode for card metadata/translations.
3. Add card ordering management within a section using safe reorder workflow.
4. Add optimistic mutations for card update/reorder through React Query.
5. Keep media attach/replace operations conservative and non-destructive in first pass.

Constraints

- No public website/layout/routing changes.
- No AI chat changes.
- No Prisma schema changes.
- No authentication/RBAC foundation redesign.
- No localization architecture changes.
- Do not start navigation/theme/user management expansion.

Acceptance

- Card list and detail/edit flows are functional in admin scope.
- Reorder and validation behavior are stable.
- Section workflows remain unaffected.
- `npm run build` passes.
- `npm run lint` passes (allowing only pre-existing known warning).