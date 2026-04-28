import {
  buildDangerMarkerHtml,
  MARKER_LEAFLET_BOX_H,
  MARKER_LEAFLET_BOX_W,
} from "@/lib/dangerMarkerTheme";
import type { ActiveReport } from "@/lib/mapActiveReports";
import {
  DEFAULT_NEAR_ROUTE_THRESHOLD_M,
  isMarkerNearRoute,
  type LatLngLiteral,
} from "@/lib/routingAvoidance";
import L from "leaflet";
import { memo, useMemo } from "react";
import { Marker, Popup } from "react-leaflet";

import { ReportDangerPopup } from "./ReportDangerPopup";

export type DangerMarkerProps = {
  report: ActiveReport;
  /**
   * Danh sách điểm polyline tuyến đường (thứ tự đúng chiều đi).
   * Có ≥ 2 điểm → tự tính khoảng cách marker–tuyến; nếu ≤ `nearRouteMaxMeters` thì phóng icon + pulse.
   */
  routePolyline?: LatLngLiteral[] | null;
  /**
   * Ngưỡng mét để coi là “gần route” (mặc định 30).
   */
  nearRouteMaxMeters?: number;
  /**
   * Ép bật/tắt highlight (bỏ qua `routePolyline`). Hữu ích cho test hoặc logic ngoài.
   * `undefined` → chỉ dựa vào `routePolyline`.
   */
  nearRoute?: boolean;
  /** Marker mới sau realtime — bounce scale một nhịp. */
  playEntrance?: boolean;
};

function DangerMarkerInner({
  report,
  routePolyline,
  nearRouteMaxMeters = DEFAULT_NEAR_ROUTE_THRESHOLD_M,
  nearRoute: nearRouteOverride,
  playEntrance = false,
}: DangerMarkerProps) {
  const lat = report.latitude;
  const lng = report.longitude;

  const highlightNearRoute = useMemo(() => {
    if (nearRouteOverride !== undefined) {
      return nearRouteOverride;
    }
    const trustOk = Number.isFinite(report.trustScore) && report.trustScore > 0;
    if (!trustOk) {
      return false;
    }
    return isMarkerNearRoute({ lat, lng }, routePolyline, nearRouteMaxMeters);
  }, [
    nearRouteOverride,
    report.trustScore,
    lat,
    lng,
    routePolyline,
    nearRouteMaxMeters,
  ]);

  const icon = useMemo(() => {
    const html = buildDangerMarkerHtml({
      trustScore: report.trustScore,
      nearRoute: highlightNearRoute,
      playEntrance,
    });
    const divClass =
      "danger-marker-div-icon" +
      (highlightNearRoute ? " danger-marker-div-icon--near-route" : "");
    const ax = Math.round(MARKER_LEAFLET_BOX_W / 2);
    const ay = MARKER_LEAFLET_BOX_H - 4;
    return L.divIcon({
      className: divClass,
      html,
      iconSize: [MARKER_LEAFLET_BOX_W, MARKER_LEAFLET_BOX_H],
      iconAnchor: [ax, ay],
      popupAnchor: [0, -ay + 8],
    });
  }, [report.trustScore, highlightNearRoute, playEntrance]);

  return (
    <Marker
      position={[lat, lng]}
      icon={icon}
      zIndexOffset={highlightNearRoute ? 800 : playEntrance ? 700 : 400}
    >
      <Popup maxWidth={340} className="danger-marker-popup urbanguard-popup">
        <ReportDangerPopup report={report} />
      </Popup>
    </Marker>
  );
}

/**
 * Marker sự cố: pin SVG + halo pulse (CSS); memo để giảm re-render khi map cha cập nhật.
 */
export const DangerMarker = memo(DangerMarkerInner);
