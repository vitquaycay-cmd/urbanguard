# AI module (NestJS)

Module **`ai`** trong backend chỉ là **HTTP client** tới dịch vụ Python; không chạy model trong process Nest.

## Vị trí mã

- `backend/src/ai/ai.module.ts` — import `HttpModule`, export `AiService`
- `backend/src/ai/ai.service.ts` — `analyze(imageFilename: string)`

## Cấu hình

- Biến **`AI_SERVICE_URL`**: gốc URL Python, **không** có `/` cuối (ví dụ `http://127.0.0.1:8000`).
- Hàm `stripTrailingSlash` trong `backend/src/common/url.util.ts` chuẩn hoá URL.

## Hành vi `AiService.analyze`

1. Gọi **`POST {AI_SERVICE_URL}/ai/analyze`** với body JSON `{ "image_path": "<tên file>" }` — chỉ **tên file** trong `backend/uploads/`, không gửi đường dẫn tuyệt đối.
2. Timeout 120s (ảnh / model có thể chậm).
3. Kiểm tra phản hồi có `detected: boolean`; nếu không hợp lệ → throw (Reports sẽ bắt và lưu PENDING + JSON lỗi).

## Kiểu phản hồi (khớp FastAPI)

```ts
{
  detected: boolean;
  confidence: number;
  labels: string[];
  predict?: Record<string, unknown>;
}
```

## Khác với `ai-review/`

Thư mục `backend/src/ai-review/` là **khung cũ / mở rộng**; luồng báo cáo hiện tại dùng **`ai`** + Python `ai-service/`.

## Liên quan

- Gọi từ: `ReportsService.create` — xem [`reports-module.md`](./reports-module.md)
- Python: `ai-service/main.py`, `path_utils.py`, `analyze_utils.py`
