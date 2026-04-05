# UrbanGuard — Frontend Design & Navigation Guide

Tài liệu hướng dẫn **thiết kế UI/UX** và **logic điều hướng thông minh** cho frontend UrbanGuard. Nội dung căn cứ cấu trúc code hiện tại (`frontend/`) và có thể dùng làm chuẩn mở rộng (form báo cáo, auth UI, v.v.).

---

## 1. Tổng quan công nghệ

### 1.1. Stack

| Công nghệ | Vai trò trong UrbanGuard |
|-----------|---------------------------|
| **Next.js** (App Router) | SSR/SSG cho layout & landing; trang `/map` ưu tiên tải client cho Leaflet. |
| **React 19** | Component map, state realtime, tích hợp react-leaflet. |
| **Tailwind CSS** | Utility-first: typography zinc, banner amber, layout responsive. |
| **Leaflet + react-leaflet** | Tiles OSM, marker tùy chỉnh, vòng danger (`Circle`), routing control. |
| **leaflet-routing-machine** | Tích hợp OSRM công khai — tuyến đường, waypoint, sự kiện `routesfound`. |
| **leaflet.markercluster** | Gom cụm marker khi mật độ cao (zoom để spiderfy). |
| **socket.io-client** | Namespace `/realtime`, sự kiện `report:new` — cập nhật marker không F5. |
| **Lucide React** *(khuyến nghị)* | Icon UI nhất quán cho header, nút, form (trang ngoài map). *Ghi chú: repo hiện chưa khai báo dependency; có thể thêm `lucide-react` khi xây navigation / CTA.* |

### 1.2. `dynamic import` cho Map — SEO & hiệu năng

Leaflet gắn với `window` và DOM; render phía server dễ lỗi **hydration** và tăng bundle cho request không cần map.

**Pattern dùng trong repo:** bọc toàn bộ cây map trong `next/dynamic` với `ssr: false`.

```tsx
// frontend/src/components/MapWithNoSSR.tsx
"use client";

import dynamic from "next/dynamic";

const ActiveReportsMap = dynamic(() => import("./ActiveReportsMap"), {
  ssr: false,
  loading: () => (
    <p className="p-4 text-zinc-500 text-center">Đang tải bản đồ…</p>
  ),
});

export default function MapWithNoSSR() {
  return <ActiveReportsMap />;
}
```

**Lợi ích:**

- Trang `/map` vẫn có metadata/layout Next.js; phần map chỉ tải trên client → **không đụng SSR Leaflet**.
- Code map (LRM, cluster) nằm trong chunk riêng → **giảm JS cho route khác** (ví dụ `/`).
- Placeholder `loading` giữ **CLS** ổn định và báo trạng thái rõ ràng.

---

## 2. Hệ thống Visual Identity

### 2.1. Bảng màu & ý nghĩa UX

| Vai trò | Màu (Tailwind / hex) | Ứng dụng |
|---------|----------------------|----------|
| **Sự cố / mức độ** | **Đỏ** `#dc2626` (red-600), **cam** `#ea580c` (orange-600), **vàng đậm** `#ca8a04` | Marker `L.divIcon` theo `trustScore` (`dangerMarkerTheme.ts`) — càng cao càng “nóng”. |
| **Tuyến đường OSRM** | **Xanh** `#2563eb` (blue-600), opacity ~0.55 | Polyline LRM — tách biệt khỏi layer danger, dễ đọc trên nền OSM. |
| **Vùng nguy hiểm (vòng)** | Đỏ trong suốt (`DangerZoneCircle`) | Thể hiện bán kính ~50 m quanh tâm báo cáo — trực quan, không che tile. |
| **Nhãn AI & cảnh báo lộ trình** | **Amber (hổ phách)** `amber-50` / `amber-300` / `amber-900`–`950` | Khối nhãn trong popup + **banner** phía trên map: vừa **cảnh báo** vừa **có cấu trúc** (tin cậy hơn so với đỏ thuần cho khối thông tin dài). |
| **Chữ nền sáng** | `zinc-900`, `zinc-600`, `zinc-500` | Tiêu đề, mô tả, phụ đề — độ tương phản tốt trên `bg-zinc-50`. |

**Vì sao Amber cho nhãn AI?**

- Đỏ toàn phần gợi **lỗi nghiêm trọng** hoặc panic; nhãn AI là **thông tin phân loại** cần đọc kỹ → amber giữ **mức cảnh báo vừa phải**.
- Viền `border-amber-300` + nền `bg-amber-50` tạo **“card”** nhận diện được trong popup đông thông tin.

**Minh họa Tailwind — khối nhãn AI (popup):**

```tsx
<div className="mb-3 rounded-md border border-amber-300 bg-amber-50 px-2.5 py-2">
  <p className="text-[10px] font-semibold uppercase tracking-wide text-amber-900 mb-1">
    Nhãn AI (phân loại sự cố)
  </p>
  <p className="text-sm font-semibold leading-snug text-amber-950">
    {labels.join(", ")}
  </p>
</div>
```

