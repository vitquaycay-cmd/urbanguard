import { useState } from "react";
import ActiveReportsMap from "@/components/ActiveReportsMap";
import type { ActiveReport } from "@/components/ActiveReportsMap";
import "@/styles/map.css";
import { getRealSafeRoute } from "@/services/safeRoute.api";

type LatLngTuple = [number, number];

type SafeRouteInfo = {
  distance: number;
  duration: number;
  dangerPenalty: number;
  totalCost: number;
  routeStatus: "safe" | "avoided" | "danger" | "normal";
};

type MapRightPanelProps = {
  loading: boolean;
  routeInfo: SafeRouteInfo | null;
  startPoint: LatLngTuple | null;
  endPoint: LatLngTuple | null;
  validatedCount: number;
  onFindSafeRoute: () => void;
  onResetRoutePoints: () => void;
};

const recentUpdates = [
  { id: 1, text: "AI đã xác thực báo cáo hợp lệ", time: "Tự động" },
  { id: 2, text: "Sự cố VALIDATED đang được dùng để né đường", time: "Realtime" },
  { id: 3, text: "AI Safe Route đã kết nối với báo cáo thật", time: "Đang hoạt động" },
];

function formatPoint(point: LatLngTuple | null) {
  if (!point) return "Chưa chọn";
  return `${point[0].toFixed(6)}, ${point[1].toFixed(6)}`;
}

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

function getDangerType(report: ActiveReport) {
  if (report.aiLabels && report.aiLabels.length > 0) {
    return report.aiLabels[0];
  }

  return report.title || "traffic_incident";
}

function getDangerPenalty(report: ActiveReport) {
  const score = Number(report.trustScore || 0);

  if (score >= 80) return 9000;
  if (score >= 60) return 7000;
  if (score >= 40) return 5000;

  return 3000;
}

function getRouteStatusText(status: SafeRouteInfo["routeStatus"]) {
  if (status === "safe") return "Tuyến đường an toàn, không đi gần sự cố.";
  if (status === "avoided") return "AI đã chọn tuyến an toàn hơn để né vùng nguy hiểm.";
  if (status === "danger") return "Tuyến vẫn còn đi gần vùng nguy hiểm, hãy cân nhắc chọn lại điểm.";
  return "Tuyến đường đã được tính toán.";
}

function normalizeRouteCoordinates(data: unknown): LatLngTuple[] {
  const selectedRoute =
    data && typeof data === "object" && "selectedRoute" in data
      ? (data as { selectedRoute?: Record<string, unknown> }).selectedRoute
      : undefined;

  const leafletCoordinates = selectedRoute?.leafletCoordinates;

  if (Array.isArray(leafletCoordinates)) {
    return leafletCoordinates
      .filter((p): p is [unknown, unknown] => Array.isArray(p) && p.length >= 2)
      .map((p) => [Number(p[0]), Number(p[1])] as LatLngTuple)
      .filter(([lat, lng]: LatLngTuple) => isValidLatLng(lat, lng));
  }

  const coordinates = selectedRoute?.coordinates;

  if (Array.isArray(coordinates)) {
    return coordinates
      .filter((p): p is [unknown, unknown] => Array.isArray(p) && p.length >= 2)
      .map((p) => [Number(p[1]), Number(p[0])] as LatLngTuple)
      .filter(([lat, lng]: LatLngTuple) => isValidLatLng(lat, lng));
  }

  return [];
}

