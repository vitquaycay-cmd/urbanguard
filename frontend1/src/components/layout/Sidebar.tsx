import { NavLink } from "react-router-dom";
import {
  Map,
  LayoutDashboard,
  FileText,
  MessageSquare,
  Bell,
  User,
  Users,
  Settings,
  Shield,
  LogOut,
  Star
} from "lucide-react";

export default function Sidebar() {
  const getClassName = ({ isActive }: { isActive: boolean }) =>
    isActive ? "app-sidebar__item app-sidebar__item--active" : "app-sidebar__item";

  return (
    <aside className="app-sidebar">
      <div className="app-sidebar__brand">
        <div className="app-sidebar__logo">
          <Shield size={20} />
        </div>

        <div>
          <div className="app-sidebar__title">UrbanGuard</div>
          <div className="app-sidebar__sub">Traffic Safety Monitor</div>
        </div>
      </div>

      <nav className="app-sidebar__nav">
        <div className="app-sidebar__group-title">Tổng quan</div>

        {/* Dashboard */}
        <NavLink to="/dashboard" className={getClassName}>
          <span className="app-sidebar__item-left">
            <span className="app-sidebar__item-icon">
              <LayoutDashboard size={18} />
            </span>
            <span>Dashboard</span>
          </span>
        </NavLink>

        {/* Map */}
        <NavLink to="/map" className={getClassName}>
          <span className="app-sidebar__item-left">
            <span className="app-sidebar__item-icon">
              <Map size={18} />
            </span>
            <span>Bản đồ</span>
          </span>
          <span className="app-sidebar__badge app-sidebar__badge--live">LIVE</span>
        </NavLink>

        {/* Report */}
        <NavLink to="/report" className={getClassName}>
          <span className="app-sidebar__item-left">
            <span className="app-sidebar__item-icon">
              <FileText size={18} />
            </span>
            <span>Báo cáo</span>
          </span>
          <span className="app-sidebar__badge app-sidebar__badge--orange">5</span>
        </NavLink>

        <div className="app-sidebar__group-title app-sidebar__group-title--spaced">
          Cộng đồng
        </div>

        {/* Forum */}
        <NavLink to="/forum" className={getClassName}>
          <span className="app-sidebar__item-left">
            <span className="app-sidebar__item-icon">
              <MessageSquare size={18} />
            </span>
            <span>Diễn đàn</span>
          </span>
          <span className="app-sidebar__badge app-sidebar__badge--green">12</span>
        </NavLink>

        {/* Notifications */}
        <NavLink to="/notifications" className={getClassName}>
          <span className="app-sidebar__item-left">
            <span className="app-sidebar__item-icon">
              <Bell size={18} />
            </span>
            <span>Thông báo</span>
          </span>
          <span className="app-sidebar__badge app-sidebar__badge--red">3</span>
        </NavLink>

        <div className="app-sidebar__group-title app-sidebar__group-title--spaced">
          Cá nhân
        </div>

        {/* Profile */}
        <NavLink to="/profile" className={getClassName}>
          <span className="app-sidebar__item-left">
            <span className="app-sidebar__item-icon">
              <User size={18} />
            </span>
            <span>Hồ sơ</span>
          </span>
        </NavLink>

        {/* Account */}
        <NavLink to="/account-management" className={getClassName}>
          <span className="app-sidebar__item-left">
            <span className="app-sidebar__item-icon">
              <Users size={18} />
            </span>
            <span>Tài khoản</span>
          </span>
        </NavLink>

        {/* Settings */}
        <NavLink to="/settings" className={getClassName}>
          <span className="app-sidebar__item-left">
            <span className="app-sidebar__item-icon">
              <Settings size={18} />
            </span>
            <span>Cài đặt</span>
          </span>
        </NavLink>
      </nav>

      <div className="app-sidebar__footer">
        <div className="app-sidebar__profile">
          <div className="app-sidebar__avatar">N</div>

          <div className="app-sidebar__profile-content">
            <div className="app-sidebar__profile-name">Nguyễn Văn An</div>
            <div className="app-sidebar__profile-role">
              <Star size={12} fill="currentColor" strokeWidth={0} />
              <span>Thành viên tích cực</span>
            </div>
          </div>
        </div>

        <button type="button" className="app-sidebar__logout">
          <span className="app-sidebar__logout-icon">
            <LogOut size={18} />
          </span>
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
}