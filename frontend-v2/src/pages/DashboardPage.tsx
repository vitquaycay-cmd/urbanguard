import { BarChart, Bar, XAxis, ResponsiveContainer } from "recharts";
import {
  Hand,
  Plus,
  HardHat,
  Car,
  Droplets,
  CheckCircle,
  MoreHorizontal,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { fetchAdminReports, type ReportDetail } from "@/services/report.api";

const DAY_LABELS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 2) return "Vừa xong";
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  return `${Math.floor(hours / 24)} ngày trước`;
}

function statusColor(status: string): string {
  if (status === "VALIDATED") return "bg-green-500";
  if (status === "REJECTED") return "bg-red-500";
  if (status === "RESOLVED") return "bg-blue-500";
  return "bg-orange-400";
}

function countByKeyword(reports: ReportDetail[], keywords: string[]): number {
  return reports.filter((r) => {
    const text = `${r.title} ${r.description}`.toLowerCase();
    const labels = Array.isArray(r.aiLabels)
      ? (r.aiLabels as string[]).join(" ").toLowerCase()
      : "";
    return keywords.some((k) => text.includes(k) || labels.includes(k));
  }).length;
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useCurrentUser();
  const displayName =
    user?.fullname?.split(" ").pop() ||
    user?.username ||
    user?.email?.split("@")[0] ||
    "bạn";

  const [activeTab, setActiveTab] = useState("week");
  const [allReports, setAllReports] = useState<ReportDetail[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetchAdminReports({ limit: 100, sortBy: "createdAt", sortOrder: "desc" })
      .then((res) => { if (!cancelled) setAllReports(res.data); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  // Chart: group by day of week / day of last month / month of year
  const chartData = (() => {
    const now = new Date();
    if (activeTab === "week") {
      const startOfWeek = new Date(now);
      const day = now.getDay();
      startOfWeek.setDate(now.getDate() - ((day + 6) % 7));
      startOfWeek.setHours(0, 0, 0, 0);
      const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 0: 0 };
      allReports.forEach((r) => {
        const d = new Date(r.createdAt);
        if (d >= startOfWeek && d <= now) counts[d.getDay()]++;
      });
      return [1, 2, 3, 4, 5, 6, 0].map((dow) => ({
        day: DAY_LABELS[dow],
        value: counts[dow],
      }));
    } else if (activeTab === "month") {
      const firstOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      const daysInMonth = lastOfLastMonth.getDate();
      const counts: Record<number, number> = {};
      for (let i = 1; i <= daysInMonth; i++) counts[i] = 0;
      allReports.forEach((r) => {
        const d = new Date(r.createdAt);
        if (d >= firstOfLastMonth && d <= lastOfLastMonth) counts[d.getDate()]++;
      });
      return Array.from({ length: daysInMonth }, (_, i) => ({
        day: String(i + 1),
        value: counts[i + 1],
      }));
    } else {
      // year: group by month (T1–T12) for current year
      const year = now.getFullYear();
      const counts: Record<number, number> = {};
      for (let m = 0; m < 12; m++) counts[m] = 0;
      allReports.forEach((r) => {
        const d = new Date(r.createdAt);
        if (d.getFullYear() === year) counts[d.getMonth()]++;
      });
      return Array.from({ length: 12 }, (_, m) => ({
        day: `T${m + 1}`,
        value: counts[m],
      }));
    }
  })();

  // Activity: 4 most recent reports
  const activities = allReports.slice(0, 4).map((r) => ({
    id: r.id,
    title: r.title,
    location: `${r.latitude.toFixed(4)}, ${r.longitude.toFixed(4)}`,
    time: relativeTime(r.createdAt),
    color: statusColor(r.status),
  }));

  // Stat cards
  const totalReports = allReports.length;
  const potholesCount = countByKeyword(allReports, ["ổ gà", "pothole", "hố", "lún"]);
  const accidentsCount = countByKeyword(allReports, ["tai nạn", "accident", "va chạm", "đâm"]);
  const floodsCount = countByKeyword(allReports, ["ngập", "lụt", "flood", "triều"]);
  const resolvedPct =
    totalReports > 0
      ? Math.round(
          (allReports.filter((r) => r.status === "VALIDATED" || r.status === "RESOLVED").length /
            totalReports) *
            100,
        )
      : 89;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* SECTION 1 — Greeting + CTA */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900">
              {`Chào buổi sáng, ${displayName}`}
            </h1>
            <Hand size={20} className="text-yellow-400" />
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Hệ thống ghi nhận 12 cảnh báo mới trong 2 giờ qua.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/report")}
          className="flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-700"
        >
          <Plus size={16} />
          Báo cáo mới
        </button>
      </div>

      {/* SECTION 2 — 4 Stat Cards */}
      <div className="mb-6 grid grid-cols-4 gap-4">
        {/* Card 1: Ổ gà */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50">
              <HardHat size={20} className="text-orange-500" />
            </div>
            <div className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-700">
              +12%
            </div>
          </div>
          <div className="mt-2 text-3xl font-bold text-gray-900">{potholesCount || "—"}</div>
          <div className="mt-0.5 text-sm text-gray-500">Ổ gà</div>
          <div className="mt-3 h-1.5 rounded-full bg-gray-100">
            <div className="h-full rounded-full bg-orange-400" style={{ width: totalReports ? `${Math.min((potholesCount / totalReports) * 100, 100)}%` : "0%" }}></div>
          </div>
        </div>

        {/* Card 2: Tai nạn */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50">
              <Car size={20} className="text-red-500" />
            </div>
            <div className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-600">
              -5%
            </div>
          </div>
          <div className="mt-2 text-3xl font-bold text-gray-900">{accidentsCount || "—"}</div>
          <div className="mt-0.5 text-sm text-gray-500">Tai nạn</div>
          <div className="mt-3 h-1.5 rounded-full bg-gray-100">
            <div className="h-full rounded-full bg-red-400" style={{ width: totalReports ? `${Math.min((accidentsCount / totalReports) * 100, 100)}%` : "0%" }}></div>
          </div>
        </div>

        {/* Card 3: Ngập lụt */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
              <Droplets size={20} className="text-blue-500" />
            </div>
            <div className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-700">
              +30%
            </div>
          </div>
          <div className="mt-2 text-3xl font-bold text-gray-900">{floodsCount || "—"}</div>
          <div className="mt-0.5 text-sm text-gray-500">Ngập lụt</div>
          <div className="mt-3 h-1.5 rounded-full bg-gray-100">
            <div className="h-full rounded-full bg-blue-400" style={{ width: totalReports ? `${Math.min((floodsCount / totalReports) * 100, 100)}%` : "0%" }}></div>
          </div>
        </div>

        {/* Card 4: Đã xử lý */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50">
              <CheckCircle size={20} className="text-green-500" />
            </div>
            <div className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-700">
              +3%
            </div>
          </div>
          <div className="mt-2 text-3xl font-bold text-gray-900">{resolvedPct}%</div>
          <div className="mt-0.5 text-sm text-gray-500">Đã xử lý</div>
          <div className="mt-3 h-1.5 rounded-full bg-gray-100">
            <div className="h-full rounded-full bg-green-500" style={{ width: `${resolvedPct}%` }}></div>
          </div>
        </div>
      </div>

      {/* SECTION 3 — Two columns */}
      <div className="mt-6 grid grid-cols-3 gap-6">
        {/* LEFT: Chart */}
        <div className="col-span-2 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900">
              {activeTab === "week" ? "Sự cố theo ngày" : activeTab === "month" ? "Sự cố tháng trước" : "Sự cố theo tháng"}
            </h2>
            <div className="flex rounded-lg bg-gray-100 p-0.5">
              <button
                type="button"
                onClick={() => setActiveTab("week")}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-all ${
                  activeTab === "week"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-400"
                }`}
              >
                Tuần này
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("month")}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-all ${
                  activeTab === "month"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-400"
                }`}
              >
                Tháng trước
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("year")}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-all ${
                  activeTab === "year"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-400"
                }`}
              >
                Theo tháng
              </button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData}>
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#9ca3af" }}
              />
              <Bar dataKey="value" fill="#16a34a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* RIGHT: Recent Activity */}
        <div className="col-span-1 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900">Hoạt động gần đây</h2>
            <button type="button" className="text-gray-400 transition-colors hover:text-gray-600">
              <MoreHorizontal size={18} />
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {activities.map((activity) => (
              <div key={activity.id} className="flex gap-3 py-3">
                <div className={`mt-2 h-2 w-2 flex-shrink-0 rounded-full ${activity.color}`}></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                  <p className="mt-0.5 text-xs text-gray-400">{activity.location}</p>
                  <p className="mt-0.5 text-xs text-gray-400">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
          <a
            href="#"
            className="mt-3 block text-sm font-medium text-green-600 transition-colors hover:text-green-700"
          >
            Xem toàn bộ lịch sử →
          </a>
        </div>
      </div>

      {/* SECTION 4 — Heatmap Preview */}
      <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-6">
          {/* Left: Info */}
          <div className="w-1/3">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
              Tổng quan
            </p>
            <h3 className="mt-1 text-xl font-bold text-gray-900">Bản đồ nhiệt</h3>
            <p className="mt-1 text-sm text-gray-500">
              Mật độ sự cố cập nhật theo khu vực thời gian thực.
            </p>
            <div className="mt-4 flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <div>
                <p className="text-xs font-semibold text-gray-700">Khu vực nóng nhất</p>
                <p className="text-xs text-gray-400">Quận 1, TP. Hồ Chí Minh</p>
              </div>
            </div>
          </div>

          {/* Right: Fake Map */}
          <div className="relative h-48 flex-1 overflow-hidden rounded-2xl bg-gray-900">
            {/* Road grid simulation */}
            <div className="absolute inset-0">
              <div className="absolute top-1/4 h-px w-full border-t border-gray-700/50"></div>
              <div className="absolute top-1/2 h-px w-full border-t border-gray-700/50"></div>
              <div className="absolute top-3/4 h-px w-full border-t border-gray-700/50"></div>
              <div className="absolute left-1/4 h-full w-px border-l border-gray-700/50"></div>
              <div className="absolute left-1/2 h-full w-px border-l border-gray-700/50"></div>
              <div className="absolute right-1/4 h-full w-px border-l border-gray-700/50"></div>
            </div>

            {/* Glow blobs */}
            <div className="absolute left-1/3 top-1/4 h-32 w-32 rounded-full bg-green-500/20 blur-2xl"></div>
            <div className="absolute right-1/4 top-1/3 h-20 w-20 rounded-full bg-orange-500/20 blur-xl"></div>

            {/* Corner buttons */}
            <div className="absolute bottom-3 right-3 flex flex-col gap-1">
              <button
                type="button"
                className="flex h-7 w-7 items-center justify-center rounded bg-gray-800 text-sm text-white transition-colors hover:bg-gray-700"
              >
                +
              </button>
              <button
                type="button"
                className="flex h-7 w-7 items-center justify-center rounded bg-gray-800 text-sm text-white transition-colors hover:bg-gray-700"
              >
                −
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
