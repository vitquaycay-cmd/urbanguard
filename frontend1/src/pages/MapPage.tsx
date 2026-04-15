import AppShell from "../components/layout/AppShell";
import ActiveReportsMap from "../components/ActiveReportsMap";

function MapRightPanel() {
  return (
    <>
      <div className="ug-stats-card">
        <div className="ug-panel-title">Overview</div>

        <div className="ug-stats-grid">
          <div className="ug-stat-box">
            <div className="ug-stat-value">201</div>
            <div className="ug-stat-label">Validated</div>
          </div>

          <div className="ug-stat-box">
            <div className="ug-stat-value ug-stat-value--red">142</div>
            <div className="ug-stat-label">Pothole</div>
          </div>

          <div className="ug-stat-box">
            <div className="ug-stat-value ug-stat-value--orange">38</div>
            <div className="ug-stat-label">Accident</div>
          </div>

          <div className="ug-stat-box">
            <div className="ug-stat-value ug-stat-value--blue">21</div>
            <div className="ug-stat-label">Flooding</div>
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