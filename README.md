# UrbanGuard

**Bảo vệ bạn trên mọi cung đường** — Hệ thống bản đồ cảnh báo sự cố giao thông đô thị: người dân gửi báo cáo (ảnh + GPS + mô tả), **AI (YOLO) + admin** duyệt, dữ liệu tin cậy hiển thị trên bản đồ (Leaflet / OSM), có **tìm đường né điểm sự cố** (leaflet-routing-machine + OSRM). Tổng quan: [`UrbanGuard.md`](./UrbanGuard.md).

---

## Cấu trúc thư mục

| Thư mục / file | Mô tả |
|----------------|--------|
| [`backend/`](./backend/) | API **NestJS 10**: REST, JWT, Prisma, MySQL, Swagger, Multer, **`AiModule`** (HTTP → Python), **`ReportsService`** (auto VALIDATED / PENDING), Socket.IO. |
| [`frontend/`](./frontend/) | **Next.js** + React + Tailwind + **react-leaflet** + **leaflet-routing-machine**; `/map` — marker VALIDATED, Socket `report:new`, panel OSRM. |
| [`ai-service/`](./ai-service/) | **FastAPI + Ultralytics YOLOv8n**: `POST /ai/analyze`, `POST /predict`, `GET /health`; đọc ảnh từ `backend/uploads`. |
| [`docs/`](./docs/) | Tài liệu thiết kế; **`docs/plans/`** — file plan (.md) theo dõi bằng Git (xem [`docs/plans/README.md`](./docs/plans/README.md)). |
| [`.cursor/skills/`](./.cursor/skills/) · [`.agents/skills/`](./.agents/skills/) | Skills Cursor/agent: brainstorm, kế hoạch triển khai, thực hiện plan. |
| `UrbanGuard.md` | Mô tả sản phẩm, module, AI, DB, luồng. |
| `UrbanGuard_description.txt` | Chi tiết chức năng, rủi ro. |
| `UrbanGuard_Docs_Structure.md` | Sơ đồ cây `docs/`. |

Monorepo: **không** npm workspace ở root — cài và chạy riêng `backend`, `frontend`, `ai-service`.

---

## Công nghệ (đang dùng trong repo)

| Lớp | Công nghệ |
|-----|-----------|
| API | NestJS, Prisma, MySQL, Passport JWT, bcrypt, Multer, class-validator, Swagger, **@nestjs/axios** |
| AI (Python) | FastAPI, Uvicorn, Ultralytics YOLOv8n |
| Realtime | Socket.IO (`/realtime`) — sự kiện **`report:new`** (sau tạo báo cáo / admin VALIDATED) |
| Web | Next.js, React, Tailwind, Leaflet, react-leaflet, **socket.io-client**, **leaflet-routing-machine** (OSRM công khai) |
| DB | MySQL `utf8mb4` (khuyến nghị XAMPP) |
| Test | Backend/Frontend: **Vitest**; AI: **pytest** (`npm test` / `npm run build` trong `ai-service` gọi Python) |

PM2, Nginx, shadcn đầy đủ… trong `UrbanGuard.md` là **hướng triển khai**, chưa nhất thiết đã cấu hình trong repo.

---

## Yêu cầu môi trường

- **Node.js** 18+ (khuyến nghị 20+)
- **MySQL** (ví dụ XAMPP, cổng `3306`)
- **Python 3.10+** (AI service; Windows nên dùng `py -3`)
- **npm**

---

## Cài đặt nhanh

### 1. Database

```sql
CREATE DATABASE urbanguard CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Backend

```bash
cd backend
cp .env.example .env
# Chỉnh DATABASE_URL, JWT_SECRET, AI_SERVICE_URL (mặc định http://127.0.0.1:8000)
npm install
npx prisma generate
npx prisma migrate dev
npm run start:dev
```

- API: `http://localhost:3000`
- Swagger: `http://localhost:3000/api/docs`
- Ảnh: `backend/uploads/` → `http://localhost:3000/uploads/...`

**Biến môi trường** (`backend/.env.example`):

| Biến | Ý nghĩa |
|------|---------|
| `PORT` | Cổng HTTP API |
| `DATABASE_URL` | Prisma MySQL |
| `JWT_SECRET` / `JWT_EXPIRES_IN` | JWT |
| **`AI_SERVICE_URL`** | Gốc Python AI, **không** `/` cuối (ví dụ `http://127.0.0.1:8000`) |

### 3. AI service (Python)

```bash
cd ai-service
py -3 -m pip install -r requirements.txt
py -3 -m uvicorn main:app --reload --port 8000
```

Tùy chọn: `UPLOADS_ROOT` = đường dẫn tuyệt đối tới `backend/uploads` nếu không chạy từ layout mặc định trong repo.

