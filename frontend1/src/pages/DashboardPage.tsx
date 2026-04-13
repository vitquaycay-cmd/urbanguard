import AppShell from "../components/layout/AppShell";

export default function DashboardPage() {
  return (
    <AppShell
      title="Dashboard"
      subtitle="Tổng quan hệ thống UrbanGuard"
    >
      <div style={{ background: "#fff", padding: "24px", borderRadius: "24px", border: "1px solid #dbeadf" }}>
        Nội dung dashboard overview sẽ nằm ở đây.
      </div>
    </AppShell>
  );
}