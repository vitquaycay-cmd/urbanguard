# Luồng xác thực (Auth flow)

UrbanGuard frontend dùng **JWT** lưu **localStorage** cho luồng gửi báo cáo — không có middleware Next.js bảo vệ route trong phiên bản hiện tại.

---

## Phạm vi

| Trang / hành động | Auth |
|-------------------|------|
| `/map`, `GET /api/reports/active` | Không cần |
| Socket `report:new` | Không cần (CORS + cookie policy tùy backend) |
| `/report` — gửi báo cáo | **Bắt buộc** đăng nhập trước |

---

## Luồng đăng nhập

1. Người dùng nhập email / mật khẩu trên `/report`.
2. `loginRequest()` → `POST /api/auth/login` (JSON).
3. Phản hồi chứa `access_token` → `setStoredAccessToken(token)` ghi `localStorage` (key trong `report.api.ts`, vd. `urbanguard_access_token`).
4. `useState` / `useEffect` đồng bộ UI “Đã đăng nhập”.

---

## Luồng gửi báo cáo

1. `createReportRequest(token, { title, description, latitude, longitude, image })`.
2. Header `Authorization: Bearer <token>`.
3. Nếu **401** — xử lý theo message từ server; user có thể đăng nhập lại.

---

## Đăng xuất

- `setStoredAccessToken(null)` — xóa token khỏi `localStorage`.
- Không gọi endpoint revoke (chưa có trong spec hiện tại).

---

## Hạn chế & mở rộng

- **Không** refresh token tự động trong frontend hiện tại.
- **Không** có trang đăng ký / quên mật khẩu trong repo này.
- Roadmap: middleware Next.js, httpOnly cookie, hoặc session — cần đổi contract với backend.

Implementation: `frontend/src/services/report.api.ts`, `frontend/src/app/report/page.tsx`.
