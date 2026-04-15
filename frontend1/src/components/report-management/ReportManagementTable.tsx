type ReportRow = {
  id: string;
  content: string;
  reporter: string;
  incident: string;
  time: string;
  action: "update" | "pause";
};

const reports: ReportRow[] = [
  {
    id: "#0021",
    content: "Đèn báo bịt rẽ mười tốc thăng",
    reporter: "Nguyễn Văn A",
    incident: "Đèn giao thông",
    time: "22/04/2024",
    action: "update",
  },
  {
    id: "#0025",
    content: "Xê sô ú cộ cực cú phán xế",
    reporter: "Nguyễn Thị B",
    incident: "Đậu xe trái phép",
    time: "20/04/2024",
    action: "update",
  },
  {
    id: "#0023",
    content: "Vượt đèn tệp vựợn đèn đỏ",
    reporter: "Trần Minh C",
    incident: "Đèn giao thông",
    time: "20/04/2024",
    action: "pause",
  },
  {
    id: "#0023",
    content: "Thỉ Xe tìcư nhựột ủn đỏ",
    reporter: "Lê C.",
    incident: "Đèn giao thông",
    time: "20/04/2024",
    action: "update",
  },
  {
    id: "#0023",
    content: "Vượt đèn đỏ",
    reporter: "Nguyễn An",
    incident: "Đậu xe trái phép",
    time: "19/04/2024",
    action: "pause",
  },
  {
    id: "#0021",
    content: "Vượt đèn đỏ",
    reporter: "Lê C.",
    incident: "Đèn giao thông",
    time: "19/04/2024",
    action: "update",
  },
  {
    id: "#0016",
    content: "Vượt đèn đỏ",
    reporter: "Hoàng D",
    incident: "Đèn giao thông",
    time: "19/04/2024",
    action: "pause",
  },
];

function getActionClass(action: ReportRow["action"]) {
  return action === "update"
    ? "rm-btn rm-btn--update"
    : "rm-btn rm-btn--pause";
}

function getActionText(action: ReportRow["action"]) {
  return action === "update" ? "✓ Cập nhật" : "✕ Tạm dừng";
}

export default function ReportManagementTable() {
  return (
    <div className="rm-table-card">
      <div className="rm-table">
        <div className="rm-table__row rm-table__row--head">
          <div>ID</div>
          <div>NỘI DUNG</div>
          <div>NGƯỜI BÁO CÁO</div>
          <div>SỰ CỐ</div>
          <div>THỜI GIAN</div>
          <div>HÀNH ĐỘNG</div>
        </div>

        {reports.map((report, index) => (
          <div className="rm-table__row" key={`${report.id}-${index}`}>
            <div className="rm-id">{report.id}</div>
            <div className="rm-content">{report.content}</div>
            <div>{report.reporter}</div>
            <div>{report.incident}</div>
            <div>{report.time}</div>
            <div>
              <button className={getActionClass(report.action)}>
                {getActionText(report.action)}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}