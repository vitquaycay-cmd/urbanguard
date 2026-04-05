# Setup frontend

Hướng dẫn chạy UrbanGuard frontend (Next.js) trên máy dev.

---

## Yêu cầu

- **Node.js** 18+ (khuyến nghị 20 LTS)
- **npm** (hoặc pnpm/yarn tương đương)
- Backend NestJS đang chạy nếu cần dữ liệu thật (mặc định cổng **3000**)

---

## Cài đặt

```bash
cd frontend
npm install
```

---

## Biến môi trường

Tạo `frontend/.env.local` (xem `frontend/.env.local.example`):

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

- **Không** có dấu `/` ở cuối URL.
- Ở **development**, nếu thiếu biến, `getApiBaseUrl()` có thể fallback `http://localhost:3000` và `console.warn` — production bắt buộc cấu hình rõ.

Tùy chọn dev:

```env
NEXT_PUBLIC_DEV_REPORT_IMAGE_TOOLS=true
```

---

## Chạy dev

```bash
cd frontend
npm run dev
```

Mặc định Next.js: **http://localhost:3000** — nếu trùng cổng với backend, đổi cổng Next (`npm run dev -- -p 3001`) và đặt `CORS_ORIGIN` backend cho đúng origin frontend.

---

## Scripts

| Lệnh | Mô tả |
|------|--------|
| `npm run dev` | Dev server (Turbopack) |
| `npm run build` | Build production |
| `npm run start` | Chạy bản build |
| `npm run lint` | ESLint |
| `npm test` | Vitest (routing / avoidance) |

---

## Kiểm tra nhanh

1. Mở `/map` — bản đồ fullscreen, tiles OSM.
2. Mở `/report` — form gửi báo cáo (cần JWT nếu gửi thật).

Xem thêm: [Triển khai frontend](./deployment-frontend.md), [Tích hợp API](./api-integration.md).
