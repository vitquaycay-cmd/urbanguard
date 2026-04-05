# Thiết kế API

## Quy ước chung

- **REST**, JSON (trừ upload multipart).
- Global prefix Nest: **`/api`** (ví dụ đầy đủ: `http://localhost:3000/api/reports`).
- **JWT Bearer** cho route bảo vệ; role **ADMIN** cho duyệt báo cáo.
- Lỗi validation / Prisma: filter thống nhất (xem `backend/src/common/filters/`).
- Tài liệu tương tác: **Swagger** `GET http://localhost:3000/api/docs`.

## Nhóm endpoint chính (tóm tắt)

### Auth

| Method | Path | Mô tả |
|--------|------|--------|
| POST | `/api/auth/register` | Đăng ký |
| POST | `/api/auth/login` | Trả access token |
| GET | `/api/auth/me` | Profile (JWT) |

### Reports

| Method | Path | Auth | Mô tả |
|--------|------|------|--------|
| GET | `/api/reports/active` | Không | Chỉ **VALIDATED**; có **`aiLabels`** |
| POST | `/api/reports` | JWT | Multipart: metadata + field file **`image`**; sau đó gọi AI |
| PATCH | `/api/reports/:id/status` | JWT + ADMIN | PENDING → VALIDATED / REJECTED |

### AI (Python, không qua Nest proxy mặc định)

| Method | Path | Mô tả |
|--------|------|--------|
| POST | `{AI_SERVICE_URL}/ai/analyze` | Body: `{ "image_path": "<filename>" }` |
| GET | `{AI_SERVICE_URL}/health` | Health check |
| GET | `{AI_SERVICE_URL}/docs` | OpenAPI FastAPI |

## Socket.IO

- Namespace: **`/realtime`**
- Sự kiện: **`report:new`** — payload `{ report: { ... } }` sau tạo báo cáo hoặc admin VALIDATED.

## Versioning

Hiện chưa có prefix phiên bản (`/v1`); có thể bổ sung khi public API ổn định.
