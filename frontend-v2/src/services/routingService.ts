/**
 * UrbanGuard — logic bản đồ & né vùng nguy hiểm (client-only, OSRM công khai).
 * Không chèn tâm sự cố làm waypoint; chỉ dùng cặp điểm lệch vuông góc tuyến.
 */

import type { ActiveReport } from "@/lib/mapActiveReports";
import {
  bearingDeg,
  closestPointOnSegment,
  destinationFromDegrees,
  getClosestPointOnPolyline,
  haversineM,
  minDistancePointToPolylineM,
  type LatLngLiteral,
} from "@/lib/routingAvoidance";

/** Bán kính vòng vẽ trên map (30–80 m). */
export const DANGER_ZONE_RADIUS_MIN_M = 30;
export const DANGER_ZONE_RADIUS_MAX_M = 80;
export const DANGER_ZONE_RADIUS_METERS = 50;

/**
 * Bán kính đệm quanh tâm sự cố: tuyến OSRM trong phạ vi này → banner né + thử chèn waypoint.
 * (Khác với bán kính vòng vẽ trên map — có thể nhỏ hơn.)
 */
export const INCIDENT_BUFFER_M = 115;

function clampIncidentBufferM(m: number): number {
  return Math.min(250, Math.max(40, m));
}

/** Giữ cho test / tùy chỉnh cũ; mặc định dùng `INCIDENT_BUFFER_M`. */
export const ROUTING_HIT_TEST_RADIUS_MIN_M = 40;
export const ROUTING_HIT_TEST_RADIUS_MAX_M = 250;
export const ROUTING_HIT_TEST_RADIUS_M = INCIDENT_BUFFER_M;

/** Neo điểm lệch: bước dọc hướng đi trên polyline trước khi lệch vuông góc (tránh đặt via ngay trên điểm gần tâm nhất). */
export const DETOUR_ANCHOR_FORWARD_M = 65;

/** Chỉ xét vùng có tâm trong ROI này quanh polyline (hiệu năng). */
export const DANGER_NEAR_ROUTE_ROI_METERS = 1400;

/**
 * Chiến lược né: mỗi mức thử 2 phía (xa / gần tâm vùng).
 * Sau hết mức → fallback (giữ route OSRM, cảnh báo).
 */
export const DETOUR_STRATEGY_METERS = [300, 450, 600] as const;

/** Tổng số lần chèn tối đa = số mức × 2 phía. */
export const MAX_DETOUR_INJECTIONS =
  DETOUR_STRATEGY_METERS.length * 2;

export const ROUTING_FALLBACK_MESSAGE_VI =
  "Không tìm được tuyến né tự động qua OSRM — tuyến hiện tại vẫn hiển thị và có thể đi qua khu vực có báo cáo. Hãy kéo waypoint trên bản đồ để chỉnh tay.";

export type DangerZone = {
  lat: number;
  lng: number;
  /** Bán kính hiển thị / tham chiếu (vòng Leaflet). */
  radiusMeters: number;
  /**
   * Bán kính kiểm tra giao với polyline (m) — mặc định `INCIDENT_BUFFER_M`
   * (tuyến trong vùng này quanh tâm sự cố được coi là “va chạm”).
   */
  hitRadiusMeters: number;
  id?: string | number;
  /** Chuỗi hiển thị / fallback khi không có `aiLabels`. */
  label?: string;
  /** Nhãn AI từ báo cáo — dùng cho banner né đường. */
  aiLabels?: string[];
};

function zoneCenter(z: DangerZone): LatLngLiteral {
  return { lat: z.lat, lng: z.lng };
}

export function clampDangerZoneRadiusMeters(m: number): number {
  return Math.min(
    DANGER_ZONE_RADIUS_MAX_M,
    Math.max(DANGER_ZONE_RADIUS_MIN_M, m),
  );
}

/**
 * Báo cáo dùng cho né tuyến: VALIDATED và trustScore > 0.
 * (API /active đã lọc VALIDATED — vẫn kiểm tra phòng client lệch.)
 */
function isEligibleTrustScore(raw: unknown): boolean {
  const n = Number(raw);
  return Number.isFinite(n) && n > 0;
}

