# UrbanGuard – Hệ thống bản đồ cảnh báo sự cố giao thông đô thị

## 1. Giới thiệu
UrbanGuard là hệ thống cho phép người dân báo cáo các sự cố giao thông (ổ gà, tai nạn, ngập nước,...) và hiển thị trực quan trên bản đồ, kết hợp AI và xác minh cộng đồng để đảm bảo độ tin cậy.

## 2. Công nghệ sử dụng

### Backend
- NestJS
- Prisma ORM
- MySQL (XAMPP)
- JWT + Passport
- Multer
- Swagger
- @nestjs/axios (gọi AI Python)

### AI service (Python)
- FastAPI, Uvicorn
- Ultralytics YOLOv8n

### Frontend
- React / Next.js
- Tailwind CSS (+ shadcn/ui nếu mở rộng)

### Bản đồ
- Leaflet + OpenStreetMap
- react-leaflet, leaflet-routing-machine (OSRM)

### Realtime
- Socket.IO (Nest gateway; client `socket.io-client` trên `/map`)

### Hệ thống
- PM2
- Nginx

## 3. Kiến trúc hệ thống
Client (Next.js) → **NestJS API** → MySQL (Prisma) + lưu file `uploads/`; Nest → **Python AI** (`/ai/analyze`); client map ↔ **Socket.IO** (`/realtime`).

## 4. Chức năng

### Người dùng
- Đăng ký / đăng nhập
- Gửi báo cáo (ảnh, GPS, mô tả)
- Xem bản đồ
- Xác nhận báo cáo
- Nhận cảnh báo

### Admin
- Quản lý user
- Duyệt báo cáo
- Xóa báo cáo giả
- Thống kê dữ liệu

### Hệ thống
- Bảo mật
- Log
- Backup
- Dọn dữ liệu

## 5. AI

### Trạng thái: **đã tích hợp** (Python + Nest)

- **Dịch vụ Python** (`ai-service/`): **FastAPI**, **Ultralytics YOLOv8n**, đọc ảnh trong `backend/uploads` (hoặc `UPLOADS_ROOT`).
- **Endpoint chính cho Nest:** `POST /ai/analyze` — trả `detected`, `confidence`, `labels`, `predict` (JSON đầy đủ detections).
- **Endpoint tương thích:** `POST /predict` — payload predict chi tiết (lọc nhãn COCO giao thông).
- **NestJS:** module **`ai`** (`AiService`) gọi `{AI_SERVICE_URL}/ai/analyze` sau khi lưu báo cáo + file.

**Luồng gắn báo cáo:**

- `detected === true` và **`confidence` > 0.7** → DB **`VALIDATED`**, `trustScore = 15`, lưu **`aiLabels`** + **`aiSummary`**; cộng **reputation** người gửi (+5).
- **`confidence` < 0.5** → giữ **`PENDING`** để admin duyệt tay.
- Lỗi mạng / AI tắt → **PENDING**, `aiSummary` ghi lỗi, `trustScore = 0`.

**Validation upload (unchanged):** MIME ảnh (regex + Multer), giới hạn dung lượng, lưu `uploads/` + `imageUrl`.

**Roadmap mở rộng:** phân tích mô tả văn bản, phát hiện trùng báo cáo, model tuỳ biến thay YOLOn.

## 6. Map

- **Marker** báo cáo **VALIDATED** (OSM + Leaflet).
- **Tìm đường:** **leaflet-routing-machine** + OSRM công khai; vùng đệm quanh điểm sự cố → chèn waypoint né; cảnh báo theo **nhãn AI** (`aiLabels`) hoặc tiêu đề.
- **Realtime:** Socket.IO **`report:new`** → refetch danh sách active trên `/map`.
- Heatmap / lọc nâng cao / cảnh báo khoảng cách — có thể bổ sung sau.

## 7. Module NestJS
- auth
- **ai** (HTTP → Python `/ai/analyze`)
- users
- reports
- uploads
- map
- admin
- ai-review (stub; luồng chính: **`ai`** + Python)
- notifications
- statistics

## 8. Database

### User
- id
- email
- password
- reputationScore
- role (ADMIN / USER)

### Report
- id
- title
- description
- latitude
- longitude
- imageUrl
- **status** — **`PENDING`**, **`VALIDATED`** (hiển thị bản đồ + `/active`; có thể do **AI auto** hoặc **admin**), **`REJECTED`**, **`RESOLVED`**, **`VERIFIED`** (legacy trong enum Prisma nếu còn dữ liệu cũ).
- trustScore
- **aiSummary** (JSON) — kết quả `/ai/analyze` hoặc object lỗi khi AI không sẵn sàng.
- **aiLabels** (JSON array string) — nhãn lớp giao thông (YOLO), phục vụ UI / cảnh báo routing.

## 9. Xác minh dữ liệu

### Các lớp xác minh

- **AI (YOLO + `/ai/analyze`):** xem **§5** — nhận diện vật thể giao thông (COCO lọc nhãn), tự **VALIDATED** khi độ tin cậy cao; ngược lại **PENDING** chờ admin.
- **Cộng đồng:** vote (UPVOTE / DOWNVOTE), **reputation** — schema có sẵn; logic vote có thể bổ sung dần.
- **Admin:** `PATCH` trạng thái **VALIDATED** / **REJECTED** từ **PENDING**; đồng bộ `GET /api/reports/active` và bản đồ; phát **`report:new`** khi VALIDATED.

### Trạng thái báo cáo trong tài liệu

Toàn bộ tài liệu dự án dùng **VALIDATED** cho trạng thái “đã duyệt / hiển thị công khai”, **thay cho VERIFIED**, để **khớp với mã nguồn NestJS** và enum Prisma hiện tại. Không mô tả luồng mới là “lưu VERIFIED” nữa.

## 10. Luồng hoạt động
1. User gửi báo cáo (ảnh + GPS + mô tả) — validation MIME, lưu file, tạo bản ghi **PENDING** ban đầu.
2. Nest gọi **AI `/ai/analyze`** — cập nhật **`aiSummary`**, **`aiLabels`**, **`trustScore`**, và có thể **`VALIDATED`** tự động (hoặc giữ **PENDING**).
3. Socket **`report:new`** — client bản đồ có thể refetch danh sách active.
4. Admin duyệt các báo cáo còn **PENDING** → **VALIDATED** / **REJECTED** (nếu cần).
5. Hiển thị map — chỉ báo cáo **VALIDATED** trên lớp công khai; tìm đường dùng tọa độ active + né vùng sự cố (heuristic).

## 11. Triển khai
- Cloud hoặc server riêng

## 12. Kết luận
UrbanGuard giúp tăng an toàn giao thông.

## 13. Slogan
UrbanGuard – Bảo vệ bạn trên mọi cung đường
