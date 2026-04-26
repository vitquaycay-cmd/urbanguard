import NotificationsHeader from "@/components/notifications/NotificationsHeader";
import NotificationsFilters from "@/components/notifications/NotificationsFilters";
import NotificationsList from "@/components/notifications/NotificationsList";

export default function NotificationsPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <NotificationsHeader />
      <NotificationsFilters />
      <NotificationsList />
    </div>
  );
}
