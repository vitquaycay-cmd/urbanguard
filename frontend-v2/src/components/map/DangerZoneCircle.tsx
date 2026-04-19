import type { PathOptions } from "leaflet";
import { Circle } from "react-leaflet";

/**
 * Tọa độ tâm vòng — tuple `[lat, lng]` (chuẩn Leaflet) hoặc object.
 */
export type DangerZonePosition =
  | { lat: number; lng: number }
  | readonly [number, number];

/** Bán kính mặc định (mét), nằm trong khoảng khuyến nghị 50–80. */
export const DEFAULT_DANGER_ZONE_RADIUS_M = 65;

/** Viền + fill đỏ, độ đục fill 0.3 theo spec. */
const DEFAULT_PATH_OPTIONS: PathOptions = {
  color: "red",
  fillColor: "red",
  fillOpacity: 0.3,
  weight: 2,
  opacity: 0.85,
};

function isLatLngObject(
  p: DangerZonePosition,
): p is { lat: number; lng: number } {
  // Tuple `readonly [number, number]` cũng là array — ưu tiên nhánh object rõ ràng.
  return typeof p === "object" && p !== null && !Array.isArray(p) && "lat" in p;
}

function toCenterTuple(p: DangerZonePosition): [number, number] {
  if (isLatLngObject(p)) {
    return [p.lat, p.lng];
  }
  return [p[0], p[1]];
}

export type DangerZoneCircleProps = {
  /** Tâm vùng nguy hiểm (WGS84). */
  position: DangerZonePosition;
  /**
   * Bán kính mét (50–80 khuyến nghị).
   * Bỏ qua → dùng {@link DEFAULT_DANGER_ZONE_RADIUS_M}.
   */
  radius?: number;
  /**
   * Ghi đè một phần style Leaflet (merge lên mặc định đỏ).
   * Ví dụ: `pathOptions={{ fillOpacity: 0.2 }}`
   */
  pathOptions?: Partial<PathOptions>;
};

/**
 * Vòng tròn cảnh báo quanh một điểm (react-leaflet `<Circle />`, đơn vị bán kính: mét).
 */
export function DangerZoneCircle({
  position,
  radius = DEFAULT_DANGER_ZONE_RADIUS_M,
  pathOptions,
}: DangerZoneCircleProps) {
  const center = toCenterTuple(position);
  const merged: PathOptions = { ...DEFAULT_PATH_OPTIONS, ...pathOptions };

  return (
    <Circle center={center} radius={radius} pathOptions={merged} />
  );
}
