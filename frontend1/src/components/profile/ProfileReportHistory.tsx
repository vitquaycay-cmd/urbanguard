type HistoryRow = {
  id: string;
  type: "pothole" | "accident" | "flood";
  address: string;
  date: string;
  status: "approved" | "pending" | "rejected";
};

const reportHistory: HistoryRow[] = [
  {
    id: "#1842",
    type: "pothole",
    address: "Đinh Tiên Hoàng, Q.1",
    date: "22/03/2026",
    status: "approved",
  },
  {
    id: "#1801",
    type: "accident",
    address: "Lê Văn Sỹ, Q.3",
    date: "18/03/2026",
    status: "approved",
  },
  {
    id: "#1788",
    type: "flood",
    address: "Nguyễn Văn Linh, Q.7",
    date: "15/03/2026",
    status: "pending",
  },
  {
    id: "#1755",
    type: "pothole",
    address: "Trường Chinh, Tân Bình",
    date: "10/03/2026",
    status: "rejected",
  },
  {
    id: "#1720",
    type: "accident",
    address: "Cộng Hòa, Tân Bình",
    date: "05/03/2026",
    status: "approved",
  },
];

function getTypeLabel(type: HistoryRow["type"]) {
  switch (type) {
    case "pothole":
      return "Ổ gà";
    case "accident":
      return "Tai nạn";
    case "flood":
      return "Ngập";
    default:
      return "";
  }
}

function getTypeClass(type: HistoryRow["type"]) {
  switch (type) {
    case "pothole":
      return "pf-tag pf-tag--red";
    case "accident":
      return "pf-tag pf-tag--orange";
    case "flood":
      return "pf-tag pf-tag--blue";
    default:
      return "pf-tag";
  }
}

function getStatusLabel(status: HistoryRow["status"]) {
  switch (status) {
    case "approved":
      return "✓ Đã duyệt";
    case "pending":
      return "⏳ Chờ duyệt";
    case "rejected":
      return "✗ Từ chối";
    default:
      return "";
  }
}

function getStatusClass(status: HistoryRow["status"]) {
  switch (status) {
    case "approved":
      return "pf-status pf-status--green";
    case "pending":
      return "pf-status pf-status--yellow";
    case "rejected":
      return "pf-status pf-status--red";
    default:
      return "pf-status";
  }
}

export default function ProfileReportHistory() {
  return (
    <section className="pf-history-card">
      <div className="pf-history-header">
        <h3 className="pf-history-title">📋 Lịch sử báo cáo</h3>
      </div>

      <div className="pf-table">
        <div className="pf-table__row pf-table__row--head">
          <div>ID</div>
          <div>LOẠI</div>
          <div>ĐỊA CHỈ</div>
          <div>NGÀY</div>
          <div>TRẠNG THÁI</div>
        </div>

        {reportHistory.map((item) => (
          <div className="pf-table__row" key={item.id}>
            <div className="pf-table__id">{item.id}</div>
            <div>
              <span className={getTypeClass(item.type)}>
                {getTypeLabel(item.type)}
              </span>
            </div>
            <div>{item.address}</div>
            <div>{item.date}</div>
            <div>
              <span className={getStatusClass(item.status)}>
                {getStatusLabel(item.status)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}