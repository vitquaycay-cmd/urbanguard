import { useState } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import {
  resolveReportImageUrl,
  type ActiveReport,
} from "@/lib/mapActiveReports";
import { voteReportRequest } from "@/services/report.api";

type Props = {
  report: ActiveReport;
};

export function ReportDangerPopup({ report }: Props) {
  const [trustScore, setTrustScore] = useState(report.trustScore);
  const [userVote, setUserVote] = useState(report.userVote);
  const [loading, setLoading] = useState(false);

  const imgUrl = resolveReportImageUrl(report.imageUrl);
  const aiText =
    report.aiLabels && report.aiLabels.length > 0
      ? report.aiLabels.join(", ")
      : "Chưa có nhãn AI";

  const handleVote = async (type: "UPVOTE" | "DOWNVOTE") => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await voteReportRequest(report.id, type);
      setTrustScore(res.trustScore);
      setUserVote(res.userVote);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Không thể bình chọn");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ug-popup">
      <div className="ug-popup__code">Mã báo cáo #{report.id}</div>

      <div className="ug-popup__title">{report.title}</div>

      <div className="ug-popup__badges">
        <span className="ug-popup__badge ug-popup__badge--trust">
          Trust {trustScore}
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

      <div className="ug-popup__actions">
        <button
          className={`ug-btn-vote ug-btn-vote--up ${userVote === 'UPVOTE' ? 'active' : ''}`}
          onClick={() => handleVote('UPVOTE')}
          disabled={loading}
          title="Xác thực sự cố này là thật"
        >
          <ThumbsUp size={16} />
          <span>Xác thực</span>
        </button>

        <button
          className={`ug-btn-vote ug-btn-vote--down ${userVote === 'DOWNVOTE' ? 'active' : ''}`}
          onClick={() => handleVote('DOWNVOTE')}
          disabled={loading}
          title="Báo cáo đây là thông tin giả"
        >
          <ThumbsDown size={16} />
          <span>Báo giả</span>
        </button>
      </div>
    </div>
  );
}
// KẾT NỐI UI: File này hiển thị Popup chi tiết sự cố trên bản đồ, tích hợp nút Xác thực/Báo giả kết nối với API Vote.
