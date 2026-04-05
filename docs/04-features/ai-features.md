# Tính năng AI

## Phát hiện trên ảnh (YOLO)

- User gửi ảnh kèm báo cáo; **Python FastAPI** chạy **Ultralytics YOLOv8n** trên file trong `backend/uploads/`.
- Kết quả gồm: có/không phát hiện đối tượng liên quan (`detected`), độ tin cậy (`confidence`), danh sách nhãn (`labels`), chi tiết tùy chọn (`predict`).

## Tự động duyệt và điểm tin cậy

- **Auto VALIDATED:** `detected === true` và **`confidence` > 0.7** → báo cáo lên bản đồ ngay, `trustScore = 15`, lưu `aiLabels` / `aiSummary`, cộng **reputation** người gửi.
- **Cần admin:** `confidence` < 0.5 (hoặc vùng trung gian chưa đủ điều kiện auto) → **PENDING**.
- **AI lỗi / tắt:** vẫn **PENDING**, `aiSummary` ghi lỗi để admin / debug.

## Hiển thị cho người dùng

- **`GET /api/reports/active`** trả **`aiLabels`** cho marker và cảnh báo trên UI / routing.
- Không lộ đường dẫn tuyệt đối máy chủ trong JSON lưu DB (chỉ tên file / metadata an toàn).

## Endpoint Python (tham khảo)

- **`POST /ai/analyze`** — dùng bởi Nest (`AiService`).
- **`POST /predict`** — tương thích / debug predict chi tiết (Swagger AI: `/docs`).
