import { useEffect, useState } from "react";
import { getStatisticsOverview } from "../../services/statistics.api";
import type { StatsOverview } from "../../services/statistics.api";

type StatCardProps = {
  icon: string;
  value: string;
  label: string;
  meta: string;
  metaClass?: string;
  iconClass?: string;
};

function StatCard({
  icon,
  value,
  label,
  meta,
  metaClass = "",
  iconClass = "",
}: StatCardProps) {
  return (
    <div className="db-stat-card">
      <div className={`db-stat-card__icon ${iconClass}`}>{icon}</div>
      <div className="db-stat-card__value">{value}</div>
      <div className="db-stat-card__label">{label}</div>
      <div className={`db-stat-card__meta ${metaClass}`}>{meta}</div>
    </div>
  );
}

export default function DashboardStats() {
  const [stats, setStats] = useState<StatsOverview | null>(null);

  useEffect(() => {
    // 🔗 KẾT NỐI: Gọi API thống kê tổng quan từ Backend
    getStatisticsOverview()
      .then(setStats)
      .catch((err) => console.error("Lỗi tải thống kê Dashboard:", err));
  }, []);

  // Nếu chưa có data, hiện giá trị 0 hoặc loading
  const data = stats?.byStatus || { PENDING: 0, VALIDATED: 0, RESOLVED: 0, REJECTED: 0, VERIFIED: 0 };
  const autoRate = stats?.autoValidatedRate || 0;

  return (
    <div className="db-stats">
      <StatCard
        icon="🕳️"
        value={String(data.PENDING + data.VALIDATED)}
        label="Tổng sự cố"
        meta="Dữ liệu từ hệ thống"
        metaClass="db-stat-card__meta--green"
        iconClass="db-stat-card__icon--pink"
      />

      <StatCard
        icon="🚨"
        value={String(data.PENDING)}
        label="Đang chờ duyệt"
        meta="Cần xử lý gấp"
        metaClass="db-stat-card__meta--red"
        iconClass="db-stat-card__icon--orange"
      />

      <StatCard
        icon="✅"
        value={String(data.RESOLVED)}
        label="Đã hoàn thành"
        meta="Đã khắc phục xong"
        metaClass="db-stat-card__meta--green"
        iconClass="db-stat-card__icon--green"
      />

      <StatCard
        icon="🤖"
        value={`${autoRate}%`}
        label="Tỷ lệ AI duyệt"
        meta="Độ chính xác cao"
        metaClass="db-stat-card__meta--green"
        iconClass="db-stat-card__icon--blue"
      />
    </div>
  );
}