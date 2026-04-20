import { Mail } from "lucide-react";
import type { MeUser } from "@/services/auth.api";

function displayName(user: MeUser): string {
  if (user.fullname?.trim()) return user.fullname.trim();
  if (user.username?.trim()) return user.username.trim();
  const local = user.email.split("@")[0];
  return local || user.email;
}

function avatarLetter(user: MeUser): string {
  if (user.fullname?.trim()) {
    return user.fullname.trim().charAt(0).toUpperCase();
  }
  return user.email.charAt(0).toUpperCase();
}

function formatJoinDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `Thành viên từ ${month}/${d.getFullYear()}`;
}

type ProfileSummaryCardProps = {
  user: MeUser | null;
  loading: boolean;
  error: string | null;
};

export default function ProfileSummaryCard({
  user,
  loading,
  error,
}: ProfileSummaryCardProps) {
  const name = user ? displayName(user) : "";
  const initial = user ? avatarLetter(user) : "?";

  return (
    <section className="mb-6 flex flex-col gap-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
      <div className="flex min-w-0 flex-1 items-center gap-6">
        <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-full bg-green-600 text-3xl font-bold text-white">
          {loading ? (
            <span className="inline-block h-8 w-8 animate-pulse rounded bg-white/30" />
          ) : (
            initial
          )}
        </div>

        <div className="min-w-0 flex-1">
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
          <h2 className="text-2xl font-bold text-gray-900">
            {loading ? (
              <span className="inline-block h-8 w-48 animate-pulse rounded bg-gray-200" />
            ) : user ? (
              name
            ) : (
              "—"
            )}
          </h2>

          {!loading && user && (
            <>
              <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                <Mail size={14} className="flex-shrink-0 text-gray-400" />
                <span className="truncate">{user.email}</span>
              </p>
              {user.username?.trim() && (
                <p className="mt-0.5 text-sm text-gray-400">
                  @{user.username.trim()}
                </p>
              )}
              {user.createdAt && (
                <p className="mt-1 text-xs text-gray-400">
                  {formatJoinDate(user.createdAt)}
                </p>
              )}

              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                  🏆 Top Contributor
                </span>
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                  🎯 100 Báo cáo
                </span>
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                  ⚡ Phản hồi nhanh
                </span>
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                  🌟 Độ chính xác cao
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="min-w-[140px] flex-shrink-0 rounded-2xl border border-green-100 bg-green-50 p-4 text-center">
        <div className="text-4xl font-bold text-green-600">
          {loading ? (
            <span className="inline-block h-10 w-16 animate-pulse rounded bg-green-200/60" />
          ) : user ? (
            user.reputationScore
          ) : (
            "—"
          )}
        </div>
        <div className="mt-1 text-xs font-medium uppercase tracking-wide text-gray-500">
          ĐIỂM UY TÍN
        </div>
      </div>
    </section>
  );
}
