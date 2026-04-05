# Reports module

Tạo báo cáo, liệt kê **active** (chỉ VALIDATED), và admin cập nhật trạng thái.

## Vị trí mã

- `backend/src/reports/reports.module.ts` — import `AiModule`, `NotificationsModule`
- `backend/src/reports/reports.service.ts` — logic nghiệp vụ chính
- `backend/src/reports/reports.controller.ts` — REST + Swagger

## REST (global prefix thường là `/api`)

| Phương thức | Đường dẫn | Ghi chú |
|-------------|-----------|---------|
| `POST` | `/reports` | JWT; multipart field **`image`**; tạo PENDING rồi gọi AI |
| `GET` | `/reports/active` | Public; chỉ `status = VALIDATED`; có **`aiLabels`** |
| `PATCH` | `/reports/:id/status` | JWT + role **ADMIN**; PENDING → VALIDATED / REJECTED |

Chi tiết đầy đủ: Swagger `http://localhost:3000/api/docs`.

## Luồng `create`

1. Validate có file ảnh (`Multer`), lưu `uploads/`, `imageUrl` dạng `/uploads/<filename>`.
2. `INSERT` báo cáo **PENDING**, `trustScore = 0`.
3. `AiService.analyze(file.filename)`.
4. Cập nhật theo kết quả:
   - **`detected` && `confidence` > 0.7** → **VALIDATED**, `trustScore = 15`, `aiLabels`, `aiSummary`; transaction cộng **reputation** user +5.
   - **`confidence` < 0.5** → **PENDING** (admin duyệt).
   - Khoảng giữa → **PENDING**.
5. Lỗi AI → **PENDING**, `aiSummary` = object lỗi, `trustScore = 0`.
6. `NotificationsService.emitReportNew({ report })` — payload đầy đủ báo cáo sau cập nhật.

## Luồng admin `updateStatus`

- Chỉ cho phép khi báo cáo đang **PENDING**.
- **VALIDATED**: cộng reputation +5; **`emitReportNew`** để map refetch.
- **REJECTED**: không emit (theo code hiện tại).

## Prisma

Trường quan trọng: `status`, `trustScore`, `aiSummary` (JSON), `aiLabels` (JSON array). Xem [`../01-system-design/database-design.md`](../01-system-design/database-design.md).
