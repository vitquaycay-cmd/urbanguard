import type { ActiveReport } from "@/lib/mapActiveReports";
import type { LatLngLiteral } from "@/lib/routingAvoidance";
import MarkerClusterGroup from "react-leaflet-cluster";
import { DangerMarker } from "./DangerMarker";

type Props = {
  reports: ActiveReport[];
  /** Polyline tuyến OSRM — mỗi `DangerMarker` tự tính khoảng cách & pulse khi gần. */
  routePolyline: LatLngLiteral[] | null | undefined;
  /** Bật gom cụm (leaflet.markercluster) */
  clustering: boolean;
  /** Id báo cáo xuất hiện sau lần tải đầu — animation entrance một lần. */
  entranceReportIds?: ReadonlySet<number>;
};

/**
 * Lớp marker sự cố: có thể bọc MarkerClusterGroup khi clustering=true.
 * Circle danger zone render riêng (ngoài group) vì cluster chỉ hợp với Marker.
 */
export function DangerMarkersGroup({
  reports,
  routePolyline,
  clustering,
  entranceReportIds,
}: Props) {
  const markers = reports.map((r) => (
    <DangerMarker
      key={r.id}
      report={r}
      routePolyline={routePolyline}
      playEntrance={entranceReportIds?.has(r.id) ?? false}
    />
  ));

  if (!clustering) {
    return <>{markers}</>;
  }

  return (
    <MarkerClusterGroup
      chunkedLoading
      spiderfyOnMaxZoom
      showCoverageOnHover={false}
      maxClusterRadius={56}
      disableClusteringAtZoom={17}
    >
      {markers}
    </MarkerClusterGroup>
  );
}
