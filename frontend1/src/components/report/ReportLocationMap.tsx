export default function ReportLocationMap() {
  return (
    <div className="report-side-card">
      <h3 className="report-side-card-title">📍 Vị trí sự cố</h3>
      <p className="report-side-card-subtitle">
        Sau này sẽ gắn Leaflet map để click chọn vị trí thật.
      </p>

      <div className="report-mini-map">
        <span>Bản đồ chọn vị trí sẽ hiển thị ở đây</span>
      </div>
    </div>
  );
}