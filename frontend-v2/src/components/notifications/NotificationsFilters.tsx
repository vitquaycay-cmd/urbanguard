export default function NotificationsFilters() {
  return (
    <div className="mb-6 flex flex-wrap gap-2">
      <button
        type="button"
        className="rounded-full bg-green-600 px-4 py-1.5 text-sm font-semibold text-white"
      >
        Tất cả (18)
      </button>
      <button
        type="button"
        className="rounded-full bg-gray-100 px-4 py-1.5 text-sm font-semibold text-gray-600 hover:bg-gray-200"
      >
        Chưa đọc (3)
      </button>
      <button
        type="button"
        className="rounded-full bg-gray-100 px-4 py-1.5 text-sm font-semibold text-gray-600 hover:bg-gray-200"
      >
        Báo cáo
      </button>
      <button
        type="button"
        className="rounded-full bg-gray-100 px-4 py-1.5 text-sm font-semibold text-gray-600 hover:bg-gray-200"
      >
        Hệ thống
      </button>
      <button
        type="button"
        className="rounded-full bg-gray-100 px-4 py-1.5 text-sm font-semibold text-gray-600 hover:bg-gray-200"
      >
        Cộng đồng
      </button>
    </div>
  );
}
