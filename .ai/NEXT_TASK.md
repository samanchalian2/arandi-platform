Phase 3.5

CMS Service Consumption Bridge + Auth Enforcement Preparation

Context

- Phase 3.4 CMS API layer is complete on top of Prisma models.
- Existing UI/pages still rely on backward-compatible provider outputs.

Goals

- Bridge existing content adapters to consume CMS service/repository data in a non-breaking way.
- Add switchable strict auth enforcement for CMS APIs without implementing login UI.

Tasks

1. Add projection adapters from CMS API/service models to current `ContentAdapter` output contracts.
2. Implement deterministic fallback flow (`prisma -> local`) in provider/adapter internals.
3. Add API auth mode switch (`permissive` vs `strict`) using environment/config flag.
4. Extend RBAC hooks with centralized permission mapping for all CMS endpoints.
5. Add lightweight API contract tests for pages/sections/cards/theme/media responses.

Constraints

- No admin panel UI.
- No UI component changes.
- No layout redesign.
- No routing behavior changes.
- No AI chat modifications.

Acceptance

- Existing pages render identically.
- CMS API remains backward compatible.
- Strict mode can be enabled without breaking type/build.
- `npm run build` passes.
- `npm run lint` passes (allowing only pre-existing known warning).