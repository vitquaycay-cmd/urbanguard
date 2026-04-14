import { Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import MapPage from "./pages/MapPage";
import ReportPage from "./pages/ReportPage";
import AccountManagementPage from "./pages/AccountManagementPage";
import ProfilePage from "./pages/ProfilePage";
import ReportManagementPage from "./pages/ReportManagementPage";
import SettingsPage from "./pages/SettingsPage";  
import NotificationsPage from "./pages/NotificationsPage";
import ForumPage from "./pages/ForumPage";
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/map" element={<MapPage />} />
      <Route path="/report" element={<ReportPage />} />

      <Route path="*" element={<Navigate to="/" />} />
      <Route path="/account-management" element={<AccountManagementPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/report-management" element={<ReportManagementPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/notifications" element={<NotificationsPage />} />
      <Route path="/forum" element={<ForumPage />} />
    </Routes>
  );
}