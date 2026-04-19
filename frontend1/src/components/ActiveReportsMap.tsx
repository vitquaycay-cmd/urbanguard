import IncidentRouteControl from "@/components/IncidentRouteControl";
import { DangerMarkersGroup } from "@/components/map/DangerMarkersGroup";
import { DangerZoneCircle } from "@/components/map/DangerZoneCircle";
import { dangerZoneRadiusMeters } from "@/lib/dangerMarkerTheme";
import {
  fetchActiveReports,
  MAP_API_BASE,
  type ActiveReport,
} from "@/lib/mapActiveReports";
import type { LatLngLiteral } from "@/lib/routingAvoidance";
import { getValidatedReportsForRouting } from "@/services/routingService";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import { Link } from "react-router-dom";
import { io, type Socket } from "socket.io-client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, useMap, ZoomControl } from "react-leaflet";
import "../styles/map.css";

export type { ActiveReport };

const CLUSTER_AUTO_THRESHOLD = 12;
const DEFAULT_CENTER: L.LatLngExpression = [12.684696, 108.050915];
const DEFAULT_ZOOM = 10;

function useDebouncedValue<T>(value: T, ms: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(value), ms);
    return () => window.clearTimeout(t);
  }, [value, ms]);

  return debounced;
}

function FitBounds({ reports }: { reports: ActiveReport[] }) {
  const map = useMap();

  useEffect(() => {
    if (reports.length === 0) {
      map.setView(DEFAULT_CENTER, DEFAULT_ZOOM);
      return;
    }

    const bounds = L.latLngBounds(
      reports.map((r) => [r.latitude, r.longitude] as L.LatLngTuple),
    );

    map.fitBounds(bounds, { padding: [100, 56], maxZoom: 16 });
  }, [map, reports]);

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
          <div className="ug-search-brand">UrbanGuard</div>
          <div className="ug-search-sub">Tìm địa điểm (sắp có)</div>
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

  return (
    <div className={`ug-banner ug-banner--${type}`}>
      {text}
    </div>
  );
}

type ActiveReportsMapProps = {
  enableMarkerClustering?: boolean;
};

export default function ActiveReportsMap({
  enableMarkerClustering,
}: ActiveReportsMapProps = {}) {
  const [reports, setReports] = useState<ActiveReport[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [routeWarning, setRouteWarning] = useState("");
  const [routeCoords, setRouteCoords] = useState<LatLngLiteral[] | null>(null);
  const [entranceReportIds, setEntranceReportIds] = useState<Set<number>>(
    () => new Set(),
  );

  const skipInitialEntranceRef = useRef(true);
  const prevValidatedIdsRef = useRef<Set<number>>(new Set());

  const handleAvoidanceMessage = useCallback((msg: string) => {
    setRouteWarning(msg);
  }, []);

  const handleRouteGeometryChange = useCallback(
    (coords: LatLngLiteral[] | null) => {
      setRouteCoords(coords);
    },
    [],
  );

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

  useEffect(() => {
    const ac = new AbortController();
    setLoading(true);
    void loadReports(ac.signal);
    return () => ac.abort();
  }, [loadReports]);

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
      }
    };

    const onConnectError = (err: Error) => {
      console.warn("[UrbanGuard realtime] connect_error:", err.message);
    };

    socket.on("report:new", onReportNew);
    socket.on("connect_error", onConnectError);

    return () => {
      socket.off("report:new", onReportNew);
      socket.off("connect_error", onConnectError);
      socket.disconnect();
    };
  }, [loadReports]);

  const validatedReports = useMemo(
    () =>
      reports.filter(
        (r) =>
          String(r.status).toUpperCase() === "VALIDATED" &&
          Number(r.trustScore) > 0,
      ),
    [reports],
  );

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

      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        className="ug-leaflet-map"
        zoomControl={false}
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <ZoomControl position="bottomleft" />
        <FitBounds reports={validatedReports} />

        <IncidentRouteControl
          incidents={reportsForRouting}
          onAvoidanceMessage={handleAvoidanceMessage}
          onRouteGeometryChange={handleRouteGeometryChange}
        />

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
      </MapContainer>

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
          {routeCoords
            ? "Tuyến đang hiển thị — kéo waypoint để đổi lộ trình. Vào đệm khoảng 115m quanh sự cố sẽ có cảnh báo và thử né tự động."
            : "Chọn điểm đi / đến trên bản đồ để xem tuyến OSRM."}

          {clustering && (
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