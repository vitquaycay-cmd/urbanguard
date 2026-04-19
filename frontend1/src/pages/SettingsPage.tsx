import AppShell from "../components/layout/AppShell";
import SettingsHeader from "../components/settings/SettingsHeader";
import NotificationSettingsCard from "../components/settings/NotificationSettingsCard";
import AppearanceSettingsCard from "../components/settings/AppearanceSettingsCard";
import MapPrivacySettingsCard from "../components/settings/MapPrivacySettingsCard";
import PrivacySettingsCard from "../components/settings/PrivacySettingsCard";
import "../styles/settings.css";

export default function SettingsPage() {
  return (
    <AppShell
      title="Cài đặt"
      subtitle="Tùy chỉnh trải nghiệm và quyền riêng tư của bạn"
    >
      <div className="st-page">
        <SettingsHeader />

        <div className="st-grid">
          <div className="st-column">
            <NotificationSettingsCard />
            <MapPrivacySettingsCard />
          </div>

          <div className="st-column">
            <AppearanceSettingsCard />
            <PrivacySettingsCard />
          </div>
        </div>
      </div>
    </AppShell>
  );
}