export function getValidatedReportsForRouting(
  reports: ActiveReport[],
): ActiveReport[] {
  return reports.filter(
    (r) =>
      String(r.status).toUpperCase() === "VALIDATED" &&
      isEligibleTrustScore(r.trustScore) &&
      Number.isFinite(r.latitude) &&
      Number.isFinite(r.longitude),
  );
}

/** Chuyển báo cáo đã lọc → vùng nguy hiểm (vẽ `radiusMeters`; va chạm tuyến theo `hitRadiusMeters`). */
export function dangerZonesFromReports(
  reports: ActiveReport[],
  radiusMeters: number = DANGER_ZONE_RADIUS_METERS,
  hitRadiusMeters: number = INCIDENT_BUFFER_M,
): DangerZone[] {
  const R = clampDangerZoneRadiusMeters(radiusMeters);
  const hitR = clampIncidentBufferM(hitRadiusMeters);
  return reports.map((r) => {
    const labels =
      r.aiLabels && r.aiLabels.length > 0
        ? r.aiLabels.filter((x): x is string => typeof x === "string" && x.trim() !== "")
        : [];
    return {
      id: r.id,
      lat: r.latitude,
      lng: r.longitude,
      radiusMeters: R,
      hitRadiusMeters: hitR,
      aiLabels: labels.length > 0 ? labels : undefined,
      label:
        labels.length > 0
          ? labels.join(", ")
          : r.title || `Sự cố #${r.id}`,
    };
  });
}

/**
 * Banner vàng khi tuyến đi vào đệm sự cố: liệt kê nhãn AI (hoặc fallback tiêu đề).
 */
export function formatIncidentAvoidanceBanner(hits: DangerZone[]): string {
  const parts: string[] = [];
  const seen = new Set<string>();
  for (const z of hits) {
    if (z.aiLabels && z.aiLabels.length > 0) {
      for (const L of z.aiLabels) {
        const t = L.trim();
        const key = t.toLowerCase();
        if (t && !seen.has(key)) {
          seen.add(key);
          parts.push(t);
        }
      }
    } else if (z.label) {
      const t = z.label.trim();
      const key = t.toLowerCase();
      if (t && !seen.has(key)) {
        seen.add(key);
        parts.push(t);
      }
    }
  }
  const list =
    parts.length > 0 ? parts.join(", ") : "sự cố giao thông";
  return `Đã phát hiện sự cố [${list}] trên lộ trình, đang điều hướng tránh né`;
}

/** Vùng có tâm đủ gần polyline (không xử lý cả map). */
export function getNearbyDangers(
  zones: DangerZone[],
  polyline: LatLngLiteral[],
  roiMeters: number = DANGER_NEAR_ROUTE_ROI_METERS,
): DangerZone[] {
  if (polyline.length < 2) return [];
  return zones.filter((z) => {
    const d = minDistancePointToPolylineM(zoneCenter(z), polyline);
    return d <= roiMeters;
  });
}

export function segmentIndexClosestToPoint(
  center: LatLngLiteral,
  polyline: LatLngLiteral[],
): number {
  if (polyline.length < 2) return 0;
  let bestI = 0;
  let bestD = Infinity;
  for (let i = 0; i < polyline.length - 1; i++) {
    const c = closestPointOnSegment(center, polyline[i], polyline[i + 1]);
    const d = haversineM(center, c);
    if (d < bestD) {
      bestD = d;
      bestI = i;
    }
  }
  return bestI;
}

export function routeIntersectsDangerZone(
  polyline: LatLngLiteral[],
  zone: DangerZone,
): boolean {
  if (polyline.length < 2) return false;
  const d = minDistancePointToPolylineM(zoneCenter(zone), polyline);
  const hitR = zone.hitRadiusMeters;
  return d <= hitR;
}

export function dangerZonesHitByRoute(
  polyline: LatLngLiteral[],
  zones: DangerZone[],
): DangerZone[] {
  const hit = zones.filter((z) => routeIntersectsDangerZone(polyline, z));
  hit.sort((a, b) => {
    const ia = segmentIndexClosestToPoint(zoneCenter(a), polyline);
    const ib = segmentIndexClosestToPoint(zoneCenter(b), polyline);
    return ia - ib;
  });
  return hit;
}

