import { NavLink } from "react-router-dom";

export default function Sidebar() {
  const getClassName = ({ isActive }: { isActive: boolean }) =>
    isActive ? "app-sidebar__item app-sidebar__item--active" : "app-sidebar__item";

  return (
    <aside className="app-sidebar">
      <div className="app-sidebar__brand">
        <div className="app-sidebar__logo">🛡️</div>

        <div>
          <div className="app-sidebar__title">UrbanGuard</div>
          <div className="app-sidebar__sub">Traffic Safety Monitor</div>
        </div>
      </div>

      <nav className="app-sidebar__nav">
        <div className="app-sidebar__group-title">Tổng quan</div>

        <NavLink to="/dashboard" className={getClassName}>
          <span className="app-sidebar__item-left">
            <span className="app-sidebar__item-icon">⌘</span>
            <span>Dashboard</span>
          </span>
        </NavLink>

        <NavLink to="/map" className={getClassName}>
          <span className="app-sidebar__item-left">
            <span className="app-sidebar__item-icon">🗺️</span>
            <span>Bản đồ</span>
          </span>
          <span className="app-sidebar__badge app-sidebar__badge--live">LIVE</span>
        </NavLink>

        <NavLink to="/report" className={getClassName}>
          <span className="app-sidebar__item-left">
            <span className="app-sidebar__item-icon">📝</span>
            <span>Báo cáo</span>
          </span>
          <span className="app-sidebar__badge app-sidebar__badge--orange">5</span>
        </NavLink>

        <div className="app-sidebar__group-title app-sidebar__group-title--spaced">
          Cộng đồng
        </div>

        <NavLink to="/forum" className={getClassName}>
          <span className="app-sidebar__item-left">
            <span className="app-sidebar__item-icon">💬</span>
            <span>Diễn đàn</span>
          </span>
          <span className="app-sidebar__badge app-sidebar__badge--green">12</span>
        </NavLink>

        <NavLink to="/notifications" className={getClassName}>
          <span className="app-sidebar__item-left">
            <span className="app-sidebar__item-icon">🔔</span>
            <span>Thông báo</span>
          </span>
          <span className="app-sidebar__badge app-sidebar__badge--red">3</span>
        </NavLink>

        <div className="app-sidebar__group-title app-sidebar__group-title--spaced">
          Cá nhân
        </div>

        <NavLink to="/profile" className={getClassName}>
          <span className="app-sidebar__item-left">
            <span className="app-sidebar__item-icon">👤</span>
            <span>Hồ sơ</span>
          </span>
        </NavLink>

        <NavLink to="/account-management" className={getClassName}>
          <span className="app-sidebar__item-left">
            <span className="app-sidebar__item-icon">👥</span>
            <span>Tài khoản</span>
          </span>
        </NavLink>

        <NavLink to="/settings" className={getClassName}>
          <span className="app-sidebar__item-left">
            <span className="app-sidebar__item-icon">⚙️</span>
            <span>Cài đặt</span>
          </span>
        </NavLink>
      </nav>

      <div className="app-sidebar__footer">
        <div className="app-sidebar__profile">
          <div className="app-sidebar__avatar">N</div>

          <div className="app-sidebar__profile-content">
            <div className="app-sidebar__profile-name">Nguyễn Văn An</div>
            <div className="app-sidebar__profile-role">⭐ Thành viên tích cực</div>
          </div>
        </div>

        <button type="button" className="app-sidebar__logout">
          <span className="app-sidebar__logout-icon">↪</span>
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
}