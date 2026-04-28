import { Bell } from "lucide-react";

interface Props {
  onMarkAllRead: () => void;
  onDeleteAll: () => void;
}

export default function NotificationsHeader({
  onMarkAllRead,
  onDeleteAll,
}: Props) {
  return (
    <div className="mb-6 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Bell size={20} className="text-green-600" aria-hidden />
        <h1 className="text-2xl font-bold text-gray-900">Thông báo</h1>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onMarkAllRead}
          className="rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
        >
          Đọc tất cả
        </button>
        <button
          type="button"
          onClick={onDeleteAll}
          className="rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-500 hover:bg-red-50"
        >
          Xóa tất cả
        </button>
      </div>
    </div>
  );
}
