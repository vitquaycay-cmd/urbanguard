# Cấu trúc dự án frontend

Tổ chức mã nguồn trong `frontend/` (Next.js App Router). Tài liệu tổng hợp: [`../frontend-system.md`](../frontend-system.md).

---

## Cây thư mục chính (`frontend/src`)

```
src/
├── app/                      # App Router
│   ├── layout.tsx
│   ├── globals.css           # Tailwind + CSS marker / popup / route line
│   ├── page.tsx              # Trang gốc
│   ├── map/page.tsx          # /map — fullscreen → MapWithNoSSR
│   └── report/
│       ├── page.tsx          # /report — bottom sheet gửi báo cáo
│       └── layout.tsx
├── components/
│   ├── ui/                   # Design system: Button, Badge, Banner, Card
│   ├── ActiveReportsMap.tsx  # Map fullscreen, socket, overlay, FAB
│   ├── IncidentRouteControl.tsx  # LRM + OSRM + né sự cố
│   ├── MapWithNoSSR.tsx      # dynamic(..., { ssr: false })
│   ├── dev/                  # ReportImageTestAssist (bật bằng env)
│   └── map/
│       ├── DangerMarker.tsx
│       ├── DangerMarkersGroup.tsx
│       ├── DangerZoneCircle.tsx
│       └── ReportDangerPopup.tsx
├── services/
│   ├── report.api.ts         # login, createReport (multipart)
│   └── routingService.ts     # buffer 115m, banner, detour
├── lib/
│   ├── apiConfig.ts          # NEXT_PUBLIC_API_URL
│   ├── mapActiveReports.ts   # fetchActiveReports, MAP_API_BASE
│   ├── dangerMarkerTheme.ts  # HTML/SVG marker + halo
│   ├── routingAvoidance.ts   # Haversine, point–polyline
│   └── dangerZoneRouting.ts  # re-export routingService
└── types/
    └── leaflet-routing-machine.d.ts
```

---

## Quy tắc phân tầng

| Thư mục | Trách nhiệm |
|---------|-------------|
| `app/` | Route, composition; không nhồi logic routing/OSRM. |
| `components/ui/` | Thành phần tái sử dụng, không phụ thuộc Leaflet. |
| `components/map/` | Mọi thứ gắn react-leaflet / marker / popup. |
| `services/` | Gọi API có kiểu + logic domain routing client. |
| `lib/` | Pure helper, dễ test (Vitest). |

---

## Tài liệu liên quan

- [Setup frontend](./setup-frontend.md)
- [Tích hợp API](./api-integration.md)
- [Tích hợp bản đồ](./map-integration.md)
