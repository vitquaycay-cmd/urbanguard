---
name: brainstorm-truoc-code
description: >-
  Buộc tư duy và tài liệu hóa trước khi sửa code: mục tiêu, phạm vi, ràng buộc,
  phương án, rủi ro, quyết định. Dùng khi user yêu cầu tính năng mới, refactor,
  sửa bug phức tạp, hoặc nói "brainstorm trước", "brainstorm-truoc-code",
  "suy nghĩ trước khi code".
---

# Brainstorm trước khi code

## Khi nào bật skill này

- User gọi đúng tên skill hoặc từ khóa tương đương.
- Thay đổi ảnh hưởng nhiều file, API, DB, hoặc hành vi người dùng.
- Bug chưa rõ nguyên nhân (cần giả thuyết có kiểm chứng).

## Thứ tự bắt buộc (chưa xong các bước dưới thì chưa viết code)

### 1. Làm rõ mục tiêu

- Người dùng / hệ thống cần **đạt được điều gì** sau thay đổi?
- Tiêu chí "xong" (acceptance) có thể kiểm tra như thế nào?

### 2. Phạm vi và không làm gì

- **In scope:** những gì sẽ làm trong lượt này.
- **Out of scope:** cố ý không làm (tránh phình phạm vi).

### 3. Ràng buộc

- Công nghệ (Nest, Prisma, Next, v.v.), phiên bản, môi trường.
- Hiệu năng, bảo mật, backward compatibility.
- Thời gian / độ phức tạp chấp nhận được.

### 4. Phương án (ít nhất 2 nếu có lựa chọn thật)

- Mô tả ngắn từng hướng.
- Ưu / nhược so với nhau.
- Nếu chỉ có một hướng hợp lý, nêu lý do **tại sao** không cần lựa chọn khác.

### 5. Rủi ro và giảm thiểu

- Lỗi, regression, dữ liệu, UX.
- Cách giảm (test, feature flag, migration an toàn, rollback).

### 6. Quyết định và kế hoạch triển khai

- Chọn **một** phương án (hoặc tách làm nhiều bước có thứ tự).
- Liệt kê **bước code / file** dự kiến (checklist ngắn).

### 7. Sau đó mới code

- Viết hoặc sửa code theo checklist.
- Ưu tiên chạy test / build liên quan trước khi báo xong (nếu repo có script).

## Ghi chú

- Brainstorm có thể ngắn (vài bullet) nếu task nhỏ; vẫn phải đủ mục tiêu + phạm vi + quyết định.
- Nếu thiếu thông tin chặn quyết định, hỏi user **một** cụm câu hỏi tập trung, không lan man.

## Ví dụ (rút gọn)

**Task:** Thêm filter báo cáo theo ngày trên API.

1. **Mục tiêu:** `GET /reports/active?from=&to=` lọc theo `createdAt`.
2. **Phạm vi:** Chỉ endpoint public active; không đổi admin.
3. **Ràng buộc:** MySQL + Prisma; timezone UTC trong API.
4. **Phương án:** (A) query params — đơn giản; (B) POST body — không cần.
5. **Rủi ro:** Sai timezone → document + ví dụ ISO.
6. **Quyết định:** A; sửa DTO + `findMany` `where`.
7. **Code:** …
