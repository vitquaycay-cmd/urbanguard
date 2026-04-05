# Tích hợp bản đồ (Leaflet)

Luồng bản đồ UrbanGuard: **react-leaflet** + **OSM tiles** + **LRM/OSRM** + **Socket.IO** + marker tùy chỉnh.

---

## Stack

| Thư viện | Vai trò |
|----------|---------|
| **react-leaflet** | `MapContainer`, `TileLayer`, `Marker`, `Popup`, `ZoomControl`, `Circle` |
| **leaflet** | Core map; CSS trong `layout` / component |
| **leaflet-routing-machine** | Panel chỉ đường, OSRM public `router.project-osrm.org` |
| **react-leaflet-cluster** | `MarkerClusterGroup` khi mật độ marker cao |
| **socket.io-client** | `io(MAP_API_BASE + '/realtime')` |

**Không SSR map:** `MapWithNoSSR.tsx` — `dynamic(() => import('./ActiveReportsMap'), { ssr: false })`.

Type stub: `frontend/src/types/leaflet-routing-machine.d.ts`.

---

## Dữ liệu marker

- **GET** `{API}/api/reports/active` — public, không JWT.
- Parse qua `fetchActiveReports()` → `ActiveReport[]`; chuẩn hoá `aiLabels`.
- **Client** chỉ render marker khi `status === 'VALIDATED'` và `trustScore > 0` (lớp phòng thủ thêm).

File chính: `ActiveReportsMap.tsx`, `DangerMarkersGroup.tsx`, `DangerMarker.tsx`, `DangerZoneCircle.tsx`.

---

## Routing & né sự cố

- **`IncidentRouteControl.tsx`:** lắng nghe `routesfound`, tính va chạm polyline ↔ tâm sự cố (**~115 m**, `INCIDENT_BUFFER_M` trong `routingService.ts`).
- **`routingAvoidance.ts`:** Haversine, khoảng cách điểm–đoạn / polyline.
- Banner: `formatIncidentAvoidanceBanner` — chuỗi dạng `Đã phát hiện sự cố […] trên lộ trình…`.
- Đường vẽ: `lineOptions.styles` có `className: 'urbanguard-route-line'` (animation trong `globals.css`).

Tests: `npm test` trong `frontend/` (`dangerZoneRouting.test.ts`, `routingAvoidance.test.ts`).

---

## Realtime

```text
Socket namespace: /realtime
Event: report:new
→ refetch GET /api/reports/active (khi payload có report hoặc id)
→ cập nhật markers; id mới → animation entrance (sau lần load đầu)
```

`withCredentials: true` — khớp CORS backend.

---

## Trang & layout

| Route | File | Ghi chú |
|-------|------|---------|
| `/map` | `app/map/page.tsx` | `h-dvh`, fullscreen |
| Logic map | `components/ActiveReportsMap.tsx` | Overlay search, banner, FAB, bottom hint |

---

## Tài liệu liên quan

- [Cấu trúc dự án](./project-structure.md)
- [State](./state-management.md)
- [Hệ thống frontend](../frontend-system.md) mục 6–7–9
