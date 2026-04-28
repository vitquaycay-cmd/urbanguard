import IncidentRouteControl from "@/components/IncidentRouteControl";
import { DangerMarkersGroup } from "@/components/map/DangerMarkersGroup";
import { DangerZoneCircle } from "@/components/map/DangerZoneCircle";
import { dangerZoneRadiusMeters } from "@/lib/dangerMarkerTheme";
import {
  fetchActiveReports,
  MAP_API_BASE,
} from "@/lib/mapActiveReports";
import type { ActiveReport } from "@/lib/mapActiveReports"; // 🔗 KẾT NỐI: Sử dụng import type
import type { LatLngLiteral } from "@/lib/routingAvoidance";
import { getValidatedReportsForRouting } from "@/services/routingService";
import { getHeatmapData } from "@/services/statistics.api"; // 🔗 KẾT NỐI: API Heatmap
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import { Link } from "react-router-dom";
import { io, type Socket } from "socket.io-client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, useMap, ZoomControl, CircleMarker } from "react-leaflet";

// 🔗 KẾT NỐI: Workaround cho lỗi type React 19 & React-Leaflet v5
const MapContainerComp = MapContainer as any;
const TileLayerComp = TileLayer as any;
const CircleMarkerComp = CircleMarker as any;

export type { ActiveReport };

const CLUSTER_AUTO_THRESHOLD = 12;
const DEFAULT_CENTER: L.LatLngExpression = [10.762622, 106.660172];
const DEFAULT_ZOOM = 12;

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

function MapFlyTo({
  target,
}: {
  target: { lat: number; lng: number; zoom: number } | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (target) {
      map.flyTo([target.lat, target.lng], target.zoom, { duration: 1.2 });
    }
  }, [map, target]);

  return null;
}

type SearchResult = {
  type: "place" | "report";
  label: string;
  sublabel?: string;
  lat: number;
  lng: number;
  reportId?: number;
};

