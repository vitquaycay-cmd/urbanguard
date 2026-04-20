import SettingsHeader from "@/components/settings/SettingsHeader";
import NotificationSettingsCard from "@/components/settings/NotificationSettingsCard";
import MapPrivacySettingsCard from "@/components/settings/MapPrivacySettingsCard";
import AppearanceSettingsCard from "@/components/settings/AppearanceSettingsCard";
import PrivacySettingsCard from "@/components/settings/PrivacySettingsCard";

export default function SettingsPage() {
  return (
    <div className="w-full">
      <SettingsHeader />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-6">
          <NotificationSettingsCard />
          <MapPrivacySettingsCard />
        </div>

        <div className="flex flex-col gap-6">
          <AppearanceSettingsCard />
          <PrivacySettingsCard />
        </div>
      </div>
    </div>
  );
}
