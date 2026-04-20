import { Bell } from "lucide-react";

export default function NotificationsHeader() {
  return (
    <div className="mb-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Bell className="h-5 w-5 text-green-600" strokeWidth={2} aria-hidden />
        <h2 className="text-2xl font-bold text-gray-900">Thông báo</h2>
      </div>

      <div className="flex gap-2.5">
        <button
          type="button"
          className="rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
        >
          Đọc tất cả
        </button>
        <button
          type="button"
          className="rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-500 hover:bg-red-50"
        >
          Xóa tất cả
        </button>
      </div>
    </div>
  );
}