**Banner phía trên bản đồ (cùng họ amber):**

```tsx
<div
  className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-950"
  role="status"
>
  {routeWarning}
</div>
```

### 2.2. Iconography: Lucide (UI) × Leaflet (bản đồ)

- **Giao diện React (header, form, CTA):** dùng **Lucide React** khi đã thêm dependency — kích thước `size={18|20}`, `strokeWidth={2}`, màu `text-zinc-600` hoặc `text-amber-700` để đồng bộ với banner/popup.
- **Trên bản đồ:** UrbanGuard dùng **`L.divIcon` + SVG inline** (tam giác cảnh báo + dấu “!”) trong `buildDangerMarkerHtml` — **không** mix Lucide trực tiếp vào Leaflet (DOM khác lifecycle React).

**Phân biệt “loại” sự cố hiện tại:**

- **Màu marker** theo `trustScore` (mức tin cậy), không theo từng class YOLO.
- **Nội dung loại sự cố** thể hiện bằng **nhãn AI** (text đậm) trong popup; roadmap: có thể map `aiLabels[0]` → variant màu viền nhẹ hoặc badge nhỏ, vẫn giữ hình tam giác chung để nhận diện thương hiệu.

**CSS hỗ trợ marker (pulse khi gần tuyến):** xem `globals.css` — class `danger-marker--near-route` + `@keyframes danger-marker-near-route-pulse` (glow đỏ nhẹ, không che bản đồ).

---

## 3. Thiết kế trải nghiệm bản đồ (Map UX)

### 3.1. Quy tắc hiển thị marker

- **API** `GET /api/reports/active` chỉ trả báo cáo **VALIDATED**.
- **Client** vẫn lọc thêm: `status === "VALIDATED"` trước khi render `DangerMarkersGroup`, `DangerZoneCircle`, `FitBounds` — **phòng thủ sâu** nếu sau này API mở rộng.

Chỉ báo cáo **đã duyệt** xuất hiện trên map công khai → giảm nhiễu, tăng **độ tin cậy cảm nhận** của người dùng.

### 3.2. Cấu trúc popup — `ReportDangerPopup`

Popup gắn với `DangerMarker` (click marker). Thứ tự thông tin tối ưu **nhận diện nhanh**:

1. **Tiêu đề** (`title`) — ngữ cảnh ngắn.
2. **Trust score** — số nổi bật `text-red-700` (mức rủi ro/tin cậy theo hệ thống).
3. **Khối nhãn AI** — nếu có: amber, chữ **in đậm** `font-semibold`, nhãn từ pipeline **YOLOv8** (qua Nest/FastAPI), giúp user liên hệ “máy đã nhìn thấy gì”.
4. **Ảnh thực tế** — `object-cover`, chiều cao cố định (`h-36`), viền nhẹ: chứng cứ trực quan ngay dưới nhãn.
5. **Mô tả** — `whitespace-pre-wrap`, cỡ chữ nhỏ để không cạnh tranh với ảnh/nhãn.

```tsx
// Thứ tự logic: tiêu đề → trust → nhãn AI (đậm) → ảnh → mô tả
// File: frontend/src/components/map/ReportDangerPopup.tsx
```

**URL ảnh:** `resolveReportImageUrl` ghép `NEXT_PUBLIC_API_URL` với đường dẫn tương đối `/uploads/...` từ API.

### 3.3. Gom cụm (cluster)

Khi số marker VALIDATED vượt ngưỡng, bật `MarkerClusterGroup` — tránh chồng icon, giữ **tương tác chạm** trên mobile ổn định hơn (zoom để mở chi tiết).

---

## 4. Logic điều hướng & tránh né

Toàn bộ chạy **client-side** (OSRM công khai); không thay thế cảnh báo pháp lý — chỉ **hỗ trợ quyết định**.

### 4.1. `INCIDENT_BUFFER_M = 115` — vì sao 115 m?

- **Vòng vẽ** trên map ~**50 m** — gợi “khu vực quan tâm” quanh điểm báo cáo.
- **Đệm va chạm tuyến** **115 m** lớn hơn vòng vẽ để:
  - Bắt được đoạn đường **đi sát** sự cố nhưng không đi xuyên tâm (thực tế làn đường, mép ổ gà, vỉa hè).
  - Tránh quá rộng (vd. 300 m) gây **né quá sớm** trên đô thị chật; tránh quá hẹp (vd. 30 m) **bỏ sót** tuyến vẫn “ôm” khu sự cố sau khi OSRM snap.

Hằng số có thể tinh chỉnh theo thử nghiệm thực địa; giá trị hiện tại là **cân bằng** giữa nhạy và ít báo động giả.

### 4.2. Banner cảnh báo & gộp nhãn

Khi polyline OSRM có điểm gần tâm sự cố trong đệm **115 m**, `IncidentRouteControl` gọi `onAvoidanceMessage` với nội dung từ **`formatIncidentAvoidanceBanner(hits)`**:

