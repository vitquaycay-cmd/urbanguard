import { useEffect, useState } from "react";
import ProfileSummaryCard from "@/components/profile/ProfileSummaryCard";
import ProfileReportHistory from "@/components/profile/ProfileReportHistory";
import { getMeRequest, type MeUser } from "@/services/auth.api";

export default function ProfilePage() {
  const [user, setUser] = useState<MeUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const u = await getMeRequest();
        if (!cancelled) {
          setUser(u);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setUser(null);
          setError(
            e instanceof Error ? e.message : "Không thể lấy thông tin user",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex w-full flex-col gap-6">
      <ProfileSummaryCard user={user} loading={loading} error={error} />
      <ProfileReportHistory />
    </div>
  );
}
