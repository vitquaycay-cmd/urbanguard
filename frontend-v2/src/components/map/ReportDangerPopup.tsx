import {
  resolveReportImageUrl,
  type ActiveReport,
} from "@/lib/mapActiveReports";
import { voteReportRequest } from "@/services/report.api"; // 🔗 KẾT NỐI: Vote API
import { ThumbsUp, ThumbsDown, Loader2 } from "lucide-react"; // 🔗 KẾT NỐI: Icons cho Vote
import { useState } from "react";

type Props = {
  report: ActiveReport;
};

export function ReportDangerPopup({ report }: Props) {
  const [loading, setLoading] = useState<"UPVOTE" | "DOWNVOTE" | null>(null);
  const [localTrust, setLocalTrust] = useState(report.trustScore);
  const [userVote, setUserVote] = useState<"UPVOTE" | "DOWNVOTE" | null>(null); // 🔗 KẾT NỐI: Theo dõi trạng thái đã vote của user

  const imgUrl = resolveReportImageUrl(report.imageUrl);
  const aiText =
    report.aiLabels && report.aiLabels.length > 0
      ? report.aiLabels.join(", ")
      : "Chưa có nhãn AI";

  // 🔗 KẾT NỐI: Hàm xử lý vote
  const handleVote = async (type: "UPVOTE" | "DOWNVOTE") => {
    setLoading(type);
    try {
      const response = (await voteReportRequest(report.id, type)) as any;
      setLocalTrust(response.newTrustScore);
      
      // 🔗 KẾT NỐI: Cập nhật type từ backend (trả về null nếu Toggle OFF)
      setUserVote(response.vote?.type || null);
    } catch (err) {
      console.error("Lỗi khi bình chọn:", err);
      alert(err instanceof Error ? err.message : "Cần đăng nhập để bình chọn");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="ug-popup">
      <div className="ug-popup__code">Mã báo cáo #{report.id}</div>

      <div className="ug-popup__title">{report.title}</div>

      <div className="ug-popup__badges">
        <span className="ug-popup__badge ug-popup__badge--trust">
          Trust {localTrust}
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

      {/* 🔗 KẾT NỐI: Khu vực nút bình chọn */}
      <div className="ug-popup__actions">
        <button 
          className={`ug-btn-vote ug-btn-vote--up ${loading === 'UPVOTE' ? 'ug-btn-vote--loading' : ''} ${userVote === 'UPVOTE' ? 'ug-btn-vote--active' : ''}`}
          onClick={() => handleVote("UPVOTE")}
          disabled={!!loading}
          title="Tin cậy"
        >
          {loading === 'UPVOTE' ? <Loader2 className="ug-icon-spin" size={16} /> : <ThumbsUp size={16} />}
          <span>Xác thực</span>
        </button>

        <button 
          className={`ug-btn-vote ug-btn-vote--down ${loading === 'DOWNVOTE' ? 'ug-btn-vote--loading' : ''} ${userVote === 'DOWNVOTE' ? 'ug-btn-vote--active' : ''}`}
          onClick={() => handleVote("DOWNVOTE")}
          disabled={!!loading}
          title="Báo giả/sai"
        >
          {loading === 'DOWNVOTE' ? <Loader2 className="ug-icon-spin" size={16} /> : <ThumbsDown size={16} />}
          <span>Báo giả</span>
        </button>
      </div>
    </div>
  );
}
