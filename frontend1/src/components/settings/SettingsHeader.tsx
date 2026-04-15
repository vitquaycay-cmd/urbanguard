export default function SettingsHeader() {
  return (
    <div className="st-header">
      <div className="st-header__title-wrap">
        <div className="st-header__icon">⚙️</div>
        <h2 className="st-header__title">Cài đặt</h2>
      </div>

      <button className="st-save-btn" type="button">
        Lưu tất cả
      </button>
    </div>
  );
}