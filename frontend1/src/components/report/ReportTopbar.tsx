export default function ReportTopbar() {
  return (
    <header className="report-topbar">
      <div>
        <h1 className="report-topbar-title">Gửi báo cáo</h1>
        <p className="report-topbar-subtitle">
          Tạo báo cáo sự cố giao thông và hạ tầng đô thị
        </p>
      </div>

      <div className="report-topbar-right">
        <div className="report-live">● Live</div>

        <input
          type="text"
          className="report-search"
          placeholder="Tìm kiếm sự cố..."
        />

        <button className="report-icon-btn" type="button">
          🔔
        </button>

        <button className="report-icon-btn" type="button">
          ↩
        </button>
      </div>
    </header>
  );
}