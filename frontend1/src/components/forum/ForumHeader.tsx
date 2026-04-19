export default function ForumHeader() {
  return (
    <div className="fm-header">
      <div className="fm-header__title-wrap">
        <div className="fm-header__icon">💬</div>
        <h2 className="fm-header__title">Diễn đàn cộng đồng</h2>
      </div>

      <button className="fm-create-btn" type="button">
        + Tạo bài viết
      </button>
    </div>
  );
}