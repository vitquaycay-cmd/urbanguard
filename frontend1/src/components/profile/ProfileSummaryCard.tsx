export default function ProfileSummaryCard() {
  return (
    <section className="pf-summary-card">
      <div className="pf-summary-left">
        <div className="pf-avatar">N</div>

        <div className="pf-user-info">
          <h2 className="pf-user-name">Nguyễn Văn An</h2>
          <p className="pf-user-meta">
            📧 nguyen.an@email.com · Thành viên từ 01/2025
          </p>

          <div className="pf-badges">
            <span className="pf-badge">🏆 Top Contributor</span>
            <span className="pf-badge">🎯 100 Báo cáo</span>
            <span className="pf-badge">⚡ Phản hồi nhanh</span>
            <span className="pf-badge">🌟 Độ chính xác cao</span>
          </div>
        </div>
      </div>

      <div className="pf-score-card">
        <div className="pf-score-number">847</div>
        <div className="pf-score-label">ĐIỂM UY TÍN</div>
      </div>
    </section>
  );
}