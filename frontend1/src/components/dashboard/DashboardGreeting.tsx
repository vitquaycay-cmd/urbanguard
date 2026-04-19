export default function DashboardGreeting() {
  return (
    <div className="db-greeting">
      <div>
        <h2 className="db-greeting__title">Chào buổi sáng, An 👋</h2>
        <p className="db-greeting__subtitle">
          Hôm nay có <span>7 sự cố mới</span> trong khu vực · Thứ Ba 14/04/2026
        </p>
      </div>

      <button className="db-greeting__button" type="button">
        + Báo cáo mới
      </button>
    </div>
  );
}