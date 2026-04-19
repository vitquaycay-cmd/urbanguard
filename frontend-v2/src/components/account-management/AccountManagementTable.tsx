import { Lock, Pencil, Unlock } from "lucide-react";
import type { AdminUserRow } from "@/services/user.api";

type AccountManagementTableProps = {
  users: AdminUserRow[];
  loading: boolean;
  handleBan: (userId: number, currentBanned: boolean) => void | Promise<void>;
  page: number;
  setPage: (p: number) => void;
  total: number;
  totalPages: number;
  limit: number;
};

function displayName(u: AdminUserRow): string {
  if (u.fullname?.trim()) return u.fullname.trim();
  if (u.username?.trim()) return u.username.trim();
  const local = u.email.split("@")[0];
  return local || u.email;
}

function nameInitial(u: AdminUserRow): string {
  const n = displayName(u);
  return n ? n.charAt(0).toUpperCase() : "?";
}

function roleLabel(role: string): string {
  if (role === "ADMIN") return "Ban quản lí";
  if (role === "USER") return "Người dân";
  return role;
}

function roleBadgeClass(role: string): string {
  if (role === "ADMIN") {
    return "rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-semibold text-purple-700";
  }
  if (role === "MODERATOR") {
    return "rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700";
  }
  return "rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-600";
}

function getStatusText(isBanned: boolean) {
  return isBanned ? "Bị khóa" : "Hoạt động";
}

export default function AccountManagementTable({
  users,
  loading,
  handleBan,
  page,
  setPage,
  total,
  totalPages,
  limit,
}: AccountManagementTableProps) {
  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] border-collapse text-left">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 text-xs font-bold uppercase tracking-wide text-gray-400">
              <th className="whitespace-nowrap px-4 py-3">ID</th>
              <th className="whitespace-nowrap px-4 py-3">Tên</th>
              <th className="whitespace-nowrap px-4 py-3">Email</th>
              <th className="whitespace-nowrap px-4 py-3">Vai trò</th>
              <th className="whitespace-nowrap px-4 py-3">Tình trạng</th>
              <th className="whitespace-nowrap px-4 py-3">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} className="py-16">
                  <div className="flex justify-center">
                    <div className="h-10 w-10 animate-spin rounded-full border-2 border-green-600 border-t-transparent" />
                  </div>
                </td>
              </tr>
            )}
            {!loading &&
              users.map((account) => (
                <tr
                  key={account.id}
                  className="border-b border-gray-50 transition-colors last:border-b-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-4 align-middle text-sm font-bold text-green-600">
                    #{account.id}
                  </td>
                  <td className="px-4 py-4 align-middle">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-700">
                        {nameInitial(account)}
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {displayName(account)}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 align-middle text-sm text-gray-600">
                    {account.email}
                  </td>
                  <td className="px-4 py-4 align-middle">
                    <span className={roleBadgeClass(account.role)}>
                      {roleLabel(account.role)}
                    </span>
                  </td>
                  <td className="px-4 py-4 align-middle">
                    {!account.isBanned ? (
                      <span className="flex items-center gap-1 text-sm font-semibold text-green-600">
                        <span className="h-2 w-2 rounded-full bg-green-500" />
                        {getStatusText(account.isBanned)}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-sm font-semibold text-red-500">
                        <span className="h-2 w-2 rounded-full bg-red-500" />
                        {getStatusText(account.isBanned)}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4 align-middle">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="rounded-lg border border-gray-200 p-1.5 text-gray-500 transition-colors hover:bg-gray-50"
                        aria-label="Chỉnh sửa"
                      >
                        <Pencil className="h-3.5 w-3.5" strokeWidth={2} />
                      </button>
                      {!account.isBanned ? (
                        <button
                          type="button"
                          className="rounded-lg border border-red-200 p-1.5 text-red-500 transition-colors hover:bg-red-50"
                          aria-label="Khóa tài khoản"
                          onClick={() =>
                            void handleBan(account.id, account.isBanned)
                          }
                        >
                          <Lock className="h-3.5 w-3.5" strokeWidth={2} />
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="rounded-lg border border-green-200 p-1.5 text-green-500 transition-colors hover:bg-green-50"
                          aria-label="Mở khóa"
                          onClick={() =>
                            void handleBan(account.id, account.isBanned)
                          }
                        >
                          <Unlock className="h-3.5 w-3.5" strokeWidth={2} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            {!loading && users.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="py-12 text-center text-sm text-gray-500"
                >
                  Không có người dùng phù hợp bộ lọc.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 px-4 pb-4 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-400">
          Hiển thị {start}-{end} trong {total.toLocaleString("vi-VN")} người
          dùng
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-500">
            Trang {page} / {Math.max(totalPages, 1)}
          </span>
          <button
            type="button"
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40"
            disabled={page <= 1 || loading}
            onClick={() => setPage(page - 1)}
          >
            ‹ Trước
          </button>
          <button
            type="button"
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40"
            disabled={page >= totalPages || totalPages === 0 || loading}
            onClick={() => setPage(page + 1)}
          >
            Sau ›
          </button>
        </div>
      </div>
    </div>
  );
}
