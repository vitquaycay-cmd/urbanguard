import {
  Award,
  Bell,
  CheckCircle,
  Settings,
  TriangleAlert,
  XCircle,
} from "lucide-react";
import type { Notification } from "@/types/notifications";
import { markNotificationReadRequest } from "@/services/auth.api";

interface Props {
  notifications: Notification[];
  loading: boolean;
  onUpdate: () => void;
}

function getIconConfig(type: string, title: string) {
  if (type === "AREA_ALERT") {
    return {
      icon: <TriangleAlert size={18} className="text-orange-500" />,
      bg: "bg-orange-100",
    };
  }
  if (type === "SYSTEM") {
    return {
      icon: <Settings size={18} className="text-blue-500" />,
      bg: "bg-blue-100",
    };
  }
  if (title.includes("duyệt") || title.includes("xác nhận")) {
    return {
      icon: <CheckCircle size={18} className="text-green-500" />,
      bg: "bg-green-100",
    };
  }
  if (title.includes("từ chối")) {
    return {
      icon: <XCircle size={18} className="text-red-500" />,
      bg: "bg-red-100",
    };
  }
  if (title.includes("huy hiệu")) {
    return {
      icon: <Award size={18} className="text-purple-500" />,
      bg: "bg-purple-100",
    };
  }
  return {
    icon: <Bell size={18} className="text-gray-500" />,
    bg: "bg-gray-100",
  };
}

export default function NotificationsList({
  notifications,
  loading,
  onUpdate,
}: Props) {
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-600 border-t-transparent" />
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="py-12 text-center text-gray-400">
        <Bell size={40} className="mx-auto mb-3 opacity-30" aria-hidden />
        <p className="text-sm">Không có thông báo nào</p>
      </div>
    );
  }

  async function handleClick(id: number, readAt: string | null) {
    if (!readAt) {
      await markNotificationReadRequest(id);
      onUpdate();
    }
  }

  return (
    <div>
      {notifications.map((notif) => {
        const { icon, bg } = getIconConfig(notif.type, notif.title);
        const timeAgo = new Date(notif.createdAt).toLocaleString("vi-VN");
        return (
          <div
            key={notif.id}
            role="button"
            tabIndex={0}
            onClick={() => void handleClick(notif.id, notif.readAt)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                void handleClick(notif.id, notif.readAt);
              }
            }}
            className={`mb-3 flex cursor-pointer items-start gap-4 rounded-2xl border p-4 shadow-sm transition-shadow hover:shadow-md ${
              !notif.readAt
                ? "border-green-100 bg-green-50/30"
                : "border-gray-100 bg-white"
            }`}
          >
            <div
              className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${bg}`}
            >
              {icon}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-gray-900">
                {notif.title}
              </div>
              <div className="mt-0.5 text-xs text-gray-500">{notif.body}</div>
              <div className="mt-1 text-xs text-gray-400">{timeAgo}</div>
            </div>
            {!notif.readAt ? (
              <div
                className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-green-500"
                aria-hidden
              />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