Kiểm tra: `GET http://127.0.0.1:8000/health`, Swagger AI: `http://127.0.0.1:8000/docs`.

**npm trong `ai-service`** (tiện thống nhất lệnh):

```bash
npm run build   # compileall .py
npm test        # pytest
```

### 4. Frontend

```bash
cd frontend
cp .env.local.example .env.local   # nếu có
npm install
```

`frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

Chạy dev (đổi port nếu trùng API):

```bash
npx next dev --turbopack -p 3001
```

- Trang chủ: `http://localhost:3001/`
- Bản đồ: `http://localhost:3001/map` — marker **VALIDATED**, routing, cảnh báo né sự cố, realtime refetch khi có **`report:new`**.

---

## Luồng nghiệp vụ tóm tắt

1. User **POST `/api/reports`** (JWT, multipart ảnh) → lưu DB **PENDING**, file vào `uploads/`.
2. Nest gọi **`POST {AI_SERVICE_URL}/ai/analyze`** với `{ image_path: "<tên file>" }`.
3. Nếu **`detected` && `confidence` > 0.7** → cập nhật **`VALIDATED`**, `trustScore = 15`, **`aiLabels`**, `aiSummary`; cộng **reputation** user (+5). Nếu **`confidence` < 0.5** → giữ **PENDING** chờ admin. Lỗi AI → PENDING + JSON lỗi trong `aiSummary`.
4. **`report:new`** qua Socket.IO cho client bản đồ.
5. Admin có thể **PATCH** `/api/reports/:id/status` → **VALIDATED** / **REJECTED** (chỉ từ PENDING); VALIDATED cũng phát **`report:new`**.
6. **GET `/api/reports/active`** (public) — chỉ **VALIDATED**; có **`aiLabels`** cho UI / routing.

---

## API đã triển khai (tóm tắt)

| Phương thức | Đường dẫn | Mô tả |
|-------------|-----------|--------|
| `POST` | `/api/auth/register` | Đăng ký |
| `POST` | `/api/auth/login` | JWT |
| `GET` | `/api/auth/me` | Profile (JWT) |
| `GET` | `/api/reports/active` | Public — **VALIDATED**; gồm **`aiLabels`** (JSON) |
| `POST` | `/api/reports` | Tạo báo cáo + bước AI (JWT) |
| `PATCH` | `/api/reports/:id/status` | Admin: **VALIDATED** / **REJECTED** (JWT + ADMIN) |

**Admin:** gán `role = ADMIN` trong bảng `users` (MySQL).

---

## Module NestJS — trạng thái trong code

| Module | Vai trò |
|--------|---------|
| `auth` | JWT, register/login, `RolesGuard` |
| **`ai`** | **`AiService`** → HTTP Python `/ai/analyze` |
| `reports` | CRUD nghiệp vụ báo cáo, tích hợp AI + **`NotificationsService.emitReportNew`** |
| `prisma` | Global |
| `notifications` | Gateway **`/realtime`**, **`report:new`** (và `report:update` nếu bật sau) |
| `users`, `uploads`, `map`, `admin`, `statistics` | Khung / mở rộng |
| `ai-review` | Stub cũ — luồng AI chính dùng module **`ai`** + Python |

---

## Kiểm thử (npm test)

Chạy **riêng** từng package:

```bash
cd backend && npm test
cd frontend && npm test
cd ai-service && npm test
```

---

## Luồng test gợi ý (E2E ngắn)

1. MySQL + migrate; chạy **ai-service** (8000), **backend** (3000), **frontend** (3001).
2. Swagger: register → login → **POST /reports** (ảnh có đối tượng giao thông) → kiểm tra `status` / `aiSummary` / `trustScore`.
3. **GET /active** — nếu auto **VALIDATED** thì có trên list; mở **`/map`** thấy marker + thử tìm đường.
4. User **PENDING**: admin **PATCH** → **VALIDATED** → map cập nhật (Socket + refetch).

---

## Tài liệu trong `docs/`

- [docs/README.md](./docs/README.md)
- [System architecture](./docs/01-system-design/system-architecture.md), [Kiến trúc (C4)](./docs/01-system-design/architecture.md), [Database](./docs/01-system-design/database-design.md)
- Cây đầy đủ: [UrbanGuard_Docs_Structure.md](./UrbanGuard_Docs_Structure.md)

---

## Build production (tham khảo)

```bash
cd backend && npm run build && npm run start:prod
cd frontend && npm run build && npm run start
# AI: py -3 -m uvicorn main:app --host 0.0.0.0 --port 8000
```

---

*UrbanGuard — Hệ thống bản đồ cảnh báo sự cố giao thông đô thị.*
