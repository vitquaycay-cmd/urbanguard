import { NavLink } from "react-router-dom";

export default function Sidebar() {
  const getClassName = ({ isActive }: { isActive: boolean }) =>
    isActive ? "app-sidebar__item app-sidebar__item--active" : "app-sidebar__item";

  return (
    <aside className="app-sidebar">
      <div className="app-sidebar__brand">
        <div className="app-sidebar__logo">UG</div>

        <div>
          <div className="app-sidebar__title">UrbanGuard</div>
          <div className="app-sidebar__sub">Traffic Safety Monitor</div>
        </div>
      </div>

      <nav className="app-sidebar__nav">
        <div className="app-sidebar__group-title">Chính</div>

        <NavLink to="/dashboard" className={getClassName}>
          Dashboard
        </NavLink>

        <NavLink to="/map" className={getClassName}>
          Bản đồ
        </NavLink>

        <div className="app-sidebar__group-title app-sidebar__group-title--spaced">
          Báo cáo
        </div>

        <NavLink to="/report" className={getClassName}>
          Gửi báo cáo
        </NavLink>

        <NavLink to="/report-management" className={getClassName}>
          Quản lý báo cáo
        </NavLink>

        <div className="app-sidebar__group-title app-sidebar__group-title--spaced">
          Tài khoản
        </div>

        <NavLink to="/profile" className={getClassName}>
          Hồ sơ
        </NavLink>

        <NavLink to="/account-management" className={getClassName}>
          Quản lý tài khoản 
        </NavLink>

        <NavLink to="/settings" className={getClassName}>
          Cài đặt
        </NavLink>
      </nav>

      <div className="app-sidebar__profile">
        <div className="app-sidebar__avatar">N</div>

        <div>
          <div className="app-sidebar__profile-name">Nguyễn An</div>
          <div className="app-sidebar__profile-role">Thành viên tích cực</div>
        </div>
      </div>
    </aside>
  );
}