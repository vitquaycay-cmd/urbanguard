import type { NotifType } from "@/types/notifications";

interface Props {
  activeTab: NotifType;
  setActiveTab: (tab: NotifType) => void;
  totalCount: number;
  unreadCount: number;
}

const tabs: { key: NotifType; label: string }[] = [
  { key: "ALL", label: "Tất cả" },
  { key: "UNREAD", label: "Chưa đọc" },
  { key: "REPORT_UPDATE", label: "Báo cáo" },
  { key: "SYSTEM", label: "Hệ thống" },
  { key: "AREA_ALERT", label: "Cộng đồng" },
];

export default function NotificationsFilters({
  activeTab,
  setActiveTab,
  totalCount,
  unreadCount,
}: Props) {
  return (
    <div className="mb-6 flex flex-wrap gap-2">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => setActiveTab(tab.key)}
          className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
            activeTab === tab.key
              ? "bg-green-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          {tab.label}
          {tab.key === "ALL" && totalCount > 0 && ` (${totalCount})`}
          {tab.key === "UNREAD" && unreadCount > 0 && ` (${unreadCount})`}
        </button>
      ))}
    </div>
  );
}
