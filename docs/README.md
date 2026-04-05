# UrbanGuard – Tài liệu dự án

Bộ khung tài liệu cho hệ thống bản đồ cảnh báo sự cố giao thông đô thị.

## Mục lục nhanh

| Khu vực | Nội dung |
|---------|----------|
| `00-project-init/` | Giới thiệu, mục tiêu, tech stack, setup môi trường |
| `01-system-design/` | Kiến trúc (**[`system-architecture.md`](./01-system-design/system-architecture.md)**), C4, database, API, module, sequence, bảo mật |
| `02-backend/` | NestJS: auth, reports, AI (Nest `AiModule`), notifications, … |
| `03-frontend/` | Next.js, Leaflet, tích hợp API |
| `04-features/` | Tính năng user / admin / AI / map |
| `05-devops/` | Server, Nginx, PM2, DB, backup, monitoring |
| **`plans/`** | **Plan triển khai** (Markdown, theo dõi bằng Git) — xem [`plans/README.md`](./plans/README.md) |

## Tài liệu gốc ở root repo

- [`README.md`](../README.md) — cài đặt, API, test, chạy AI service
- [`UrbanGuard.md`](../UrbanGuard.md) — mô tả sản phẩm, AI, DB, luồng nghiệp vụ
- [`UrbanGuard_Docs_Structure.md`](../UrbanGuard_Docs_Structure.md) — sơ đồ cây `docs/`

## Agent / Cursor skills (trong repo)

- `.cursor/skills/brainstorm-truoc-code/` — brainstorm trước khi code
- `.agents/skills/ke-hoach-trien-khai/` — viết plan → lưu `docs/plans/`
- `.agents/skills/thuc-hien-ke-hoach/` — thực hiện plan có checkbox

Skills toàn máy (tuỳ cấu hình): `~/.cursor/skills/` (bản sao tương tự).

## Nguồn chân lý mã nguồn

- Backend: `backend/prisma/schema.prisma`, Swagger `http://localhost:3000/api/docs`
- AI Python: `ai-service/main.py`, `POST /ai/analyze`, `POST /predict`
- Frontend map: `frontend/src/components/ActiveReportsMap.tsx`, `IncidentRouteControl.tsx`