- Gom **tất cả** zone va chạm trên tuyến (theo thứ tự dọc polyline).
- **Ưu tiên `aiLabels`** từng báo cáo; fallback **`label`** (tiêu đề / chuỗi ghép).
- **Loại trùng** không phân biệt hoa thường.

**Định dạng cố định (UX — user học một lần):**

```text
Đã phát hiện sự cố [nhãn1, nhãn2, …] trên lộ trình, đang điều hướng tránh né.
```

**Vị trí UI:** banner nằm **trên** khối map (`ActiveReportsMap`), **không** phủ Leaflet — tài xế/ người xem vẫn thấy toàn bộ tile; `role="status"` hỗ trợ **a11y** (screen reader).

### 4.3. Thuật toán né — `computeDetourWaypoint`

Pipeline gọn:

1. **`dangerZonesFromReports`** — từ báo cáo eligible (**VALIDATED + trust > 0**) tạo `DangerZone` (tâm, bán kính vẽ, **hitRadius = 115 m**, `aiLabels`).
2. **`dangerZonesHitByRoute`** — khoảng cách nhỏ nhất từ tâm zone tới polyline ≤ hit radius.
3. **`buildRouteWithFallback`** — luân phiên mức lệch **300 / 450 / 600 m** và hai phía (xa / gần tâm vùng), tối đa **`MAX_DETOUR_INJECTIONS`** lần chèn.
4. **`computeDetourWaypoint(zone, poly, detourMeters, preferFarther)`**:
   - Gọi **`generateDetourPoints`**: tìm điểm trên polyline gần tâm sự cố → **neo dọc hướng tuyến** (`DETOUR_ANCHOR_FORWARD_M`, vd. 65 m) → hai điểm **vuông góc** đường đi, cách neo `detourM` mét — giảm hiện tượng OSRM **snap lại đúng cung nguy hiểm**.
   - **`pickDetourWaypoint`** chọn một phía theo `preferFarther`.
5. **LRM** chèn một `via` giữa điểm đầu và đích → gọi OSRM lại → lặp đến khi hết chiến lược hoặc không còn va chạm.

**Khi thất bại:** giữ polyline cuối, hiển thị **`ROUTING_FALLBACK_MESSAGE_VI`** — không xóa tuyến để user tự kéo waypoint.

---

## 5. Realtime & responsive

### 5.1. Socket.IO — marker “nóng”

```tsx
useEffect(() => {
  const socket = io(`${MAP_API_BASE}/realtime`, { transports: ["websocket"] });
  const onReportNew = () => {
    void loadReports();
  };
  socket.on("report:new", onReportNew);
  return () => {
    socket.off("report:new", onReportNew);
    socket.disconnect();
  };
}, [loadReports]);
```

- **`MAP_API_BASE`** = `NEXT_PUBLIC_API_URL` (gốc backend, không `/api` thừa ở path socket).
- Refetch **`fetchActiveReports`** cập nhật state → marker/cluster vẽ lại **không cần F5**.
- **Không remount** `MapContainer` (`mapKey` cố định) để giữ tuyến đang chỉnh.

### 5.2. Responsive & mobile-first

| Hạng mục | Thực hành |
|----------|-----------|
| **Khung map** | `height: min(75vh, 620px)` — trên mobile dùng nhiều viewport, vẫn giới hạn max để không chiếm trọn màn hình dài vô hạn. |
| **Layout trang** | `max-w-5xl mx-auto px-4` — nội dung không tràn mép trên điện thoại. |
| **Chạm (touch)** | Leaflet mặc định hỗ trợ kéo/zoom; cluster `spiderfyOnMaxZoom` giúp tách marker khi zoom gần. |
| **Banner** | `text-sm`, padding vừa đủ — đọc được một tay cầm máy. |

**Gợi ý mở rộng:** `touch-action` và nút “Locate me” (geolocation) cho luồng báo cáo khi đang ngoài đường; giữ **target tối thiểu 44×44 px** cho control tùy chỉnh nếu thêm.

---

## 6. Liên kết mã nguồn

| Chủ đề | File chính |
|--------|------------|
| Dynamic map | `frontend/src/components/MapWithNoSSR.tsx` |
| Trang map, banner, socket | `frontend/src/components/ActiveReportsMap.tsx` |
| Routing OSRM + banner text | `frontend/src/components/IncidentRouteControl.tsx` |
| Zone, buffer, detour | `frontend/src/services/routingService.ts` |
| Popup | `frontend/src/components/map/ReportDangerPopup.tsx` |
| Marker HTML + màu trust | `frontend/src/lib/dangerMarkerTheme.ts` |
| CSS marker | `frontend/src/app/globals.css` |

---

## 7. Kiến trúc tổng thể

Xem thêm: [`../SYSTEM_ARCHITECTURE.md`](../SYSTEM_ARCHITECTURE.md) (root repo) và [`01-system-design/system-architecture.md`](./01-system-design/system-architecture.md).

---

*Tài liệu này phản ánh triển khai frontend UrbanGuard; khi thêm `lucide-react` hoặc màn hình mới, nên cập nhật mục 1.1 và 2.2 cho đồng bộ.*