async function geocodeNominatim(
  query: string,
  signal?: AbortSignal,
): Promise<SearchResult[]> {
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(query)}`;
  const res = await fetch(url, {
    signal,
    headers: { "Accept-Language": "vi" },
  });
  if (!res.ok) return [];
  const data = (await res.json()) as Array<{
    display_name: string;
    lat: string;
    lon: string;
  }>;
  return data.map((item) => ({
    type: "place" as const,
    label: item.display_name.split(",")[0],
    sublabel: item.display_name.split(",").slice(1, 3).join(",").trim(),
    lat: parseFloat(item.lat),
    lng: parseFloat(item.lon),
  }));
}

function searchReports(
  query: string,
  reports: ActiveReport[],
): SearchResult[] {
  const q = query.toLowerCase();
  return reports
    .filter((r) => {
      const text = `${r.title} ${r.description}`.toLowerCase();
      const labels = Array.isArray(r.aiLabels)
        ? r.aiLabels.join(" ").toLowerCase()
        : "";
      return text.includes(q) || labels.includes(q);
    })
    .slice(0, 5)
    .map((r) => ({
      type: "report" as const,
      label: r.title || "Sự cố #" + r.id,
      sublabel: r.description?.slice(0, 60),
      lat: r.latitude,
      lng: r.longitude,
      reportId: r.id,
    }));
}

function SearchOverlay({
  reports,
  onSelect,
}: {
  reports: ActiveReport[];
  onSelect: (lat: number, lng: number, zoom?: number) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }

    const localResults = searchReports(q, reports);

    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;
    setLoading(true);

    geocodeNominatim(q, ac.signal)
      .then((places) => {
        if (!ac.signal.aborted) {
          setResults([...localResults, ...places]);
          setOpen(true);
        }
      })
      .catch(() => {
        if (!ac.signal.aborted) {
          setResults(localResults);
          setOpen(localResults.length > 0);
        }
      })
      .finally(() => {
        if (!ac.signal.aborted) setLoading(false);
      });

    return () => ac.abort();
  }, [query, reports]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (r: SearchResult) => {
    setQuery(r.label);
    setOpen(false);
    onSelect(r.lat, r.lng, r.type === "report" ? 16 : 14);
  };

  const reportResults = results.filter((r) => r.type === "report");
  const placeResults = results.filter((r) => r.type === "place");
  const hasResults = results.length > 0;
  const showEmpty = open && !loading && query.trim().length >= 2 && !hasResults;

  return (
    <div className="ug-search-overlay" ref={wrapperRef}>
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

        <input
          className="ug-search-input"
          type="text"
          placeholder="Tìm địa điểm hoặc sự cố..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
        />

        {query && (
          <button
            className="ug-search-clear"
            onClick={() => {
              setQuery("");
              setResults([]);
              setOpen(false);
            }}
            aria-label="Xóa"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} width={12} height={12}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {open && hasResults && (
        <ul className="ug-search-results">
          {reportResults.length > 0 && (
            <>
              <li className="ug-search-section-label">Sự cố</li>
              {reportResults.map((r) => (
                <li key={`report-${r.reportId}`}>
                  <button
                    className="ug-search-result-btn"
                    onClick={() => handleSelect(r)}
                  >
                    <span className="ug-search-result-icon ug-search-result-icon--report">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </span>
                    <span className="ug-search-result-text">
                      <span className="ug-search-result-label">{r.label}</span>
                      {r.sublabel && (
                        <span className="ug-search-result-sub">{r.sublabel}</span>
                      )}
                    </span>
                    <span className="ug-search-result-badge ug-search-result-badge--report">
                      Sự cố
                    </span>
                  </button>
                </li>
              ))}
            </>
          )}

          {reportResults.length > 0 && placeResults.length > 0 && (
            <li className="ug-search-divider" aria-hidden />
          )}

          {placeResults.length > 0 && (
            <>
              <li className="ug-search-section-label">Địa điểm</li>
              {placeResults.map((r, i) => (
                <li key={`place-${i}`}>
                  <button
                    className="ug-search-result-btn"
                    onClick={() => handleSelect(r)}
                  >
                    <span className="ug-search-result-icon ug-search-result-icon--place">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </span>
                    <span className="ug-search-result-text">
                      <span className="ug-search-result-label">{r.label}</span>
                      {r.sublabel && (
                        <span className="ug-search-result-sub">{r.sublabel}</span>
                      )}
                    </span>
                    <span className="ug-search-result-badge ug-search-result-badge--place">
                      Địa điểm
                    </span>
                  </button>
                </li>
              ))}
            </>
          )}
        </ul>
      )}

      {open && loading && (
        <div className="ug-search-loading">
          <span className="ug-search-loading-dot" />
          <span className="ug-search-loading-dot" />
          <span className="ug-search-loading-dot" />
        </div>
      )}

      {showEmpty && (
        <div className="ug-search-results">
          <div className="ug-search-empty">
            Không tìm thấy kết quả cho "{query}"
          </div>
        </div>
      )}
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
};

export default function ActiveReportsMap({
  enableMarkerClustering,
}: ActiveReportsMapProps = {}) {
  const [reports, setReports] = useState<ActiveReport[]>([]);
  const [heatmapPoints, setHeatmapPoints] = useState<[number, number, number][]>([]); // 🔗 KẾT NỐI: Data heatmap
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [routeWarning, setRouteWarning] = useState("");
  const [routeCoords, setRouteCoords] = useState<LatLngLiteral[] | null>(null);
  const [flyTarget, setFlyTarget] = useState<{
    lat: number;
    lng: number;
    zoom: number;
  } | null>(null);
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

  // 🔗 KẾT NỐI: Tải dữ liệu heatmap từ Backend 
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
        void loadHeatmap(); // Làm mới khi có sự cố mới
      }
    };

    // 🔗 KẾT NỐI: Lắng nghe sự kiện report:update (RESOLVED/REJECTED) từ Backend
    const onReportUpdate = () => {
      void loadReports();
      void loadHeatmap();
    };

    const onConnectError = (err: Error) => {
      console.warn("[UrbanGuard realtime] connect_error:", err.message);
    };

    socket.on("report:new", onReportNew);
    socket.on("report:update", onReportUpdate); // 🔗 KẾT NỐI: Xử lý cập nhật real-time
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

      {/* 🔗 KẾT NỐI: Nút chuyển đổi chế độ Bản đồ nhiệt */}
      <div className="ug-map-controls-overlay">
        <button 
          className={`ug-btn-toggle ${showHeatmap ? 'ug-btn-toggle--active' : ''}`}
          onClick={() => setShowHeatmap(!showHeatmap)}
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
        <FitBounds reports={validatedReports} />
        <MapFlyTo target={flyTarget} />

        <IncidentRouteControl
          incidents={reportsForRouting}
          onAvoidanceMessage={handleAvoidanceMessage}
          onRouteGeometryChange={handleRouteGeometryChange}
        />

        {/* 🔗 KẾT NỐI: Rendering Heatmap Layer */}
        {showHeatmap && heatmapPoints.map((p, idx) => (
          <CircleMarkerComp
            key={`heat-${idx}`}
            center={[p[0], p[1]]}
            radius={25 + p[2] * 15}
            pathOptions={{
              fillColor: p[2] > 0.6 ? '#ff0000' : p[2] > 0.3 ? '#ffae00' : '#ffff00',
              fillOpacity: 0.15 + p[2] * 0.3,
              stroke: false,
              interactive: false
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

      <SearchOverlay
        reports={validatedReports}
        onSelect={(lat, lng, zoom) =>
          setFlyTarget({ lat, lng, zoom: zoom ?? 14 })
        }
      />

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
            ? "Tuyến đang hiển thị — kéo waypoint để đổi lộ trình. Vào đệm quanh sự cố sẽ có cảnh báo và thử né tự động."
            : "Chọn điểm đi / đến trên bản đồ để xem tuyến OSRM."}

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
