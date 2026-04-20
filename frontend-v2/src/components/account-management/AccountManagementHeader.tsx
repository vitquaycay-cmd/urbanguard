import { Plus } from "lucide-react";

type Stats = {
  totalUsers: number;
  activeUsers: number;
  bannedUsers: number;
};

type AccountManagementHeaderProps = {
  stats: Stats;
};

export default function AccountManagementHeader({
  stats,
}: AccountManagementHeaderProps) {
  const fmt = (n: number) => n.toLocaleString("vi-VN");

  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap gap-4">
        <div className="rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm">
          <p className="text-2xl font-bold text-gray-900">
            {fmt(stats.totalUsers)}
          </p>
          <p className="mt-0.5 text-xs text-gray-400">Tổng tài khoản</p>
          <span className="mt-1 inline-block text-xs font-bold text-green-600">
            —
          </span>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm">
          <p className="text-2xl font-bold text-gray-900">
            {fmt(stats.activeUsers)}
          </p>
          <p className="mt-0.5 text-xs text-gray-400">Đang hoạt động</p>
          <span className="mt-1 inline-block text-xs font-bold text-green-600">
            —
          </span>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm">
          <p className="text-2xl font-bold text-gray-900">
            {fmt(stats.bannedUsers)}
          </p>
          <p className="mt-0.5 text-xs text-gray-400">Bị khóa</p>
          <span className="mt-1 inline-block text-xs font-bold text-red-600">
            —
          </span>
        </div>
      </div>

      <button
        type="button"
        className="flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-700"
      >
        <Plus className="h-4 w-4" />
        Tạo tài khoản mới
      </button>
    </div>
  );
}
