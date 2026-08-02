Phase 4.7

Media Library Foundation

Context

- Phase 4.6 completed the Admin Card Builder and conservative existing-media reference behavior.
- Card routes, RBAC, optimistic concurrency, full-collection reorder, JSON validation, and Section integration are in place.
- Admin CMS data remains Prisma-backed; public pages remain local-provider-backed.

Goal

- Define and implement the approved Media Library foundation in a separate phase.

Constraints

- Do not connect public rendering to Prisma without a separately approved consumption bridge.
- Preserve existing Card RBAC and media detach behavior.
- Do not begin Theme, Navigation, User, Settings, AI, or public-site work as part of the Media Library phase.
- Review the Phase 4.7 prompt and current architecture before implementation.