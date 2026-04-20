/** Điểm WGS84 — dùng cho khoảng cách / né tránh (không phụ thuộc Leaflet trong unit test). */
export type LatLngLiteral = { lat: number; lng: number };

const EARTH_R_M = 6371000;

function toRad(d: number) {
  return (d * Math.PI) / 180;
}

export function haversineM(a: LatLngLiteral, b: LatLngLiteral): number {
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lng - a.lng);
  const la1 = toRad(a.lat);
  const la2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(la1) * Math.cos(la2) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_R_M * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Điểm gần nhất trên đoạn AB tới P (theo tọa độ địa lý, xấp xỉ đủ cho đoạn ngắn). */
export function closestPointOnSegment(
  p: LatLngLiteral,
  a: LatLngLiteral,
  b: LatLngLiteral,
): LatLngLiteral {
  const ax = a.lng;
  const ay = a.lat;
  const bx = b.lng;
  const by = b.lat;
  const px = p.lng;
  const py = p.lat;
  const abx = bx - ax;
  const aby = by - ay;
  const ab2 = abx * abx + aby * aby;
  if (ab2 < 1e-18) return { lat: a.lat, lng: a.lng };
  let t = ((px - ax) * abx + (py - ay) * aby) / ab2;
  t = Math.max(0, Math.min(1, t));
  return { lat: ay + t * aby, lng: ax + t * abx };
}

export function minDistancePointToPolylineM(
  p: LatLngLiteral,
  poly: LatLngLiteral[],
): number {
  if (poly.length < 2) {
    return poly.length === 1 ? haversineM(p, poly[0]) : Infinity;
  }
  let min = Infinity;
  for (let i = 0; i < poly.length - 1; i++) {
    const c = closestPointOnSegment(p, poly[i], poly[i + 1]);
    const d = haversineM(p, c);
    if (d < min) min = d;
  }
  return min;
}

/** Ngưỡng mặc định (m): marker “gần tuyến” khi khoảng cách ≤ giá trị này. */
export const DEFAULT_NEAR_ROUTE_THRESHOLD_M = 30;

/**
 * Khoảng cách ngắn nhất từ một điểm tới polyline (mét).
 * Xấp xỉ đủ dùng cho map đô thị: Haversine + chiếu vuông góc lên từng đoạn thẳng.
 */
export function distancePointToPolylineMeters(
  point: LatLngLiteral,
  polyline: LatLngLiteral[],
): number {
  return minDistancePointToPolylineM(point, polyline);
}

/**
 * `true` nếu marker cách tuyến (polyline) không quá `maxDistanceMeters`.
 * Polyline cần ≥ 2 điểm; thiếu / null → không coi là gần route.
 */
export function isMarkerNearRoute(
  marker: LatLngLiteral,
  routePolyline: LatLngLiteral[] | null | undefined,
  maxDistanceMeters: number = DEFAULT_NEAR_ROUTE_THRESHOLD_M,
): boolean {
  if (!routePolyline || routePolyline.length < 2) return false;
  return (
    distancePointToPolylineMeters(marker, routePolyline) <= maxDistanceMeters
  );
}

export function bearingDeg(a: LatLngLiteral, b: LatLngLiteral): number {
  const y = Math.sin(toRad(b.lng - a.lng)) * Math.cos(toRad(b.lat));
  const x =
    Math.cos(toRad(a.lat)) * Math.sin(toRad(b.lat)) -
    Math.sin(toRad(a.lat)) *
      Math.cos(toRad(b.lat)) *
      Math.cos(toRad(b.lng - a.lng));
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

/** Điểm đích cách (lat,lng) một khoảng `distM` theo azimuth `bearingDeg` (0 = Bắc). */
export function destinationFromDegrees(
  lat: number,
  lng: number,
  bearing: number,
  distM: number,
): LatLngLiteral {
  const brng = toRad(bearing);
  const lat1 = toRad(lat);
  const lon1 = toRad(lng);
  const angDist = distM / EARTH_R_M;
  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(angDist) +
      Math.cos(lat1) * Math.sin(angDist) * Math.cos(brng),
  );
  const lon2 =
    lon1 +
    Math.atan2(
      Math.sin(brng) * Math.sin(angDist) * Math.cos(lat1),
      Math.cos(angDist) - Math.sin(lat1) * Math.sin(lat2),
    );
  return { lat: (lat2 * 180) / Math.PI, lng: (lon2 * 180) / Math.PI };
}

