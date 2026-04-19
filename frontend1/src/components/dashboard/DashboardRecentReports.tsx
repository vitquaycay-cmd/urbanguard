type RecentReport = {
  id: string;
  type: string;
  address: string;
  reporter: string;
  time: string;
  status: "approved" | "pending" | "rejected";
};

const reports: RecentReport[] = [
  {
    id: "#1842",
    type: "Ổ gà",
    address: "Đinh Tiên Hoàng, Q.1",
    reporter: "Nguyễn Văn A",
    time: "2 phút trước",
    status: "approved",
  },
  {
    id: "#1801",
    type: "Tai nạn",
    address: "Lê Văn Sỹ, Q.3",
    reporter: "Trần Thị B",
    time: "15 phút trước",
    status: "pending",
  },
  {
    id: "#1788",
    type: "Ngập",
    address: "Nguyễn Văn Linh, Q.7",
    reporter: "Lê Minh C",
    time: "1 giờ trước",
    status: "approved",
  },
];

function getStatusClass(status: RecentReport["status"]) {
  if (status === "approved") return "db-status db-status--green";
  if (status === "pending") return "db-status db-status--yellow";
  return "db-status db-status--red";
}

function getStatusLabel(status: RecentReport["status"]) {
  if (status === "approved") return "Đã duyệt";
  if (status === "pending") return "Chờ duyệt";
  return "Từ chối";
}

export default function DashboardRecentReports() {
  return (
    <section className="db-panel db-panel--reports">
      <div className="db-panel__header">
        <h3 className="db-panel__title">📋 Báo cáo gần đây</h3>
        <button className="db-link-btn" type="button">
          Xem tất cả →
        </button>
      </div>

      <div className="db-table">
        <div className="db-table__row db-table__row--head">
          <div>ID</div>
          <div>LOẠI</div>
          <div>ĐỊA CHỈ</div>
          <div>NGƯỜI BÁO</div>
          <div>THỜI GIAN</div>
          <div>TRẠNG THÁI</div>
        </div>

        {reports.map((report) => (
          <div className="db-table__row" key={report.id}>
            <div className="db-table__id">{report.id}</div>
            <div>{report.type}</div>
            <div>{report.address}</div>
            <div>{report.reporter}</div>
            <div>{report.time}</div>
            <div>
              <span className={getStatusClass(report.status)}>
                {getStatusLabel(report.status)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}