import { useState } from "react";
import { Bell } from "lucide-react";
import ToggleSwitch from "@/components/settings/ToggleSwitch";

function SettingRow({
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

export default function NotificationSettingsCard() {
  const [urgent, setUrgent] = useState(true);
  const [approved, setApproved] = useState(true);
  const [comments, setComments] = useState(true);
  const [weeklyEmail, setWeeklyEmail] = useState(false);
  const [push, setPush] = useState(true);

  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100">
          <Bell className="h-4 w-4 text-green-600" />
        </div>
        <h3 className="text-base font-bold text-gray-900">Thông báo</h3>
      </div>

      <div>
        <SettingRow
          title="Cảnh báo sự cố khẩn"
          desc="Nhận ngay khi có tai nạn hoặc ngập lụt gần bạn"
          checked={urgent}
          onChange={setUrgent}
        />
        <SettingRow
          title="Báo cáo được duyệt"
          desc="Khi admin phê duyệt báo cáo của bạn"
          checked={approved}
          onChange={setApproved}
        />
        <SettingRow
          title="Bình luận mới"
          desc="Khi có người bình luận vào bài của bạn"
          checked={comments}
          onChange={setComments}
        />
        <SettingRow
          title="Email hàng tuần"
          desc="Tổng hợp sự cố trong khu vực mỗi tuần"
          checked={weeklyEmail}
          onChange={setWeeklyEmail}
        />
        <SettingRow
          title="Push notification"
          desc="Thông báo đẩy trên trình duyệt"
          checked={push}
          onChange={setPush}
        />
      </div>
    </section>
  );
}
