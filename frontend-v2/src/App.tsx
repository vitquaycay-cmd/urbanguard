import { useState } from "react";
import { Routes, Route, Navigate, BrowserRouter } from "react-router-dom";
import { CurrentUserProvider, useCurrentUser } from "@/hooks/useCurrentUser";
import BannedModal from "@/components/BannedModal";
import { useBannedSocket } from "@/hooks/useBannedSocket";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppShell from "@/components/layout/AppShell";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import DashboardPage from "@/pages/DashboardPage";
import MapPage from "@/pages/MapPage";
import ReportPage from "@/pages/ReportPage";
import NotificationsPage from "@/pages/NotificationsPage";
import ProfilePage from "@/pages/ProfilePage";
import AccountManagementPage from "@/pages/AccountManagementPage";
import SettingsPage from "@/pages/SettingsPage";
import ForumPage from "@/pages/ForumPage";
import ReportManagementPage from "@/pages/ReportManagementPage";

function AppContent() {
  const { user } = useCurrentUser();
  const [isBanned, setIsBanned] = useState(false);

  useBannedSocket(user?.id, () => setIsBanned(true));

  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AppShell
                title="Dashboard"
                subtitle="Tổng quan hệ thống UrbanGuard"
              >
                <DashboardPage />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/map"
          element={
            <ProtectedRoute>
              <AppShell
                title="Bản đồ trực tiếp"
                subtitle="Theo dõi sự cố giao thông theo thời gian thực"
              >
                <MapPage />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/report"
          element={
            <ProtectedRoute>
              <AppShell
                title="Gửi báo cáo"
                subtitle="Tạo báo cáo sự cố giao thông và hạ tầng đô thị"
              >
                <ReportPage />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <AppShell
                title="Thông báo"
                subtitle="Cập nhật hoạt động, cảnh báo và tương tác mới nhất"
              >
                <NotificationsPage />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <AppShell
                title="Hồ sơ"
                subtitle="Thông tin cá nhân và lịch sử báo cáo"
              >
                <ProfilePage />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/account-management"
          element={
            <ProtectedRoute requiredRole="ADMIN">
              <AppShell
                title="Quản lý tài khoản"
                subtitle="Quản lý, kiểm soát các tài khoản hệ thống"
              >
                <AccountManagementPage />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/report-management"
          element={
            <ProtectedRoute requiredRole="ADMIN">
              <AppShell
                title="Quản lý báo cáo"
                subtitle="Xem xét và duyệt báo cáo từ cộng đồng"
              >
                <ReportManagementPage />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <AppShell
                title="Cài đặt"
                subtitle="Tuỳ chỉnh trải nghiệm và quyền riêng tư"
              >
                <SettingsPage />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/forum"
          element={
            <ProtectedRoute>
              <AppShell
                title="Diễn đàn"
                subtitle="Chia sẻ sự cố, thảo luận và hỗ trợ cộng đồng"
              >
                <ForumPage />
              </AppShell>
            </ProtectedRoute>
          }
        />

        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
      <BannedModal open={isBanned} onClose={() => setIsBanned(false)} />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <CurrentUserProvider>
        <AppContent />
      </CurrentUserProvider>
    </BrowserRouter>
  );
}
