# Tính năng bản đồ

## Marker sự cố

- Chỉ hiển thị báo cáo **VALIDATED** (nguồn: **`GET /api/reports/active`**).
- Mỗi marker có thể kèm **`aiLabels`** để mô tả loại sự cố (từ YOLO).

## Tìm đường và né vùng sự cố

- **leaflet-routing-machine** dùng **OSRM** công khai (mặc định trong UI).
- Heuristic: thêm waypoint lệch so với đoạn polyline gần điểm sự cố để tránh đi xuyên qua “vùng nguy hiểm” (xem `frontend/src/lib/routingAvoidance.ts`).
- Cảnh báo người dùng dựa trên **`aiLabels`** hoặc tiêu đề báo cáo.

## Realtime

- Client kết nối **Socket.IO** namespace **`/realtime`** (qua proxy Next nếu cấu hình).
- Sự kiện **`report:new`**: sau khi tạo báo cáo (hoặc admin VALIDATED) — trang map **refetch** danh sách active để cập nhật marker mà không cần F5.

## File tham chiếu

- `frontend/src/components/ActiveReportsMap.tsx`
- `frontend/src/components/IncidentRouteControl.tsx`
- `frontend/src/lib/mapActiveReports.ts`
