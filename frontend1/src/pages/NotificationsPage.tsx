import AppShell from "../components/layout/AppShell";
import NotificationsHeader from "../components/notifications/NotificationsHeader";
import NotificationsFilters from "../components/notifications/NotificationsFilters";
import NotificationsList from "../components/notifications/NotificationsList";
import "../styles/notifications.css";

export default function NotificationsPage() {
  return (
    <AppShell
      title="Thông báo"
      subtitle="Cập nhật hoạt động, cảnh báo và tương tác mới nhất"
    >
      <div className="nt-page">
        <NotificationsHeader />
        <NotificationsFilters />
        <NotificationsList />
      </div>
    </AppShell>
  );
}