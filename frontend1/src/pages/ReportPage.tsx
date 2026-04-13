import AppShell from "../components/layout/AppShell";
import ReportForm from "../components/report/ReportForm";
import ReportLocationMap from "../components/report/ReportLocationMap";
import "../styles/report.css";

function ReportRightPanel() {
  return (
    <>
      <ReportLocationMap />

      <div className="report-side-card">
        <h3 className="report-side-card-title">Hướng dẫn nhanh</h3>
        <ul className="report-tips-list">
          <li>Chụp ảnh rõ khu vực xảy ra sự cố.</li>
          <li>Chọn đúng loại sự cố để dễ xử lý.</li>
          <li>Mô tả ngắn gọn nhưng đủ ý.</li>
          <li>Chọn vị trí chính xác trên bản đồ.</li>
        </ul>
      </div>
    </>
  );
}

export default function ReportPage() {
  return (
    <AppShell
      title="Gửi báo cáo"
      subtitle="Tạo báo cáo sự cố giao thông và hạ tầng đô thị"
      rightPanel={<ReportRightPanel />}
    >
      <ReportForm />
    </AppShell>
  );
}