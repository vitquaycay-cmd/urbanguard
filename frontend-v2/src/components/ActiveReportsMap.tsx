import IncidentRouteControl from "@/components/IncidentRouteControl";
import { DangerMarkersGroup } from "@/components/map/DangerMarkersGroup";
import { DangerZoneCircle } from "@/components/map/DangerZoneCircle";
import { dangerZoneRadiusMeters } from "@/lib/dangerMarkerTheme";
import { fetchActiveReports, MAP_API_BASE } from "@/lib/mapActiveReports";
import type { ActiveReport } from "@/lib/mapActiveReports";
import type { LatLngLiteral } from "@/lib/routingAvoidance";
import { getValidatedReportsForRouting } from "@/services/routingService";
import { getHeatmapData } from "@/services/statistics.api";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CircleMarker,
  MapContainer,
  Marker,
  Polyline,
  TileLayer,
  Tooltip,
  useMap,
  useMapEvents,
  ZoomControl,
} from "react-leaflet";
import { Link } from "react-router-dom";
import { io, type Socket } from "socket.io-client";

const MapContainerComp = MapContainer as any;
const TileLayerComp = TileLayer as any;
const CircleMarkerComp = CircleMarker as any;
const PolylineComp = Polyline as any;
const MarkerComp = Marker as any;
const TooltipComp = Tooltip as any;

export type { ActiveReport };

const CLUSTER_AUTO_THRESHOLD = 12;
const DEFAULT_CENTER: L.LatLngExpression = [10.762622, 106.660172];
const DEFAULT_ZOOM = 13;

type LatLngTuple = [number, number];

const currentLocationIcon = L.divIcon({
  className: "ug-current-location-marker",
  html: `
    <div style="
      width:18px;
      height:18px;
      border-radius:999px;
      background:#2563eb;
      border:3px solid white;
      box-shadow:0 0 0 8px rgba(37,99,235,.2);
    "></div>
  `,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

function isValidLatLng(lat: number, lng: number) {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}

function useDebouncedValue<T>(value: T, ms: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(value), ms);
    return () => window.clearTimeout(t);
  }, [value, ms]);

  return debounced;
}

function FitBounds({
  reports,
  currentLocation,
}: {
  reports: ActiveReport[];
  currentLocation: LatLngTuple | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (currentLocation) {
      map.setView(currentLocation, 15);
      return;
    }

    const validPoints = reports
      .filter((r) => isValidLatLng(r.latitude, r.longitude))
      .map((r) => [r.latitude, r.longitude] as L.LatLngTuple);

    if (validPoints.length > 0) {
      const bounds = L.latLngBounds(validPoints);
      map.fitBounds(bounds, { padding: [100, 56], maxZoom: 16 });
      return;
    }

    map.setView(DEFAULT_CENTER, DEFAULT_ZOOM);
  }, [map, reports, currentLocation]);

  return null;
}

function FitSafeRoute({ safeRoute }: { safeRoute: LatLngTuple[] }) {
  const map = useMap();

  useEffect(() => {
    if (safeRoute.length < 2) return;
    const bounds = L.latLngBounds(safeRoute as L.LatLngTuple[]);
    map.fitBounds(bounds, { padding: [80, 80], maxZoom: 17 });
  }, [map, safeRoute]);

  return null;
}

function PickRoutePoint({
  onPickPoint,
}: {
  onPickPoint?: (point: LatLngTuple) => void;
}) {
  useMapEvents({
    click(e) {
      onPickPoint?.([e.latlng.lat, e.latlng.lng]);
    },
  });

  return null;
}

function SearchOverlay() {
  return (
    <div className="ug-search-overlay">
      <div className="ug-search-card">
        <span className="ug-search-icon" aria-hidden>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </span>

        <div className="ug-search-copy">
          <div className="ug-search-brand">UrbanGuard Search</div>
          <div className="ug-search-sub">Tìm địa điểm, tuyến đường hoặc khu vực sự cố</div>
        </div>
      </div>
    </div>
  );
}

type MessageBannerProps = {
  text: string;
  type?: "warning" | "error";
};

function MessageBanner({ text, type = "warning" }: MessageBannerProps) {
  if (!text) return null;
  return <div className={`ug-banner ug-banner--${type}`}>{text}</div>;
}

type ActiveReportsMapProps = {
  enableMarkerClustering?: boolean;
  safeRoute?: LatLngTuple[];
  startPoint?: LatLngTuple | null;
  endPoint?: LatLngTuple | null;
  onPickPoint?: (point: LatLngTuple) => void;
  onValidatedReportsChange?: (reports: ActiveReport[]) => void;
};

