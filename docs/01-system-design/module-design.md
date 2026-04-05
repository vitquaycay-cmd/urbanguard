# Thiết kế module

Phân rã **NestJS** thành các module có ranh giới rõ; frontend là **Next.js App Router**.

## Backend (NestJS)

| Module | Trách nhiệm |
|--------|-------------|
| `auth` | Register, login, JWT, `RolesGuard` |
| **`ai`** | `AiService` — HTTP tới Python **`/ai/analyze`** |
| `reports` | CRUD nghiệp vụ báo cáo, hook AI, `findActiveValidated`, admin status |
| `notifications` | `NotificationsGateway`, `NotificationsService`, **`emitReportNew`** |
| `prisma` | Global Prisma client |
| `users`, `uploads`, `map`, `admin`, `statistics` | Khung hoặc mở rộng theo roadmap |
| `ai-review` | Module cũ / stub — **không** dùng cho luồng AI chính (đã thay bằng `ai` + Python) |

## AI runtime (Python)

- Package **`ai-service/`**: FastAPI app, đọc ảnh từ `uploads`, expose `/ai/analyze`.

## Frontend (Next.js)

- `app/` — routes (`/`, `/map`, …).
- `components/` — `ActiveReportsMap`, `IncidentRouteControl`, `MapWithNoSSR`.
- `lib/` — `mapActiveReports.ts`, `routingAvoidance.ts`.

## Tài liệu chi tiết theo module

- [`../02-backend/ai-module.md`](../02-backend/ai-module.md)
- [`../02-backend/reports-module.md`](../02-backend/reports-module.md)
