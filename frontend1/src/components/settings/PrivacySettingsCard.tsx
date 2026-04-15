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

function PrivacyRow({
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

export default function PrivacySettingsCard() {
  return (
    <section className="st-card">
      <h3 className="st-card__title">🔐 Quyền riêng tư</h3>

      <div className="st-card__body">
        <PrivacyRow
          title="Hồ sơ công khai"
          desc="Cho phép mọi người xem hồ sơ của bạn"
          checked={true}
        />

        <PrivacyRow
          title="Hiển thị vị trí"
          desc="Hiển thị vị trí gần đúng trong hồ sơ"
          checked={false}
        />

        <PrivacyRow
          title="Lưu lịch sử tìm kiếm"
          desc="Ghi nhớ các tìm kiếm để gợi ý"
          checked={true}
        />
      </div>
    </section>
  );
}