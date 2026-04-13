import ReportSidebar from "../components/report/ReportSidebar";
import ReportTopbar from "../components/report/ReportTopbar";
import ReportForm from "../components/report/ReportForm";
import ReportLocationMap from "../components/report/ReportLocationMap";
import "../styles/report.css";

export default function ReportPage() {
  return (
    <div className="report-layout">
      <ReportSidebar />

      <main className="report-main">
        <ReportTopbar />

        <section className="report-content">
          <div className="report-content-left">
            <ReportForm />
          </div>

          <div className="report-content-right">
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
          </div>
        </section>
      </main>
    </div>
  );
}