export type IncidentPoint = { latitude: number; longitude: number };

/**
 * Waypoint né tránh: từ điểm gần nhất trên polyline, bước sang một phía vuông góc tuyến (±90° theo lần thử).
 * @deprecated Dùng {@link computeDetourAvoidingZone} để ưu tiên phía xa tâm vùng nguy hiểm.
 */
export function computeDetourWaypoint(
  incident: IncidentPoint,
  poly: LatLngLiteral[],
  attemptIndex: number,
  detourDistanceM: number,
): LatLngLiteral {
  return computeDetourAvoidingZone(
    { lat: incident.latitude, lng: incident.longitude },
    poly,
    detourDistanceM,
    attemptIndex,
  );
}

/**
 * Điểm trên polyline gần `point` nhất (chiếu vuông góc từng đoạn).
 */
export function getClosestPointOnPolyline(
  point: LatLngLiteral,
  poly: LatLngLiteral[],
): { closest: LatLngLiteral; segmentIndex: number } {
  let bestC = poly[0];
  let bestD = Infinity;
  let bestI = 0;
  for (let i = 0; i < poly.length - 1; i++) {
    const c = closestPointOnSegment(point, poly[i], poly[i + 1]);
    const d = haversineM(point, c);
    if (d < bestD) {
      bestD = d;
      bestC = c;
      bestI = i;
    }
  }
  return { closest: bestC, segmentIndex: bestI };
}

/**
 * Điểm né vùng nguy hiểm: từ điểm trên tuyến gần tâm vùng nhất, bước vuông góc `detourMeters`.
 * - Lần lẻ (1,3,5…): chọn **phía xa tâm vùng hơn** (đẩy ra khỏi đĩa nguy hiểm).
 * - Lần chẵn (2,4,6…): chọn **phía đối diện** (OSRM vẫn ôm đường cũ → thử phía kia + detour đã tăng ở caller).
 */
export function computeDetourAvoidingZone(
  zoneCenter: LatLngLiteral,
  poly: LatLngLiteral[],
  detourMeters: number,
  attemptIndex: number,
): LatLngLiteral {
  const { closest: bestC, segmentIndex: bestI } = getClosestPointOnPolyline(
    zoneCenter,
    poly,
  );
  const a = poly[bestI];
  const b = poly[bestI + 1];
  const brg = bearingDeg(a, b);
  const left = destinationFromDegrees(
    bestC.lat,
    bestC.lng,
    brg + 90,
    detourMeters,
  );
  const right = destinationFromDegrees(
    bestC.lat,
    bestC.lng,
    brg - 90,
    detourMeters,
  );
  const dl = haversineM(zoneCenter, left);
  const dr = haversineM(zoneCenter, right);
  const leftIsFarther = dl >= dr;
  const useFartherFromZone = attemptIndex % 2 === 1;
  if (useFartherFromZone) {
    return leftIsFarther ? left : right;
  }
  return leftIsFarther ? right : left;
}

/** Các điểm (báo cáo) có tọa độ nằm trong buffer quanh polyline. */
export function incidentsOnRoute<T extends IncidentPoint>(
  incidents: T[],
  poly: LatLngLiteral[],
  bufferM: number,
): T[] {
  return incidents.filter((inc) => {
    const p: LatLngLiteral = { lat: inc.latitude, lng: inc.longitude };
    return minDistancePointToPolylineM(p, poly) <= bufferM;
  });
}
