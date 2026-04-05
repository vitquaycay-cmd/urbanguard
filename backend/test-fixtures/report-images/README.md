# Ảnh dùng test upload báo cáo

## Cách nhanh (không đổi đường dẫn trong Swagger)

Từ thư mục `backend/`:

```bash
npm run fixture:report-image -- "đường/dẫn/đến/ảnh-của-bạn.jpg"
```

Script sẽ ghi đè file `current.<jpg|png|…>` trong thư mục này (xóa `current.*` cũ trước khi copy).

Sau đó trong **Swagger** (`POST /api/reports`), field **image** luôn chọn cùng một file, ví dụ:

`backend/test-fixtures/report-images/current.jpg`

## Ghi chú

- Giới hạn kích thước và MIME giữ nguyên theo API (ảnh JPEG/PNG/GIF/WebP, tối đa 5MB).
- File upload thật vẫn nằm trong `backend/uploads/` sau khi gọi API; thư mục này chỉ là **nguồn chọn file cho tay** khi test.
