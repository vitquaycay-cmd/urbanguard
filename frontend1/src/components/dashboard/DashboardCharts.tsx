type ActivityItem = {
  colorClass: string;
  text: string;
  time: string;
};

const activities: ActivityItem[] = [
  {
    colorClass: "db-activity__dot--red",
    text: "Báo cáo ổ gà tại Đinh Tiên Hoàng Q.1 được duyệt",
    time: "2 phút",
  },
  {
    colorClass: "db-activity__dot--orange",
    text: "Tai nạn mới tại Lê Văn Sỹ Q.3 cần xác nhận",
    time: "15 phút",
  },
  {
    colorClass: "db-activity__dot--blue",
    text: "Cảnh báo ngập tại Nguyễn Văn Linh Q.7",
    time: "1 giờ",
  },
  {
    colorClass: "db-activity__dot--green",
    text: "Bạn đạt huy hiệu 🏆 Top Contributor",
    time: "3 giờ",
  },
  {
    colorClass: "db-activity__dot--purple",
    text: "Thành viên mới Lê Thị B tham gia diễn đàn",
    time: "5 giờ",
  },
];

const bars = [
  { day: "T2", height: 52 },
  { day: "T3", height: 80 },
  { day: "T4", height: 62 },
  { day: "T5", height: 96 },
  { day: "T6", height: 70 },
  { day: "T7", height: 102 },
  { day: "CN", height: 82 },
];

export default function DashboardCharts() {
  return (
    <div className="db-middle-grid">
      <section className="db-panel">
        <div className="db-panel__header">
          <h3 className="db-panel__title">📊 Sự cố theo ngày</h3>
          <span className="db-panel__sub">7 ngày qua</span>
        </div>

        <div className="db-chart">
          {bars.map((bar) => (
            <div className="db-chart__item" key={bar.day}>
              <div className="db-chart__bar-wrap">
                <div
                  className="db-chart__bar"
                  style={{ height: `${bar.height}px` }}
                />
              </div>
              <div className="db-chart__label">{bar.day}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="db-panel">
        <div className="db-panel__header">
          <h3 className="db-panel__title">🔥 Hoạt động gần đây</h3>
        </div>

        <div className="db-activity">
          {activities.map((item, index) => (
            <div className="db-activity__row" key={index}>
              <div className={`db-activity__dot ${item.colorClass}`} />
              <div className="db-activity__text">{item.text}</div>
              <div className="db-activity__time">{item.time}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}