# UrbanGuard Documentation Structure

This file maps the documentation folders and points to the files that should be treated as current.

## Current Entry Points

| File | Purpose |
|---|---|
| `README.md` | Project overview, setup, current API snapshot |
| `SYSTEM_ARCHITECTURE.md` | Current architecture for backend, frontend-v2, and urbanguard-ai |
| `AUTH_USERS_FLOW.md` | Auth and user-management flow |
| `READ-RUN.md` | Minimal local run guide |
| `frontend-v2/README.md` | Frontend-specific guide |
| `docs/README.md` | Documentation index |

## Folder Tree

```text
docs/
  README.md
  00-project-init/
    overview.md
    objectives.md
    scope.md
    tech-stack.md
    setup-environment.md
  01-system-design/
    system-architecture.md
    architecture.md
    api-design.md
    database-design.md
    module-design.md
    sequence-flow.md
    security-design.md
  02-backend/
    setup-backend.md
    project-structure.md
    auth-module.md
    users-module.md
    reports-module.md
    upload-module.md
    map-module.md
    ai-module.md
    admin-module.md
    validation.md
    error-handling.md
    deployment-backend.md
  03-frontend/
    README.md
    setup-frontend.md
    project-structure.md
    ui-design.md
    map-integration.md
    api-integration.md
    auth-flow.md
    state-management.md
    deployment-frontend.md
  04-features/
    user-features.md
    admin-features.md
    ai-features.md
    map-features.md
  05-devops/
    server-setup.md
    nginx-config.md
    pm2-config.md
    database-setup.md
    backup-strategy.md
    monitoring.md
  plans/
    README.md
```

## Maintenance Notes

- Prefer the current entry points above when code and older docs disagree.
- Some older documents may still describe planned behavior or previous app names.
- The active frontend is `frontend-v2`, not the older `frontend` reference.
- The active AI service folder is `urbanguard-ai`.
- Backend route truth comes from `backend/src/**/**.controller.ts`.
- Database truth comes from `backend/prisma/schema.prisma`.

