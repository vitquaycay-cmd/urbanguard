# Công nghệ (Tech stack)

Bảng tóm tắt **đang dùng trong repo** (không liệt kê hết roadmap PM2/Nginx nếu chưa cấu hình).

| Lớp | Công nghệ |
|-----|-----------|
| API | NestJS 10, Prisma, MySQL, Passport JWT, bcrypt, Multer, class-validator, Swagger, **@nestjs/axios** |
| AI inference | Python 3.10+, FastAPI, Uvicorn, Ultralytics YOLOv8n |
| Web | Next.js, React, Tailwind, Leaflet, react-leaflet, **socket.io-client**, **leaflet-routing-machine** |
| Realtime | Socket.IO (Nest gateway + client), namespace **`/realtime`**, sự kiện **`report:new`** |
| Kiểm thử | **Vitest** (backend + frontend), **pytest** (`ai-service`, gọi qua `py -3` trên Windows) |

## Monorepo

Ba package độc lập: `backend/`, `frontend/`, `ai-service/` — mỗi nơi có `package.json` riêng; **không** npm workspace ở root.

## Biến môi trường chính

- Backend: `DATABASE_URL`, `JWT_SECRET`, **`AI_SERVICE_URL`** (không `/` cuối).
- Frontend: `NEXT_PUBLIC_API_URL` trỏ tới Nest (ví dụ `http://localhost:3000`).
- AI: tùy chọn `UPLOADS_ROOT` nếu thư mục `uploads` không nằm đúng layout mặc định so với `ai-service/`.

Chi tiết cài đặt: [`README.md`](../../README.md) ở root repo.
