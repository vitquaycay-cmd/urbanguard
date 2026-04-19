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

export default function MapPrivacySettingsCard() {
  return (
    <section className="st-card">
      <h3 className="st-card__title">🗺️ Bản đồ & Vị trí</h3>

      <div className="st-card__body">
        <div className="st-row">
          <div>
            <div className="st-row__title">Chia sẻ vị trí</div>
            <div className="st-row__desc">
              Cho phép ứng dụng dùng GPS của bạn
            </div>
          </div>

          <Toggle checked={true} />
        </div>

        <div className="st-row st-row--slider">
          <div>
            <div className="st-row__title">Bán kính cảnh báo</div>
            <div className="st-row__desc">
              Nhận cảnh báo trong phạm vi bao nhiêu km
            </div>
          </div>

          <div className="st-slider-wrap">
            <input
              className="st-slider"
              type="range"
              min="1"
              max="10"
              value="5"
              readOnly
            />
            <div className="st-slider-value">5 km</div>
          </div>
        </div>
      </div>
    </section>
  );
}