export default function ActiveReportsMap({
  enableMarkerClustering,
  safeRoute = [],
  startPoint = null,
  endPoint = null,
  onPickPoint,
  onValidatedReportsChange,
}: ActiveReportsMapProps = {}) {
  const [reports, setReports] = useState<ActiveReport[]>([]);
  const [heatmapPoints, setHeatmapPoints] = useState<[number, number, number][]>([]);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [routeWarning, setRouteWarning] = useState("");
  const [routeCoords, setRouteCoords] = useState<LatLngLiteral[] | null>(null);
  const [currentLocation, setCurrentLocation] = useState<LatLngTuple | null>(null);
  const [entranceReportIds, setEntranceReportIds] = useState<Set<number>>(
    () => new Set(),
  );

  const skipInitialEntranceRef = useRef(true);
  const prevValidatedIdsRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    if (!navigator.geolocation) {
      console.warn("Trình duyệt không hỗ trợ định vị.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCurrentLocation([pos.coords.latitude, pos.coords.longitude]);
      },
      (err) => {
        console.warn("Không lấy được vị trí hiện tại:", err.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 60000,
      },
    );
  }, []);

  const handleAvoidanceMessage = useCallback((msg: string) => {
    setRouteWarning(msg);
  }, []);

  const handleRouteGeometryChange = useCallback((coords: LatLngLiteral[] | null) => {
    setRouteCoords(coords);
  }, []);

  const loadReports = useCallback(async (signal?: AbortSignal) => {
    try {
      const data = await fetchActiveReports(signal);
      setReports(data);
      setError(null);
    } catch (e) {
      if (signal?.aborted) return;
      setError(e instanceof Error ? e.message : "Không tải được báo cáo");
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  const loadHeatmap = useCallback(async () => {
    try {
      const data = await getHeatmapData();
      setHeatmapPoints(data);
    } catch (err) {
      console.warn("Không tải được dữ liệu heatmap:", err);
    }
  }, []);

  useEffect(() => {
    const ac = new AbortController();
    setLoading(true);
    void loadReports(ac.signal);
    void loadHeatmap();

    return () => ac.abort();
  }, [loadReports, loadHeatmap]);

  useEffect(() => {
    if (!MAP_API_BASE) return;

    const socket: Socket = io(`${MAP_API_BASE}/realtime`, {
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1200,
      timeout: 5000,
    });

    const onReportNew = (payload: unknown) => {
      const p =
        payload !== null && typeof payload === "object"
          ? (payload as Record<string, unknown>)
          : null;

      if (p && ("report" in p || typeof p.id === "number")) {
        void loadReports();
        void loadHeatmap();
      }
    };

    const onReportUpdate = () => {
      void loadReports();
      void loadHeatmap();
    };

    const onConnectError = (err: Error) => {
      console.warn("[UrbanGuard realtime] connect_error:", err.message);
    };

    socket.on("report:new", onReportNew);
    socket.on("report:update", onReportUpdate);
    socket.on("connect_error", onConnectError);

    return () => {
      socket.off("report:new", onReportNew);
      socket.off("report:update", onReportUpdate);
      socket.off("connect_error", onConnectError);
      socket.disconnect();
    };
  }, [loadReports, loadHeatmap]);

  const validatedReports = useMemo(
    () =>
      reports.filter(
        (r) =>
          String(r.status).toUpperCase() === "VALIDATED" &&
          isValidLatLng(r.latitude, r.longitude),
      ),
    [reports],
  );

  useEffect(() => {
    onValidatedReportsChange?.(validatedReports);
  }, [validatedReports, onValidatedReportsChange]);

  useEffect(() => {
    const next = new Set(validatedReports.map((r) => r.id));

    if (skipInitialEntranceRef.current) {
      skipInitialEntranceRef.current = false;
      prevValidatedIdsRef.current = next;
      return;
    }

    const added: number[] = [];
    for (const id of next) {
      if (!prevValidatedIdsRef.current.has(id)) added.push(id);
    }

    prevValidatedIdsRef.current = next;
    if (added.length === 0) return;

    setEntranceReportIds((prev) => new Set([...prev, ...added]));
  }, [validatedReports]);

  const reportsForRouting = useMemo(
    () => getValidatedReportsForRouting(validatedReports),
    [validatedReports],
  );

  const routeCoordsDebounced = useDebouncedValue(routeCoords, 140);

  const clustering =
    enableMarkerClustering === true
      ? validatedReports.length >= 2
      : enableMarkerClustering === false
        ? false
        : validatedReports.length > CLUSTER_AUTO_THRESHOLD;

  return (
    <div className="ug-map-shell">
      {loading && (
        <div className="ug-map-loading">
          <div className="ug-map-loading-card">Đang tải bản đồ…</div>
        </div>
      )}

      <div className="ug-map-controls-overlay">
        <button
          type="button"
          className={`ug-btn-toggle ${showHeatmap ? "ug-btn-toggle--active" : ""}`}
          onClick={() => setShowHeatmap((v) => !v)}
        >
          {showHeatmap ? "🔥 Heatmap: ON" : "📍 Markers: ON"}
        </button>
      </div>

      <MapContainerComp
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        className="ug-leaflet-map"
        zoomControl={false}
        scrollWheelZoom
      >
        <TileLayerComp
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <ZoomControl position="bottomleft" />

        {safeRoute.length > 0 ? (
          <FitSafeRoute safeRoute={safeRoute} />
        ) : (
          <FitBounds reports={validatedReports} currentLocation={currentLocation} />
        )}

        <PickRoutePoint onPickPoint={onPickPoint} />

        {currentLocation && (
          <MarkerComp position={currentLocation} icon={currentLocationIcon}>
            <TooltipComp permanent direction="top" offset={[0, -12]}>
              Vị trí của bạn
            </TooltipComp>
          </MarkerComp>
        )}

        {startPoint && (
          <MarkerComp position={startPoint}>
            <TooltipComp permanent direction="top" offset={[0, -12]}>
              A
            </TooltipComp>
          </MarkerComp>
        )}

        {endPoint && (
          <MarkerComp position={endPoint}>
            <TooltipComp permanent direction="top" offset={[0, -12]}>
              B
            </TooltipComp>
          </MarkerComp>
        )}

        <IncidentRouteControl
          incidents={reportsForRouting}
          onAvoidanceMessage={handleAvoidanceMessage}
          onRouteGeometryChange={handleRouteGeometryChange}
        />

        {safeRoute.length > 0 && (
          <PolylineComp
            positions={safeRoute}
            pathOptions={{
              color: "#16a34a",
              weight: 6,
              opacity: 0.95,
            }}
          />
        )}

        {showHeatmap &&
          heatmapPoints.map((p, idx) => (
            <CircleMarkerComp
              key={`heat-${idx}`}
              center={[p[0], p[1]]}
              radius={25 + p[2] * 15}
              pathOptions={{
                fillColor: p[2] > 0.6 ? "#ff0000" : p[2] > 0.3 ? "#ffae00" : "#ffff00",
                fillOpacity: 0.15 + p[2] * 0.3,
                stroke: false,
                interactive: false,
              }}
            />
          ))}

        {!showHeatmap && (
          <>
            {validatedReports.map((r) => (
              <DangerZoneCircle
                key={`zone-${r.id}`}
                position={{ lat: r.latitude, lng: r.longitude }}
                radius={dangerZoneRadiusMeters(r)}
              />
            ))}

            <DangerMarkersGroup
              reports={validatedReports}
              routePolyline={routeCoordsDebounced}
              clustering={clustering}
              entranceReportIds={entranceReportIds}
            />
          </>
        )}
      </MapContainerComp>

      <SearchOverlay />

      <div className="ug-banner-wrap ug-banner-wrap--top">
        <MessageBanner text={routeWarning} type="warning" />
      </div>

      <div className="ug-banner-wrap ug-banner-wrap--error">
        <MessageBanner
          text={error ? `${error}. Kiểm tra VITE_API_URL.` : ""}
          type="error"
        />
      </div>

      <div className="ug-map-footer">
        <div className="ug-map-footer-card">
          {safeRoute.length > 0
            ? "Đang hiển thị tuyến đường an toàn do AI đề xuất."
            : routeCoords
              ? "Tuyến đang hiển thị — kéo waypoint để đổi lộ trình. Vào đệm quanh sự cố sẽ có cảnh báo và thử né tự động."
              : "Click trên bản đồ để chọn điểm bắt đầu và điểm kết thúc, sau đó bấm Tìm đường an toàn."}

          {clustering && !showHeatmap && (
            <div className="ug-map-footer-sub">
              Đang gom cụm marker — zoom để xem từng sự cố.
            </div>
          )}
        </div>
      </div>

      <div className="ug-map-action">
        <Link
          to="/report"
          className="ug-report-fab"
          aria-label="Báo cáo sự cố mới"
          title="Báo cáo sự cố"
        >
          +
        </Link>
      </div>
    </div>
  );
}