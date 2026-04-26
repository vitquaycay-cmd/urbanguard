import { useState } from "react";
import { Lock } from "lucide-react";
import ToggleSwitch from "@/components/settings/ToggleSwitch";

function PrivacyRow({
  title,
  desc,
  checked,
  onChange,
}: {
  title: string;
  desc: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between border-b border-gray-50 py-3 last:border-0">
      <div>
        <div className="text-sm font-medium text-gray-900">{title}</div>
        <div className="mt-0.5 text-xs text-gray-400">{desc}</div>
      </div>
      <ToggleSwitch checked={checked} onChange={onChange} />
    </div>
  );
}

export default function PrivacySettingsCard() {
  const [publicProfile, setPublicProfile] = useState(true);
  const [showLocation, setShowLocation] = useState(false);
  const [saveSearchHistory, setSaveSearchHistory] = useState(true);

  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100">
          <Lock className="h-4 w-4 text-orange-600" />
        </div>
        <h3 className="text-base font-bold text-gray-900">Quyền riêng tư</h3>
      </div>

      <div>
        <PrivacyRow
          title="Hồ sơ công khai"
          desc="Cho phép mọi người xem hồ sơ của bạn"
          checked={publicProfile}
          onChange={setPublicProfile}
        />
        <PrivacyRow
          title="Hiển thị vị trí"
          desc="Hiển thị vị trí gần đúng trong hồ sơ"
          checked={showLocation}
          onChange={setShowLocation}
        />
        <PrivacyRow
          title="Lưu lịch sử tìm kiếm"
          desc="Ghi nhớ các tìm kiếm để gợi ý"
          checked={saveSearchHistory}
          onChange={setSaveSearchHistory}
        />
      </div>
    </section>
  );
}
