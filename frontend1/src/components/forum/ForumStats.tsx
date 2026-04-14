export default function ForumStats() {
  return (
    <div className="fm-stats-card">
      <div className="fm-stats">
        <div className="fm-stat">
          <div className="fm-stat__icon">📝</div>
          <div>
            <div className="fm-stat__value">1,248</div>
            <div className="fm-stat__label">Bài viết</div>
          </div>
        </div>

        <div className="fm-stat">
          <div className="fm-stat__icon">👥</div>
          <div>
            <div className="fm-stat__value">3,847</div>
            <div className="fm-stat__label">Thành viên</div>
          </div>
        </div>

        <div className="fm-stat">
          <div className="fm-stat__icon">💬</div>
          <div>
            <div className="fm-stat__value">12,691</div>
            <div className="fm-stat__label">Bình luận</div>
          </div>
        </div>
      </div>

      <div className="fm-online">
        <span className="fm-online__dot" />
        <span>247 online</span>
      </div>
    </div>
  );
}