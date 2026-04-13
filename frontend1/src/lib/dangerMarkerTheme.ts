import type { ActiveReport } from "@/lib/mapActiveReports";
import { DANGER_ZONE_RADIUS_METERS } from "@/services/routingService";

/** Ngưỡng trustScore → màu marker (theo spec). */
export const TRUST_THRESHOLDS = {
  /** Trên ngưỡng này: đỏ — mức nghiêm trọng cao */
  high: 10,
  /** Trên ngưỡng này (và ≤ high): cam */
  medium: 5,
} as const;

/** Màu fill marker theo mức độ (hex). */
export function trustScoreToMarkerColor(trustScore: number): string {
  if (trustScore > TRUST_THRESHOLDS.high) return "#dc2626"; // red-600
  if (trustScore > TRUST_THRESHOLDS.medium) return "#ea580c"; // orange-600
  return "#ca8a04"; // yellow-700 (đọc được trên nền sáng)
}

/**
 * Bán kính vòng danger (m) — đồng bộ {@link DANGER_ZONE_RADIUS_METERS} trong `routingService`.
 */
export function dangerZoneRadiusMeters(_report: ActiveReport): number {
  return DANGER_ZONE_RADIUS_METERS;
}

/** Kích thước icon (px) — trong khoảng 35–40; phóng to nhẹ khi gần route. */
export const MARKER_BASE_PX = 38;
export const MARKER_HIGHLIGHT_PX = 44;

export type DangerMarkerVisualOptions = {
  trustScore: number;
  /** Gần tuyến đường: icon lớn hơn + class `danger-marker--near-route` (pulse CSS). */
  nearRoute: boolean;
  /** Marker mới (realtime): animation entrance một lần. */
  playEntrance?: boolean;
};

/**
 * HTML cho `L.divIcon`: halo pulse (CSS) + pin SVG tam giác cảnh báo.
 * Không nhúng dữ liệu người dùng vào HTML (chỉ màu tinh chỉnh từ số).
 */
export function buildDangerMarkerHtml({
  trustScore,
  nearRoute,
  playEntrance = false,
}: DangerMarkerVisualOptions): string {
  const fill = trustScoreToMarkerColor(trustScore);
  const size = nearRoute ? MARKER_HIGHLIGHT_PX : MARKER_BASE_PX;
  const nearRouteClass = nearRoute ? " danger-marker--near-route" : "";
  const entranceClass = playEntrance ? " danger-marker-leaflet--entrance" : "";
  const haloStrong =
    trustScore > TRUST_THRESHOLDS.high ? " danger-marker-halo--strong" : "";

  // Viền trắng (stroke) giúp marker nổi trên nền map; không dùng <filter id> (tránh trùng id).
  return `
<div class="danger-marker-leaflet${entranceClass}">
  <span class="danger-marker-halo${haloStrong}" aria-hidden="true"></span>
  <span class="danger-marker-halo danger-marker-halo--delay${haloStrong}" aria-hidden="true"></span>
  <div class="danger-marker-root${nearRouteClass}" style="width:${size}px;height:${size}px;">
    <svg width="${size}" height="${size}" viewBox="0 0 40 44" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M20 3 L37 34 Q20 40 20 40 Q20 40 3 34 Z" fill="${fill}" stroke="#ffffff" stroke-width="2.75" stroke-linejoin="round"/>
      <path d="M20 12 L20 22" stroke="white" stroke-width="2.2" stroke-linecap="round"/>
      <circle cx="20" cy="27" r="1.8" fill="white"/>
    </svg>
  </div>
</div>`.trim();
}

/** Kích thước khung divIcon (chứa halo + pin) — lớn hơn pin để pulse không bị cắt. */
export const MARKER_LEAFLET_BOX_W = 48;
export const MARKER_LEAFLET_BOX_H = 56;
