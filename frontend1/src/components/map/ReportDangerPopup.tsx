import {
  resolveReportImageUrl,
  type ActiveReport,
} from "@/lib/mapActiveReports";

type Props = {
  report: ActiveReport;
};

export function ReportDangerPopup({ report }: Props) {
  const imgUrl = resolveReportImageUrl(report.imageUrl);
  const aiText =
    report.aiLabels && report.aiLabels.length > 0
      ? report.aiLabels.join(", ")
      : "Chưa có nhãn AI";

  return (
    <div className="ug-popup">
      <div className="ug-popup__code">Mã báo cáo #{report.id}</div>

      <div className="ug-popup__title">{report.title}</div>

      <div className="ug-popup__badges">
        <span className="ug-popup__badge ug-popup__badge--trust">
          Trust {report.trustScore}
        </span>

        <span
          className={`ug-popup__badge ${
            report.aiLabels && report.aiLabels.length > 0
              ? "ug-popup__badge--ai"
              : "ug-popup__badge--neutral"
          }`}
        >
          {aiText}
        </span>
      </div>

      {imgUrl ? (
        <img
          src={imgUrl}
          alt={report.title}
          className="ug-popup__image"
        />
      ) : (
        <div className="ug-popup__empty">Không có ảnh</div>
      )}

      <div className="ug-popup__desc">{report.description}</div>
    </div>
  );
}