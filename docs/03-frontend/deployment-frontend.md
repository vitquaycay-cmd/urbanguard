# Triển khai frontend

Build **Next.js** (standalone hoặc default) và host tĩnh/Node tùy nền tảng. UrbanGuard không bắt buộc SSR cho `/map` (map load client-only).

---

## Build production

```bash
cd frontend
npm run build
npm run start
```

`start` chạy server Next trên cổng mặc định **3000** — tránh trùng với backend Nest nếu cùng máy (đổi cổng một trong hai).

---

## Biến môi trường production

Bắt buộc set tại thời điểm **build** (biến `NEXT_PUBLIC_*` được embed vào bundle):

```env
NEXT_PUBLIC_API_URL=https://api.example.com
```

- URL backend thật, **HTTPS** khi site production HTTPS.
- CORS trên Nest phải cho phép **origin** frontend (vd. `https://app.example.com`).

Không commit `.env.local` — chỉ dùng trên CI / hosting secrets.

---

## Kiểm tra trước khi deploy

1. `npm run build` không lỗi TypeScript / ESLint (theo pipeline).
2. Mở `/map` — tiles OSM và (nếu API sống) marker hiển thị.
3. Mở `/report` — gửi thử với JWT hợp lệ.
4. Socket: từ domain production, DevTools → WS tới `{API}/socket.io` hoặc namespace tương ứng.

---

## Gợi ý nền tảng

| Nền tảng | Ghi chú |
|----------|---------|
| **Vercel** | `next build` + set env `NEXT_PUBLIC_API_URL`; API riêng subdomain |
| **Docker** | Image Node, `npm run build` + `npm run start`, expose cổng |
| **Nginx static** | Chỉ phù hợp nếu export static — app hiện tại dùng dynamic map + API, **khuyến nghị** `next start` hoặc serverless adapter |

---

## Bảo mật

- Không đưa secret vào `NEXT_PUBLIC_*`.
- JWT trong localStorage — chấp nhận rủi ro XSS; roadmap: httpOnly cookie + SameSite.

---

## Liên kết

- [Setup](./setup-frontend.md)
- [API](./api-integration.md)
- [Hệ thống frontend](../frontend-system.md)