/**
 * Hai điểm lệch vuông góc **sau khi neo dọc hướng đi** (không đặt via tại tâm sự cố
 * và không lệch ngay tại điểm polyline gần tâm nhất — giảm snap OSRM về đúng cung bị cấm).
 */
export function generateDetourPoints(
  zone: DangerZone,
  polyline: LatLngLiteral[],
  detourMeters: number,
): { a: LatLngLiteral; b: LatLngLiteral } {
  const zc = zoneCenter(zone);
  const { closest: bestC, segmentIndex: bestI } = getClosestPointOnPolyline(
    zc,
    polyline,
  );
  const p0 = polyline[bestI]!;
  const p1 = polyline[bestI + 1]!;
  const brgAlong = bearingDeg(p0, p1);
  const segLen = haversineM(p0, p1);
  const forward = Math.min(
    DETOUR_ANCHOR_FORWARD_M,
    Math.max(25, segLen * 0.35),
  );
  const anchor = destinationFromDegrees(
    bestC.lat,
    bestC.lng,
    brgAlong,
    forward,
  );
  return {
    a: destinationFromDegrees(anchor.lat, anchor.lng, brgAlong + 90, detourMeters),
    b: destinationFromDegrees(anchor.lat, anchor.lng, brgAlong - 90, detourMeters),
  };
}

/**
 * Chọn một trong hai điểm lệch.
 * `preferFartherFromHazard`: true → phía xa tâm vùng hơn (đẩy ra khỏi đĩa).
 */
export function pickDetourWaypoint(
  pair: { a: LatLngLiteral; b: LatLngLiteral },
  zoneCenterPoint: LatLngLiteral,
  preferFartherFromHazard: boolean,
): LatLngLiteral {
  const da = haversineM(zoneCenterPoint, pair.a);
  const db = haversineM(zoneCenterPoint, pair.b);
  const aIsFarther = da >= db;
  if (preferFartherFromHazard) {
    return aIsFarther ? pair.a : pair.b;
  }
  return aIsFarther ? pair.b : pair.a;
}

/**
 * Gộp sinh cặp điểm lệch + chọn một waypoint OSRM cần chèn khi tuyến va chạm đệm sự cố.
 */
export function computeDetourWaypoint(
  zone: DangerZone,
  polyline: LatLngLiteral[],
  detourMeters: number,
  preferFartherFromHazard: boolean,
): LatLngLiteral {
  const pair = generateDetourPoints(zone, polyline, detourMeters);
  return pickDetourWaypoint(pair, zoneCenter(zone), preferFartherFromHazard);
}

/**
 * Mức lệch (m) theo chỉ số lần chèn 0..MAX-1.
 */
export function detourMetersForInjectionIndex(injectionIndex: number): number {
  const pairIndex = Math.min(
    Math.floor(injectionIndex / 2),
    DETOUR_STRATEGY_METERS.length - 1,
  );
  return DETOUR_STRATEGY_METERS[pairIndex]!;
}

/**
 * `true` nếu lần chèn này ưu tiên phía xa tâm vùng (luân phiên với phía còn lại).
 */
export function preferFartherSideForInjection(injectionIndex: number): boolean {
  return injectionIndex % 2 === 0;
}

/** Bước kế tiếp: chèn waypoint né hoặc đã hết chiến lược (fallback). */
export function buildRouteWithFallback(
  injectionIndex: number,
): { mode: "inject"; detourMeters: number; preferFarther: boolean } | { mode: "exhausted" } {
  if (injectionIndex >= MAX_DETOUR_INJECTIONS) {
    return { mode: "exhausted" };
  }
  return {
    mode: "inject",
    detourMeters: detourMetersForInjectionIndex(injectionIndex),
    preferFarther: preferFartherSideForInjection(injectionIndex),
  };
}

/*
 * --- Nâng cao (không dùng OSRM public thuần) ---
 * Để “tránh thông minh” hơn waypoint: router hỗ trợ **trọng số cạnh** hoặc **tránh vùng**:
 * - GraphHopper (bản hosted / tự host) — custom model / avoid areas
 * - Valhalla — costing options, exclude polygons
 * - OSRM tự build — segment speed / exclude edges theo polygon
 * Chi phí: hosting hoặc build graph; phù hợp khi yêu cầu né ổn định tuyệt đối.
 */
