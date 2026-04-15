import AppShell from "../components/layout/AppShell";
import DashboardGreeting from "../components/dashboard/DashboardGreeting";
import DashboardStats from "../components/dashboard/DashboardStats";
import DashboardCharts from "../components/dashboard/DashboardCharts";
import DashboardRecentReports from "../components/dashboard/DashboardRecentReports";
import "../styles/dashboard.css";

export default function DashboardPage() {
  return (
    <AppShell
      title="Dashboard"
      subtitle="Tổng quan hệ thống UrbanGuard"
    >
      <div className="db-page">
        <DashboardGreeting />
        <DashboardStats />
        <DashboardCharts />
        <DashboardRecentReports />
      </div>
    </AppShell>
  );
}