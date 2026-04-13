# UrbanGuard — Auth + Users: Luồng hoạt động

> Dev B — `backend/src/auth/` · `backend/src/users/`  
> Cập nhật: 13/04/2026

---

## Trạng thái

| Ký hiệu | Nghĩa |
|---------|-------|
| ✅ | Đã hoàn thành |
| 🔨 | Cần làm tiếp |

---

## 1. Luồng đăng ký / đăng nhập

```
User gửi request
  POST /auth/register  →  tạo tài khoản, hash bcrypt, lưu DB
  POST /auth/login     →  kiểm tra email + so sánh hash
        ↓
  Tạo cặp token
    access_token  — sống 15 phút (JWT_SECRET)
    refresh_token — sống 7 ngày  (JWT_REFRESH_SECRET)
        ↓
  Lưu refresh_token vào bảng refresh_tokens (userId, token, expiresAt)
        ↓
  Trả về client: { access_token, refresh_token, user }
```

**Endpoint:**

| Method | Path | Auth | Trạng thái |
|--------|------|------|-----------|
| POST | `/api/auth/register` | — | ✅ |
| POST | `/api/auth/login` | — | ✅ Throttle 5 req/60s |

---

## 2. Luồng refresh token

```
Access token hết hạn (sau 15 phút)
  Frontend gọi POST /auth/refresh với refresh_token
        ↓
  Server tìm token trong DB (findUnique)
    Không tìm thấy  →  401 "Refresh token không hợp lệ"
    Hết hạn         →  xóa token khỏi DB → 401 "Refresh token đã hết hạn"
        ↓
  Tìm user theo userId trong record
        ↓
  Xóa refresh token cũ khỏi DB  (tránh dùng lại nhiều lần)
        ↓
  Tạo cặp token mới → lưu refresh token mới vào DB
        ↓
  Trả về: { access_token, refresh_token } mới
```

**Tại sao xóa token cũ?** — Mỗi lần refresh phải hủy token cũ, tránh 1 token dùng được nhiều lần (rotation pattern).

**Endpoint:**

| Method | Path | Auth | Trạng thái |
|--------|------|------|-----------|
| POST | `/api/auth/refresh` | — (body: refreshToken) | ✅ |

---

## 3. Luồng đổi mật khẩu

```
User đã đăng nhập gọi PATCH /auth/password
  Body: { oldPassword, newPassword }
        ↓
  Tìm user theo userId từ JWT
        ↓
  bcrypt.compare(oldPassword, user.password)
    Không khớp  →  401 "Mật khẩu cũ không đúng"
        ↓
  bcrypt.hash(newPassword, 10)
        ↓
  prisma.user.update({ password: newHash })
        ↓
  Trả về: { message: "Đổi mật khẩu thành công" }
```

**Endpoint:**

| Method | Path | Auth | Trạng thái |
|--------|------|------|-----------|
| PATCH | `/api/auth/password` | JWT | ✅ |

---

## 4. Luồng đăng xuất

```
POST /auth/logout
  Body: { refreshToken }
        ↓
  Tìm token trong DB
    Không tìm thấy  →  401
        ↓
  Xóa token khỏi DB (delete)
        ↓
  Trả về: { message: "Đăng xuất thành công" }

POST /auth/logout-all  [🔨 Cần làm]
  JWT xác định userId
        ↓
  prisma.refreshToken.deleteMany({ where: { userId } })
        ↓
  Xóa toàn bộ phiên đăng nhập trên mọi thiết bị
```

**Endpoint:**

| Method | Path | Auth | Trạng thái |
|--------|------|------|-----------|
| POST | `/api/auth/logout` | JWT | ✅ |
| POST | `/api/auth/logout-all` | JWT | 🔨 |

---

## 5. Luồng giới hạn 3 thiết bị

```
Mỗi lần login → saveRefreshToken() được gọi
        ↓
  Đếm số token hiện tại của user
  prisma.refreshToken.count({ where: { userId } })
        ↓
  Nếu >= 3:
    Tìm token cũ nhất (orderBy: createdAt asc, take: 1)
    Xóa token đó
        ↓
  Tạo token mới → lưu vào DB
  Kết quả: user tối đa 3 phiên song song
```

**Trạng thái:** 🔨 Cần làm — sửa trong `saveRefreshToken()` của `AuthService`

---

## 6. Luồng quản lý user (Admin)

```
Admin gọi API với JWT + role ADMIN
        ↓
  RolesGuard kiểm tra role trong token
    Không phải ADMIN  →  403 Forbidden
        ↓
  Thực hiện action:
    GET  /users              →  danh sách, filter role, phân trang
    PATCH /users/:id/role    →  gán ADMIN / USER
    GET  /users/:id/profile  →  reputationScore, totalReports
    PATCH /users/:id/ban     →  khóa / mở khóa tài khoản  [🔨]
    DELETE /users/:id        →  xóa tài khoản              [🔨]
```

**Endpoint:**

| Method | Path | Auth | Trạng thái |
|--------|------|------|-----------|
| GET | `/api/users` | JWT + ADMIN | ✅ Filter role, phân trang |
| PATCH | `/api/users/:id/role` | JWT + ADMIN | ✅ |
| GET | `/api/users/:id/profile` | JWT | ✅ reputationScore + totalReports |
| PATCH | `/api/users/:id/ban` | JWT + ADMIN | 🔨 |
| DELETE | `/api/users/:id` | JWT + ADMIN | 🔨 |

---

## 7. Database liên quan

```
users
  id, email, password (hash), role, reputationScore, createdAt
  isBanned Boolean  [🔨 thêm vào schema]

refresh_tokens
  id, token (unique), userId (FK), expiresAt, createdAt
  onDelete: Cascade — xóa user → xóa hết token
```

---

## 8. Bảo mật

| Cơ chế | Chi tiết |
|--------|---------|
| Bcrypt | Hash mật khẩu, SALT_ROUNDS = 10 |
| JWT dual secret | Access: `JWT_SECRET` · Refresh: `JWT_REFRESH_SECRET` |
| Token rotation | Mỗi refresh → xóa token cũ, cấp token mới |
| Rate limiting | Login: 5 req/60s · Reports: 10 req/60s |
| RolesGuard | Kiểm tra role ADMIN trước mọi admin endpoint |
| Giới hạn thiết bị | Tối đa 3 phiên song song (🔨 đang làm) |

---

## 9. Task còn lại (Dev B)

| # | Task | Ưu tiên |
|---|------|---------|
| 1 | POST /auth/logout-all | P2 |
| 2 | Giới hạn 3 thiết bị trong saveRefreshToken | P2 |
| 3 | PATCH /users/:id/ban — thêm isBanned vào schema | P2 |
| 4 | DELETE /users/:id | P3 |
| 5 | GET /users?search= tìm kiếm theo email | P3 |

---

*UrbanGuard — Bảo vệ bạn trên mọi cung đường*
