export default function NotificationsHeader() {
  return (
    <div className="nt-header">
      <div className="nt-header__title-wrap">
        <div className="nt-header__icon">🔔</div>
        <h2 className="nt-header__title">Thông báo</h2>
      </div>

      <div className="nt-header__actions">
        <button className="nt-header__btn nt-header__btn--primary" type="button">
          Đọc tất cả
        </button>
        <button className="nt-header__btn" type="button">
          Xóa tất cả
        </button>
      </div>
    </div>
  );
}