function MapRightPanel({
  loading,
  routeInfo,
  startPoint,
  endPoint,
  validatedCount,
  onFindSafeRoute,
  onResetRoutePoints,
}: MapRightPanelProps) {
  return (
    <aside className="flex w-[360px] shrink-0 flex-col gap-4">
      <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-[13px] font-extrabold uppercase tracking-widest text-slate-400">
          AI Safe Route
        </h2>

        <div className="mb-3 rounded-xl bg-slate-50 p-3 text-xs font-semibold text-slate-600">
          <p>
            <b>Điểm bắt đầu:</b> {formatPoint(startPoint)}
          </p>
          <p className="mt-1">
            <b>Điểm kết thúc:</b> {formatPoint(endPoint)}
          </p>
          <p className="mt-2 text-[11px] font-medium text-slate-400">
            Click trên bản đồ lần 1 để chọn điểm bắt đầu, lần 2 để chọn điểm kết thúc.
            Click lần 3 sẽ chọn lại từ đầu.
          </p>
        </div>

        <button
          onClick={onFindSafeRoute}
          disabled={loading}
          className="w-full rounded-xl bg-green-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Đang tìm đường..." : "Tìm đường an toàn"}
        </button>

        <button
          onClick={onResetRoutePoints}
          disabled={loading}
          className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Chọn lại điểm
        </button>

        {routeInfo && (
          <div className="mt-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
            <p className="font-bold text-green-700">
              {getRouteStatusText(routeInfo.routeStatus)}
            </p>
            <p className="mt-2">
              <b>Quãng đường:</b> {Math.round(routeInfo.distance)}m
            </p>
            <p>
              <b>Thời gian:</b> {Math.round(routeInfo.duration)} giây
            </p>
            <p>
              <b>Penalty nguy hiểm:</b> {Math.round(routeInfo.dangerPenalty)}
            </p>
            <p>
              <b>Total cost:</b> {Math.round(routeInfo.totalCost)}
            </p>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-[13px] font-extrabold uppercase tracking-widest text-slate-400">
          Overview
        </h2>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex min-h-[88px] flex-col justify-center rounded-[18px] border border-slate-200/80 bg-slate-50 px-3.5 py-3.5">
            <div className="text-[28px] font-extrabold leading-none text-green-600">
              {validatedCount}
            </div>
            <div className="mt-2 text-xs font-bold text-slate-500">Validated</div>
          </div>

          <div className="flex min-h-[88px] flex-col justify-center rounded-[18px] border border-slate-200/80 bg-slate-50 px-3.5 py-3.5">
            <div className="text-[28px] font-extrabold leading-none text-red-500">
              {validatedCount}
            </div>
            <div className="mt-2 text-xs font-bold text-slate-500">Dangers</div>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-[13px] font-extrabold uppercase tracking-widest text-slate-400">
          Chú giải
        </h2>

        <div className="flex min-h-[38px] items-center gap-2.5 text-sm font-semibold text-slate-700">
          <span className="h-3 w-3 shrink-0 rounded-full bg-red-500" />
          <span>Sự cố / chướng ngại vật</span>
        </div>

        <div className="flex min-h-[38px] items-center gap-2.5 text-sm font-semibold text-slate-700">
          <span className="h-3 w-3 shrink-0 rounded-full bg-green-600" />
          <span>AI Safe Route</span>
        </div>
      </section>

      <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-[13px] font-extrabold uppercase tracking-widest text-slate-400">
          Cập nhật gần đây
        </h2>

        <ul className="space-y-3">
          {recentUpdates.map((u) => (
            <li
              key={u.id}
              className="border-b border-gray-50 pb-3 last:border-0 last:pb-0"
            >
              <p className="text-sm font-medium text-gray-900">{u.text}</p>
              <p className="mt-0.5 text-xs text-gray-400">{u.time}</p>
            </li>
          ))}
        </ul>
      </section>
    </aside>
  );
}

export default function MapPage() {
  const [safeRoute, setSafeRoute] = useState<LatLngTuple[]>([]);
  const [routeInfo, setRouteInfo] = useState<SafeRouteInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [startPoint, setStartPoint] = useState<LatLngTuple | null>(null);
  const [endPoint, setEndPoint] = useState<LatLngTuple | null>(null);
  const [validatedReports, setValidatedReports] = useState<ActiveReport[]>([]);

  function clearRouteResult() {
    setSafeRoute([]);
    setRouteInfo(null);
  }

  function handlePickPoint(point: LatLngTuple) {
    if (!startPoint) {
      setStartPoint(point);
      setEndPoint(null);
      clearRouteResult();
      return;
    }

    if (!endPoint) {
      setEndPoint(point);
      clearRouteResult();
      return;
    }

    setStartPoint(point);
    setEndPoint(null);
    clearRouteResult();
  }

  function handleResetRoutePoints() {
    setStartPoint(null);
    setEndPoint(null);
    clearRouteResult();
  }

  async function handleFindSafeRoute() {
    if (!startPoint || !endPoint) {
      alert("Hãy click trên bản đồ để chọn điểm bắt đầu và điểm kết thúc.");
      return;
    }

    const dangers = validatedReports
      .filter((r) => isValidLatLng(r.latitude, r.longitude))
      .map((r) => ({
        lat: r.latitude,
        lng: r.longitude,
        type: getDangerType(r),
        penalty: getDangerPenalty(r),
      }));

    try {
      setLoading(true);

      const data = await getRealSafeRoute({
        startLat: startPoint[0],
        startLng: startPoint[1],
        endLat: endPoint[0],
        endLng: endPoint[1],
        dangers,
      });

      const routeCoords = normalizeRouteCoordinates(data);

      if (routeCoords.length < 2) {
        alert("AI đã trả về route nhưng không có tọa độ hợp lệ để vẽ.");
        return;
      }

      const selectedRoute = data?.selectedRoute || {};
      const dangerPenalty = Number(selectedRoute?.dangerPenalty ?? 0);
      const distance = Number(selectedRoute?.distance ?? 0);
      const totalCost = Number(selectedRoute?.totalCost ?? distance);

      let routeStatus: SafeRouteInfo["routeStatus"] = "normal";

      if (dangers.length === 0) {
        routeStatus = "normal";
      } else if (dangerPenalty <= 0) {
        routeStatus = "safe";
      } else if (totalCost > distance) {
        routeStatus = "avoided";
      } else {
        routeStatus = "danger";
      }

      setSafeRoute(routeCoords);

      setRouteInfo({
        distance,
        duration: Number(selectedRoute?.duration ?? 0),
        dangerPenalty,
        totalCost,
        routeStatus,
      });
    } catch (error) {
      console.error("Find safe route error:", error);
      alert("Không gọi được AI service. Kiểm tra http://127.0.0.1:5000/docs");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[560px] w-full flex-1 gap-4">
      <div className="min-h-0 min-w-0 flex-1">
        <ActiveReportsMap
          safeRoute={safeRoute}
          startPoint={startPoint}
          endPoint={endPoint}
          onPickPoint={handlePickPoint}
          onValidatedReportsChange={setValidatedReports}
        />
      </div>

      <MapRightPanel
        loading={loading}
        routeInfo={routeInfo}
        startPoint={startPoint}
        endPoint={endPoint}
        validatedCount={validatedReports.length}
        onFindSafeRoute={handleFindSafeRoute}
        onResetRoutePoints={handleResetRoutePoints}
      />
    </div>
  );
}