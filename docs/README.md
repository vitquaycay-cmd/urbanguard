# UrbanGuard Documentation

This folder contains design and implementation documentation. The most accurate high-level entry points are:

| File | Purpose |
|---|---|
| `../README.md` | Project overview, setup, current API snapshot |
| `../SYSTEM_ARCHITECTURE.md` | Current architecture snapshot |
| `../AUTH_USERS_FLOW.md` | Auth and user-management flow |
| `../READ-RUN.md` | Minimal local run guide |
| `01-system-design/system-architecture.md` | System-design copy of the current architecture |
| `01-system-design/api-design.md` | Current API contract snapshot |
| `../frontend-v2/README.md` | Frontend v2 guide |

## Current Source Of Truth

| Area | Source files |
|---|---|
| Backend routes | `backend/src/**/**.controller.ts` |
| Database schema | `backend/prisma/schema.prisma` |
| Frontend routes | `frontend-v2/src/App.tsx` |
| Frontend API clients | `frontend-v2/src/services/*.api.ts` |
| AI routes | `urbanguard-ai/app/routes.py` |

## Documentation Status

Some older files in this folder still describe earlier plans or older app names such as `frontend`, `ai-service`, or Next.js. Prefer the root architecture and API snapshot files above when making implementation or testing decisions.

