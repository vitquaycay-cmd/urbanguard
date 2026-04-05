# Quản lý state

Frontend **không** dùng Redux / Zustand. State cục bộ **React** (`useState`, `useEffect`, `useMemo`, `useCallback`, `useRef`) là đủ cho map + báo cáo.

---

## Trang `/map` (`ActiveReportsMap`)

| State | Kiểu / mô tả |
|-------|----------------|
| `reports` | `ActiveReport[]` — nguồn từ `GET /active` |
| `loading`, `error` | Trạng thái tải / lỗi |
| `routeWarning` | Chuỗi banner né đường (từ `IncidentRouteControl`) |
| `routeCoords` | Polyline OSRM hiện tại — highlight marker gần tuyến |
| `entranceReportIds` | `Set<number>` — id marker “mới” sau lần sync đầu (animation entrance) |

**Realtime:** `socket.on("report:new")` → gọi lại `loadReports()` → cập nhật `reports`.

**Tối ưu:** `useDebouncedValue(routeCoords, 140)` đưa xuống `DangerMarkersGroup` để giảm tính toán khi polyline cập nhật dày.

---

## Trang `/report`

| State | Mô tả |
|-------|--------|
| `token` | JWT (đồng bộ từ `localStorage` sau login) |
| Form: `title`, `file`, `lat`, `lng`, `geoStatus` | Nhập liệu + GPS |
| `submitBusy`, `error`, `toast` | UX gửi / lỗi / thành công |
| `fileInputKey` | Đổi key `<input type="file">` sau submit để chọn lại cùng tên file |

---

## Refs

- `IncidentRouteControl`: refs cho LRM control, injection index, suppress waypoint reset.
- `skipInitialEntranceRef` / `prevValidatedIdsRef`: phát hiện id mới cho animation marker.

---

## Cache

- **Không** cache HTTP tầng global; `fetchActiveReports` dùng `cache: "no-store"`.
- Danh sách báo cáo = cache **trong memory** theo phiên tab; refetch khi mount và khi socket.

---

## Đồng bộ với backend

- Sự thật nghiệp vụ (VALIDATED, trustScore) do **API** quyết định; client lọc lại một lớp cho an toàn UX.

Xem: [`../frontend-system.md`](../frontend-system.md) mục 11.
