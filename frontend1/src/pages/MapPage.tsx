import AppShell from "../components/layout/AppShell";
import ActiveReportsMap from "../components/ActiveReportsMap";

import { useEffect, useState } from "react";
import { getStatisticsOverview } from "../services/statistics.api";
import type { StatsOverview } from "../services/statistics.api";

function MapRightPanel() {
  const [stats, setStats] = useState<StatsOverview | null>(null);

  useEffect(() => {
    // 🔗 KẾT NỐI: Lấy số lượng thống kê thực tế cho Panel bên phải bản đồ
    getStatisticsOverview()
      .then(setStats)
      .catch((err) => console.error("Lỗi tải thống kê Map Panel:", err));
  }, []);

  const data = stats?.byStatus || { VALIDATED: 0, PENDING: 0, RESOLVED: 0, REJECTED: 0, VERIFIED: 0 };

  return (
    <>
      <div className="ug-stats-card">
        <div className="ug-panel-title">Overview (Live)</div>

        <div className="ug-stats-grid">
          <div className="ug-stat-box">
            <div className="ug-stat-value">{data.VALIDATED}</div>
            <div className="ug-stat-label">Validated</div>
          </div>

          <div className="ug-stat-box">
             {/* 🔗 KẾT NỐI: Giả định PENDING là các sự cố mới cần chú ý */}
            <div className="ug-stat-value ug-stat-value--red">{data.PENDING}</div>
            <div className="ug-stat-label">Pending</div>
          </div>

          <div className="ug-stat-box">
            <div className="ug-stat-value ug-stat-value--orange">{data.RESOLVED}</div>
            <div className="ug-stat-label">Resolved</div>
          </div>

          <div className="ug-stat-box">
            <div className="ug-stat-value ug-stat-value--blue">{data.REJECTED}</div>
            <div className="ug-stat-label">Rejected</div>
          </div>
        </div>
      </div>

      <div className="ug-legend-card">
        <div className="ug-panel-title">Legend</div>

        <div className="ug-legend-item">
          <span className="ug-legend-dot ug-legend-dot--red" />
          <span>Pothole / Road Damage</span>
        </div>

        <div className="ug-legend-item">
          <span className="ug-legend-dot ug-legend-dot--orange" />
          <span>Traffic Accident</span>
        </div>

        <div className="ug-legend-item">
          <span className="ug-legend-dot ug-legend-dot--blue" />
          <span>Flooding Area</span>
        </div>

        <div className="ug-legend-item">
          <span className="ug-legend-dot ug-legend-dot--green" />
          <span>Validated Safe Status</span>
        </div>
      </div>
    </>
  );
}

export default function MapPage() {
  return (
    <AppShell
      title="Bản đồ trực tiếp"
      subtitle="Theo dõi sự cố giao thông theo thời gian thực"
      rightPanel={<MapRightPanel />}
    >
      <ActiveReportsMap />
    </AppShell>
  );
}