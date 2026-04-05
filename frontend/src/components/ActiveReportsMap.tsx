"use client";

import { ReportImageTestAssist } from "@/components/dev/ReportImageTestAssist";
import IncidentRouteControl from "@/components/IncidentRouteControl";
import { DangerMarkersGroup } from "@/components/map/DangerMarkersGroup";
import { DangerZoneCircle } from "@/components/map/DangerZoneCircle";
import { Banner } from "@/components/ui/Banner";
import { dangerZoneRadiusMeters } from "@/lib/dangerMarkerTheme";
import {
  fetchActiveReports,
  MAP_API_BASE,
  type ActiveReport,
} from "@/lib/mapActiveReports";
import type { LatLngLiteral } from "@/lib/routingAvoidance";
import { getValidatedReportsForRouting } from "@/services/routingService";
import { motion } from "framer-motion";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import Link from "next/link";
import { io } from "socket.io-client";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { MapContainer, TileLayer, useMap, ZoomControl } from "react-leaflet";

export type { ActiveReport };

const CLUSTER_AUTO_THRESHOLD = 12;
const DEFAULT_CENTER: L.LatLngExpression = [10.762622, 106.660172];
const DEFAULT_ZOOM = 12;

/** Debounce polyline cho highlight marker — giảm re-render khi OSRM cập nhật dày. */
function useDebouncedValue<T>(value: T, ms: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(t);
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

/** Thanh tìm kiếm giả (UI production — chưa nối geocoding). */
function MapSearchOverlay() {
  return (
    <div
      className="pointer-events-auto absolute left-3 right-3 top-[max(0.75rem,env(safe-area-inset-top,0px))] z-[900] sm:left-4 sm:right-4"
      style={{ marginTop: "env(safe-area-inset-top, 0px)" }}
    >
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 380, damping: 32 }}
        className="mx-auto flex max-w-xl items-center gap-2 rounded-2xl border border-white/20 bg-white/92 px-4 py-3 shadow-lg shadow-zinc-900/10 backdrop-blur-md"
      >
        <span className="text-zinc-400" aria-hidden>
          <svg
            className="h-5 w-5 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            UrbanGuard
          </p>
          <p className="truncate text-sm text-zinc-400">
            Tìm địa điểm (sắp có)
          </p>
        </div>
      </motion.div>
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
    const socket = io(`${MAP_API_BASE}/realtime`, {
      transports: ["websocket"],
      withCredentials: true,
    });
    const onReportNew = (payload: unknown) => {
      console.log("[UrbanGuard realtime] report:new", payload);
      const p =
        payload !== null && typeof payload === "object"
          ? (payload as Record<string, unknown>)
          : null;
      if (p && ("report" in p || typeof p.id === "number")) {
        void loadReports();
      }
    };
    socket.on("report:new", onReportNew);
    return () => {
      socket.off("report:new", onReportNew);
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

  const mapKey = "urbanguard-map";

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-zinc-100">
      {loading && (
        <div className="absolute inset-0 z-[2000] flex items-center justify-center bg-zinc-50/80 backdrop-blur-sm">
          <motion.div
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 1.2, repeat: Infinity }}
            className="rounded-2xl border border-zinc-200 bg-white px-6 py-4 text-sm font-medium text-zinc-700 shadow-lg"
          >
            Đang tải bản đồ…
          </motion.div>
        </div>
      )}

      <MapContainer
        key={mapKey}
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        className="absolute inset-0 z-0 h-full w-full"
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

      <MapSearchOverlay />

      <Banner
        variant="warning"
        show={!!routeWarning}
        position="fixed-top"
        className="!top-[5.5rem] sm:!top-[5.75rem]"
      >
        {routeWarning}
      </Banner>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="pointer-events-auto fixed left-3 right-3 z-[1200] top-[calc(max(0.75rem,env(safe-area-inset-top,0px))+4.5rem)] sm:left-auto sm:right-4 sm:max-w-md"
        >
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-900 shadow-lg">
            {error}. Kiểm tra{" "}
            <code className="rounded bg-red-100 px-1 text-xs">
              NEXT_PUBLIC_API_URL
            </code>
            .
          </div>
        </motion.div>
      )}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[900] flex flex-col items-stretch gap-2 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))]">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, type: "spring", stiffness: 320, damping: 28 }}
          className="pointer-events-auto mx-auto w-full max-w-xl rounded-2xl border border-zinc-200/90 bg-white/95 px-4 py-3 text-center text-xs font-medium text-zinc-600 shadow-lg shadow-zinc-900/8 backdrop-blur-md"
        >
          {routeCoords
            ? "Tuyến đang hiển thị — kéo waypoint để đổi lộ trình. Vào đệm ~115 m quanh sự cố sẽ có cảnh báo và thử né tự động."
            : "Chọn điểm đi / đến trên bản đồ để xem tuyến OSRM."}
          {clustering && (
            <span className="mt-1 block text-zinc-500">
              Đang gom cụm marker — zoom để xem từng sự cố.
            </span>
          )}
        </motion.div>
      </div>

      <div className="pointer-events-auto absolute bottom-[max(5.5rem,calc(env(safe-area-inset-bottom,0px)+4.5rem))] left-3 z-[1000] max-w-[min(100%,20rem)] scale-90 origin-bottom-left sm:scale-100">
        <ReportImageTestAssist />
      </div>

      <motion.div
        className="pointer-events-auto absolute bottom-[max(1.25rem,env(safe-area-inset-bottom,0px))] right-4 z-[1000]"
        whileTap={{ scale: 0.94 }}
        whileHover={{ rotate: 6, scale: 1.04 }}
        transition={{ type: "spring", stiffness: 400, damping: 22 }}
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <Link
          href="/report"
          className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-600 text-3xl font-light leading-none text-white shadow-xl shadow-red-900/40 ring-4 ring-white/95 hover:from-red-600 hover:to-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
          aria-label="Báo cáo sự cố mới"
          title="Báo cáo sự cố"
        >
          +
        </Link>
      </motion.div>

    </div>
  );
}
