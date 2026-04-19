function Toggle({ checked = false }: { checked?: boolean }) {
  return (
    <button
      type="button"
      className={`st-toggle ${checked ? "st-toggle--on" : "st-toggle--off"}`}
      aria-pressed={checked}
    >
      <span className="st-toggle__thumb" />
    </button>
  );
}

function SettingRow({
  title,
  desc,
  checked,
}: {
  title: string;
  desc: string;
  checked: boolean;
}) {
  return (
    <div className="st-row">
      <div>
        <div className="st-row__title">{title}</div>
        <div className="st-row__desc">{desc}</div>
      </div>

      <Toggle checked={checked} />
    </div>
  );
}

export default function NotificationSettingsCard() {
  return (
    <section className="st-card">
      <h3 className="st-card__title">🔔 Thông báo</h3>

      <div className="st-card__body">
        <SettingRow
          title="Cảnh báo sự cố khẩn"
          desc="Nhận ngay khi có tai nạn hoặc ngập lụt gần bạn"
          checked={true}
        />

        <SettingRow
          title="Báo cáo được duyệt"
          desc="Khi admin phê duyệt báo cáo của bạn"
          checked={true}
        />

        <SettingRow
          title="Bình luận mới"
          desc="Khi có người bình luận vào bài của bạn"
          checked={true}
        />

        <SettingRow
          title="Email hàng tuần"
          desc="Tổng hợp sự cố trong khu vực mỗi tuần"
          checked={false}
        />

        <SettingRow
          title="Push notification"
          desc="Thông báo đẩy trên trình duyệt"
          checked={true}
        />
      </div>
    </section>
  );
}