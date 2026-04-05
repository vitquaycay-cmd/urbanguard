# UI design

Nguyên tắc giao diện UrbanGuard: **Tailwind** + **Framer Motion**, phong cách gần app bản đồ production (fullscreen map, overlay, FAB).

Tài liệu chi tiết hơn: [`../frontend-design-guide.md`](../frontend-design-guide.md), [`../frontend-system.md`](../frontend-system.md).

---

## Design system (`components/ui/`)

| Component | Vai trò |
|-----------|---------|
| **Button** | `primary` \| `danger` \| `ghost` — `whileTap` scale ~0.95 |
| **Badge** | `trust` (đỏ), `ai` (amber), `neutral` |
| **Banner** | `warning` \| `danger` — slide + `AnimatePresence`; map dùng `position="fixed-top"` |
| **Card** | `rounded-xl`, `shadow-md` / `elevated` |

---

## Màu (semantic)

| Token / ý nghĩa | Tailwind / ghi chú |
|-----------------|-------------------|
| Nguy hiểm / CTA báo cáo | `red-500`, `red-600`, gradient FAB |
| AI / cảnh báo lộ trình | `amber-50` … `amber-950` |
| Chữ | `zinc-800`, `zinc-600`, `zinc-500` |
| Nền | `white`, `zinc-50`, `zinc-100` |
| Tuyến OSRM | Xanh đậm (`#1d4ed8`), weight 5, class `urbanguard-route-line` |

Marker theo **trustScore**: `dangerMarkerTheme.ts` (đỏ / cam / vàng đậm).

---

## Trang `/map`

- **Fullscreen** `100dvh`, map absolute full viewport.
- **Overlay trên:** thanh tìm kiếm (UI placeholder), **banner** cảnh báo sự cố trên tuyến (amber).
- **Dưới:** chip hướng dẫn route / cluster.
- **FAB** “+” góc phải dưới — link `/report`.
- **Marker:** pin SVG + halo pulse (CSS); trust cao → pulse mạnh hơn; marker mới → entrance animation.
- **Popup:** card `rounded-2xl`, badge trust / AI, motion fade-slide.

---

## Trang `/report`

- **Bottom sheet** mobile-first: `rounded-t-[1.75rem]`, shadow lớn.
- Khối đăng nhập (amber card), upload ảnh, tiêu đề, nút gửi danger.
- Trạng thái: “Đang phân tích bằng AI…”, toast “Báo cáo đã được ghi nhận…”.

---

## CSS global (`app/globals.css`)

- `.danger-marker-halo*` — pulse vòng quanh pin.
- `.danger-marker-leaflet--entrance` — bounce xuất hiện.
- `.urbanguard-popup` — popup Leaflet full-bleed card.
- `.urbanguard-route-line` — fade-in đường đi.

---

## Hiệu năng UI

- `React.memo` trên `DangerMarker` khi props ổn định.
- Debounce polyline cho layer highlight marker.
