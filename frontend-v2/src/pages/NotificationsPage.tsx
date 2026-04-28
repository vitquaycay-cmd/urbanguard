import { useCallback, useEffect, useState } from "react";
import {
  deleteAllNotificationsRequest,
  getNotificationsRequest,
  markAllReadRequest,
} from "@/services/auth.api";
import NotificationsHeader from "@/components/notifications/NotificationsHeader";
import NotificationsFilters from "@/components/notifications/NotificationsFilters";
import NotificationsList from "@/components/notifications/NotificationsList";
import type { NotifType, Notification } from "@/types/notifications";

export type { NotifType, Notification } from "@/types/notifications";

function normalizeNotificationsList(data: unknown): Notification[] {
  if (Array.isArray(data)) {
    return data as Notification[];
  }
  if (
    data &&
    typeof data === "object" &&
    "data" in data &&
    Array.isArray((data as { data: unknown }).data)
  ) {
    return (data as { data: Notification[] }).data;
  }
  return [];
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState<NotifType>("ALL");
  const [loading, setLoading] = useState(true);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getNotificationsRequest();
      setNotifications(normalizeNotificationsList(data));
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadNotifications();
  }, [loadNotifications]);

  async function handleMarkAllRead() {
    await markAllReadRequest();
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, readAt: new Date().toISOString() })),
    );
  }

  async function handleDeleteAll() {
    await deleteAllNotificationsRequest();
    setNotifications([]);
  }

  const filtered = notifications.filter((n) => {
    if (activeTab === "UNREAD") return !n.readAt;
    if (activeTab === "REPORT_UPDATE") return n.type === "REPORT_UPDATE";
    if (activeTab === "SYSTEM") return n.type === "SYSTEM";
    if (activeTab === "AREA_ALERT") return n.type === "AREA_ALERT";
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.readAt).length;

  return (
    <div className="mx-auto max-w-4xl">
      <NotificationsHeader
        onMarkAllRead={handleMarkAllRead}
        onDeleteAll={handleDeleteAll}
      />
      <NotificationsFilters
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        totalCount={notifications.length}
        unreadCount={unreadCount}
      />
      <NotificationsList
        notifications={filtered}
        loading={loading}
        onUpdate={loadNotifications}
      />
    </div>
  );
}
