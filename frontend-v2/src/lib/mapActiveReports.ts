import { getApiBaseUrl } from "@/lib/apiConfig";

/** Gốc backend — từ `NEXT_PUBLIC_API_URL` (xem `apiConfig.ts`). */
export const MAP_API_BASE = getApiBaseUrl();

const API_BASE = MAP_API_BASE;

export type ActiveReport = {
  id: number;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  imageUrl: string | null;
  trustScore: number;
  createdAt: string;
  status: string;
  /** Nhãn AI (JSON array từ API), có thể null nếu không có. */
  aiLabels?: string[] | null;
  /** Trạng thái bình chọn của user hiện tại (UPVOTE/DOWNVOTE) */
  userVote?: string | null;
};

function normalizeAiLabels(raw: unknown): string[] | null {
  let labels: string[] = [];
  if (Array.isArray(raw)) {
    labels = raw.filter((x): x is string => typeof x === "string");
  } else if (typeof raw === "string") {
    labels = raw
      .split(/[,;]/)
      .map((s) => s.trim())
      .filter(Boolean);
  } else {
    return null;
  }
  return labels.length > 0 ? labels : null;
}

/** GET /api/reports/active — báo cáo VALIDATED (AI hoặc admin). */
export async function fetchActiveReports(
  signal?: AbortSignal,
): Promise<ActiveReport[]> {
  if (!API_BASE) {
    throw new Error("Chưa cấu hình NEXT_PUBLIC_API_URL");
  }
  const token = localStorage.getItem("urbanguard_access_token");
  const headers: HeadersInit = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/api/reports/active`, {
    cache: "no-store",
    headers,
    signal,
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  const data = (await res.json()) as unknown[];
  if (!Array.isArray(data)) return [];
  return data.map((row) => {
    const o = row as Record<string, unknown>;
    return {
      id: Number(o.id),
      title: String(o.title ?? ""),
      description: String(o.description ?? ""),
      latitude: Number(o.latitude),
      longitude: Number(o.longitude),
      imageUrl:
        o.imageUrl === null || o.imageUrl === undefined
          ? null
          : String(o.imageUrl),
      trustScore: Number(o.trustScore ?? 0),
      createdAt: String(o.createdAt ?? ""),
      status: String(o.status ?? ""),
      aiLabels: normalizeAiLabels(o.aiLabels),
      userVote: o.userVote ? String(o.userVote) : null,
    };
  });
}
// KẾT NỐI API: Phần này dùng để lấy dữ liệu báo cáo từ Backend, hỗ trợ JWT để biết User đã Vote hay chưa.

/** URL ảnh báo cáo đầy đủ cho `<img src>` (popup). */
export function resolveReportImageUrl(path: string | null): string | null {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  if (!MAP_API_BASE) return null;
  return `${MAP_API_BASE}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Nhãn hiển thị cảnh báo: AI labels hoặc tiêu đề báo cáo. */
export function formatIncidentLabel(report: ActiveReport): string {
  if (report.aiLabels && report.aiLabels.length > 0) {
    return report.aiLabels.join(", ");
  }
  return report.title || "sự cố giao thông";
}
