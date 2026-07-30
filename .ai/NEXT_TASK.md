Phase 4.3

Admin Page Editing Foundation (Non-destructive Draft Workflow)

Context

- Phase 4.2 completed read-only integration for Pages Management and Page Details.
- Admin routes, auth, and RBAC foundations are already established.

Goals

- Introduce non-destructive editing foundations for pages using draft-safe workflows.
- Preserve public-site behavior until explicit publish actions are added.

Tasks

1. Add read/write form shell for page metadata (title, seo fields, status) with validation scaffolding.
2. Add edit-mode UI state management for `/admin/pages/[identifier]`.
3. Add optimistic-safe submit flow against existing CMS page endpoints (no destructive actions).
4. Keep sections/cards/theme/navigation edit controls disabled in this phase.
5. Add granular error feedback and loading guards for save attempts.

Constraints

- No public website/layout/routing changes.
- No AI chat changes.
- No Prisma schema changes.
- No auth/RBAC model changes.
- No delete/create/upload flows.

Acceptance

- Pages detail screen supports controlled metadata editing foundation.
- Existing read-only experience remains stable when not in edit mode.
- `npm run build` passes.
- `npm run lint` passes (allowing only pre-existing known warning).