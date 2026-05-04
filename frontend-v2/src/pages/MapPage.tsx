import { useState, useEffect } from "react";
import ActiveReportsMap from "@/components/ActiveReportsMap";
import { fetchActiveReports, type ActiveReport } from "@/lib/mapActiveReports";
import "@/styles/map.css";

function countByKeyword(reports: ActiveReport[], keywords: string[]): number {
  return reports.filter((r) => {
    const text = `${r.title} ${r.description}`.toLowerCase();
    const labels = Array.isArray(r.aiLabels)
      ? r.aiLabels.join(" ").toLowerCase()
      : "";
    return keywords.some((k) => text.includes(k) || labels.includes(k));
  }).length;
}

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 2) return "Vừa xong";
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  return `${Math.floor(hours / 24)} ngày trước`;
}

function MapRightPanel() {
  const [reports, setReports] = useState<ActiveReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchActiveReports()
      .then((data) => { if (!cancelled) setReports(data); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const validatedCount = reports.length;
  const potholesCount = countByKeyword(reports, ["ổ gà", "pothole", "hố", "lún", "crack", "hole"]);
  const accidentsCount = countByKeyword(reports, ["tai nạn", "accident", "va chạm", "đâm", "collision", "crash"]);
  const floodsCount = countByKeyword(reports, ["ngập", "lụt", "flood", "triều", "water", "rain"]);

  const recentReports = reports
    .slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <aside className="flex w-[360px] shrink-0 flex-col gap-4">
      <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-[13px] font-extrabold uppercase tracking-widest text-slate-400">
          Tổng quan
        </h2>
        {loading ? (
          <div className="flex h-[200px] items-center justify-center text-sm text-slate-400">
            Đang tải...
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <div className="flex min-h-[88px] flex-col justify-center rounded-[18px] border border-slate-200/80 bg-slate-50 px-3.5 py-3.5">
              <div className="text-[28px] font-extrabold leading-none text-green-600">{validatedCount}</div>
              <div className="mt-2 text-xs font-bold text-slate-500">Đã xác thực</div>
            </div>
            <div className="flex min-h-[88px] flex-col justify-center rounded-[18px] border border-slate-200/80 bg-slate-50 px-3.5 py-3.5">
              <div className="text-[28px] font-extrabold leading-none text-red-500">{potholesCount}</div>
              <div className="mt-2 text-xs font-bold text-slate-500">Ổ gà</div>
            </div>
            <div className="flex min-h-[88px] flex-col justify-center rounded-[18px] border border-slate-200/80 bg-slate-50 px-3.5 py-3.5">
              <div className="text-[28px] font-extrabold leading-none text-orange-500">{accidentsCount}</div>
              <div className="mt-2 text-xs font-bold text-slate-500">Tai nạn</div>
            </div>
            <div className="flex min-h-[88px] flex-col justify-center rounded-[18px] border border-slate-200/80 bg-slate-50 px-3.5 py-3.5">
              <div className="text-[28px] font-extrabold leading-none text-blue-500">{floodsCount}</div>
              <div className="mt-2 text-xs font-bold text-slate-500">Ngập lụt</div>
            </div>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-[13px] font-extrabold uppercase tracking-widest text-slate-400">
          Chú giải
        </h2>
        <div className="flex min-h-[38px] items-center gap-2.5 text-sm font-semibold text-slate-700">
          <span className="h-3 w-3 shrink-0 rounded-full bg-red-500" />
          <span>Ổ gà / Hư hỏng mặt đường</span>
        </div>
        <div className="flex min-h-[38px] items-center gap-2.5 text-sm font-semibold text-slate-700">
          <span className="h-3 w-3 shrink-0 rounded-full bg-orange-500" />
          <span>Tai nạn giao thông</span>
        </div>
        <div className="flex min-h-[38px] items-center gap-2.5 text-sm font-semibold text-slate-700">
          <span className="h-3 w-3 shrink-0 rounded-full bg-blue-500" />
          <span>Khu vực ngập nước</span>
        </div>
        <div className="flex min-h-[38px] items-center gap-2.5 text-sm font-semibold text-slate-700">
          <span className="h-3 w-3 shrink-0 rounded-full bg-green-600" />
          <span>Đã xác thực an toàn</span>
        </div>
      </section>

      <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-[13px] font-extrabold uppercase tracking-widest text-slate-400">
          Cập nhật gần đây
        </h2>
        {loading ? (
          <div className="py-4 text-center text-sm text-slate-400">Đang tải...</div>
        ) : recentReports.length === 0 ? (
          <div className="py-4 text-center text-sm text-slate-400">Chưa có báo cáo</div>
        ) : (
          <ul className="space-y-3">
            {recentReports.map((r) => (
              <li
                key={r.id}
                className="border-b border-gray-50 pb-3 last:border-0 last:pb-0"
              >
                <p className="text-sm font-medium text-gray-900">{r.title}</p>
                <p className="mt-0.5 text-xs text-gray-400">{relativeTime(r.createdAt)}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </aside>
  );
}

export default function MapPage() {
  return (
    <div className="flex min-h-[560px] w-full flex-1 gap-4">
      <div className="min-h-0 min-w-0 flex-1">
        <ActiveReportsMap />
      </div>
      <MapRightPanel />
    </div>
  );
}
