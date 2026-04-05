# Tích hợp API

Client gọi backend NestJS qua **fetch**; không dùng axios trong repo hiện tại. URL gốc lấy từ **`NEXT_PUBLIC_API_URL`** — xem `frontend/src/lib/apiConfig.ts` và `mapActiveReports.ts`.

---

## Cấu hình gốc

| Export | File | Mô tả |
|--------|------|--------|
| `getApiBaseUrl()` | `lib/apiConfig.ts` | Chuẩn hoá URL (bỏ `/` cuối), dev fallback |
| `MAP_API_BASE` | `lib/mapActiveReports.ts` | Cùng nguồn — dùng cho REST + Socket.IO |

**Không hardcode** host trong component nghiệp vụ.

---

## Endpoint sử dụng

### Public

| Method | Path | Mô tả | Client |
|--------|------|--------|--------|
| GET | `/api/reports/active` | Báo cáo VALIDATED + trustScore > 0 | `fetchActiveReports()` |

`cache: "no-store"` để luôn dữ liệu mới.

### Có JWT

| Method | Path | Mô tả | Client |
|--------|------|--------|--------|
| POST | `/api/auth/login` | JSON `{ email, password }` → `access_token` | `loginRequest()` |
| POST | `/api/reports` | **multipart**: `title`, `description`, `latitude`, `longitude`, `image` | `createReportRequest()` |

Header: `Authorization: Bearer <token>`.

---

## Ví dụ multipart

```ts
const fd = new FormData();
fd.append("title", title);
fd.append("description", description);
fd.append("latitude", String(lat));
fd.append("longitude", String(lng));
fd.append("image", file);

await fetch(`${base}/api/reports`, {
  method: "POST",
  headers: { Authorization: `Bearer ${token}` },
  body: fd,
});
```

---

## Chuẩn hoá dữ liệu

- **`aiLabels`**: API có thể trả mảng hoặc chuỗi phân tách `,` / `;` — `mapActiveReports.ts` chuẩn hoá về `string[] | null`.
- **ID báo cáo** sau POST: `report.api.ts` chấp nhận `id` dạng số hoặc chuỗi số.

---

## Lỗi thường gặp

- **"Chưa cấu hình NEXT_PUBLIC_API_URL"** — thiếu `.env.local` và không rơi vào dev fallback (production build).
- **CORS** — backend `CORS_ORIGIN` phải chứa origin frontend (vd. `http://localhost:3001`).

Chi tiết luồng: [`../frontend-system.md`](../frontend-system.md) mục 5.
