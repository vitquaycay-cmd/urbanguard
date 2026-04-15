import AppShell from "../components/layout/AppShell";
import ProfileSummaryCard from "../components/profile/ProfileSummaryCard";
import ProfileReportHistory from "../components/profile/ProfileReportHistory";
import "../styles/profile.css";

export default function ProfilePage() {
  return (
    <AppShell
      title="Hồ sơ"
      subtitle="Thông tin cá nhân và lịch sử báo cáo"
    >
      <div className="pf-page">
        <ProfileSummaryCard />
        <ProfileReportHistory />
      </div>
    </AppShell>
  );
}