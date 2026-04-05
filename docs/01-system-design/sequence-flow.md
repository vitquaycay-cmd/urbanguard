# Luồng xử lý (Sequence / flow)

## Tạo báo cáo + AI + realtime

Luồng đã triển khai trong code (xem thêm [`architecture.md`](./architecture.md)):

```mermaid
sequenceDiagram
  participant U as Client (Web)
  participant API as NestJS API
  participant DB as MySQL (Prisma)
  participant PY as Python AI
  participant IO as Socket.IO
  participant M as Map clients

  U->>API: POST /api/reports (JWT, multipart)
  API->>DB: INSERT Report (PENDING)
  API->>PY: POST /ai/analyze { image_path }
  PY-->>API: detected, confidence, labels, …
  API->>DB: UPDATE (status, trustScore, aiSummary, aiLabels)
  API->>IO: emit report:new
  IO-->>M: refetch GET /api/reports/active
```

## Admin duyệt PENDING → VALIDATED

1. Admin **PATCH** `/api/reports/:id/status` với body VALIDATED.
2. Transaction: kiểm tra đang PENDING → cập nhật DB, cộng reputation user.
3. Nếu VALIDATED → **`report:new`** để bản đồ cập nhật marker.

## Đọc bản đồ (không sequence)

- Bất kỳ client nào: **GET** `/api/reports/active` — không cần đăng nhập.
