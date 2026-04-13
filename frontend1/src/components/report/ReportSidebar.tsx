export default function ReportSidebar() {
  return (
    <aside className="report-sidebar">
      <div className="report-logo">
        <div className="report-logo-icon">🛡️</div>
        <div className="report-logo-text">UrbanGuard</div>
      </div>

      <div className="report-menu-group">
        <div className="report-menu-title">Chính</div>
        <div className="report-menu-item">Dashboard</div>
        <div className="report-menu-item">Bản đồ</div>
      </div>

      <div className="report-menu-group">
        <div className="report-menu-title">Báo cáo</div>
        <div className="report-menu-item active">Gửi báo cáo</div>
        <div className="report-menu-item">Quản lý báo cáo</div>
      </div>

      <div className="report-menu-group">
        <div className="report-menu-title">Tài khoản</div>
        <div className="report-menu-item">Hồ sơ</div>
        <div className="report-menu-item">Cài đặt</div>
      </div>

      <div className="report-user-box">
        <div className="report-user-avatar">N</div>
        <div>
          <div className="report-user-name">Nguyễn An</div>
          <div className="report-user-role">Thành viên tích cực</div>
        </div>
      </div>
    </aside>
  );
}