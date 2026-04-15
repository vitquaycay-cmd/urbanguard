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

function SelectRow({
  title,
  desc,
  value,
}: {
  title: string;
  desc: string;
  value: string;
}) {
  return (
    <div className="st-row">
      <div>
        <div className="st-row__title">{title}</div>
        <div className="st-row__desc">{desc}</div>
      </div>

      <select className="st-select">
        <option>{value}</option>
      </select>
    </div>
  );
}

export default function AppearanceSettingsCard() {
  return (
    <section className="st-card">
      <h3 className="st-card__title">🎨 Giao diện</h3>

      <div className="st-card__body">
        <SelectRow
          title="Chủ đề màu sắc"
          desc="Giao diện sáng hoặc tối"
          value="🌞 Sáng"
        />

        <SelectRow
          title="Ngôn ngữ"
          desc="Ngôn ngữ hiển thị ứng dụng"
          value="VN Tiếng Việt"
        />

        <SelectRow
          title="Cỡ chữ"
          desc="Điều chỉnh kích thước văn bản"
          value="Vừa"
        />

        <div className="st-row">
          <div>
            <div className="st-row__title">Hiệu ứng động</div>
            <div className="st-row__desc">Animation và transition trong app</div>
          </div>

          <Toggle checked={true} />
        </div>
      </div>
    </section>
  );
}