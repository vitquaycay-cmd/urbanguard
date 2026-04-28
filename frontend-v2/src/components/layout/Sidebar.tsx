import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Map,
  FileText,
  MessageSquare,
  Bell,
  User,
  Users,
  Settings,
  LogOut,
  Shield,
  ClipboardList,
} from "lucide-react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
// import { useUnreadCount } from '@/hooks/useUnreadCount'
import {
  logoutRequest,
  getStoredRefreshToken,
  removeStoredTokens,
} from "@/services/auth.api";

interface SidebarProps {
  onLogout?: () => void;
}

export default function Sidebar({ onLogout }: SidebarProps) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user } = useCurrentUser();
  // const unreadCount = useUnreadCount(user?.id)

  const initial = (user?.fullname || user?.email || "U")[0].toUpperCase();
  const displayName =
    user?.fullname || user?.username || user?.email || "Người dùng";
  const roleLabel = user?.role === "ADMIN" ? "Quản trị viên" : "Thành viên";

  async function handleLogout() {
    try {
      const refreshToken = getStoredRefreshToken();
      if (refreshToken) await logoutRequest(refreshToken);
    } catch {
      /* ignore */
    }
    removeStoredTokens();
    onLogout?.();
    navigate("/login");
  }

  const mainNavItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    {
      icon: Map,
      label: "Map",
      href: "/map",
      badge: { text: "LIVE", color: "green" },
    },
    {
      icon: FileText,
      label: "Reports",
      href: "/report",
    },
    {
      icon: MessageSquare,
      label: "Forum",
      href: "http://localhost:5174",
      external: true,
      badge: { text: "12", color: "green" },
    },
    {
      icon: Bell,
      label: "Notifications",
      href: "/notifications",
    },
  ];

  const personalNavItems = [
    { icon: User, label: "Profile", href: "/profile" },
    { icon: Settings, label: "Settings", href: "/settings" },
  ];

  const accountNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    `mx-2 flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
      isActive
        ? "bg-green-50 text-green-700 font-semibold border-l-2 border-green-600 rounded-l-none rounded-r-xl"
        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
    }`;

  return (
    <div
      className="fixed left-0 top-0 h-screen w-60 flex flex-col bg-white border-r border-gray-200 shadow-lg"
      style={{ boxShadow: "2px 0 8px rgba(0,0,0,0.04)" }}
    >
      {/* Brand Section */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 bg-green-600 rounded-xl flex items-center justify-center">
            <Shield className="w-4.5 h-4.5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-900">UrbanGuard</h1>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
              Traffic Safety Monitor
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4">
        {/* Main Group */}
        <div className="mb-6">
          <p className="px-4 text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-3">
            Main
          </p>
          <nav className="space-y-1">
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              if (item.external) {
                return (
                  <a
                    key={item.label}
                    href={item.href}
                    className="mx-2 flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="flex-1">{item.label}</span>

                    {item.badge && (
                      <span className="text-[10px] font-bold px-2 rounded-full bg-green-100 text-green-700">
                        {item.badge.text}
                      </span>
                    )}
                  </a>
                );
              }

              return (
                <Link
                  key={item.label}
                  to={item.href}
                  className={`mx-2 flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                    isActive
                      ? "bg-green-50 text-green-700 font-semibold border-l-2 border-green-600 rounded-l-none rounded-r-xl"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="flex-1">{item.label}</span>

                  {item.badge && (
                    <span className="text-[10px] font-bold px-2 rounded-full bg-green-100 text-green-700">
                      {item.badge.text}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Personal Group */}
        <div>
          <p className="px-4 text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-3">
            Personal
          </p>
          <nav className="space-y-1">
            {personalNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.label}
                  to={item.href}
                  className={`mx-2 flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                    isActive
                      ? "bg-green-50 text-green-700 font-semibold border-l-2 border-green-600 rounded-l-none rounded-r-xl"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            {user?.role === "ADMIN" && (
              <>
                <NavLink
                  to="/report-management"
                  className={accountNavLinkClass}
                >
                  <ClipboardList className="h-[18px] w-[18px] flex-shrink-0" />
                  <span>Quản lý báo cáo</span>
                </NavLink>
                <NavLink
                  to="/account-management"
                  className={accountNavLinkClass}
                >
                  <Users className="h-[18px] w-[18px] flex-shrink-0" />
                  <span>Tài khoản</span>
                </NavLink>
              </>
            )}
          </nav>
        </div>
      </div>

      {/* User Profile Section */}
      <div className="border-t border-gray-200 p-4">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-green-600">
            <span className="text-sm font-bold text-white">{initial}</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-gray-900">
              {displayName}
            </p>
            <p className="truncate text-xs text-gray-400">{roleLabel}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full flex-shrink-0 items-center justify-center gap-2 rounded-xl p-1 text-sm text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
          aria-label="Đăng xuất"
        >
          <LogOut size={18} />
          <span>Đăng xuất</span>
        </button>
      </div>
    </div>
  );
}
