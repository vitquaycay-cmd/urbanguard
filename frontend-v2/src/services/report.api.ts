/**
 * UrbanGuard — Report API service
 * Xử lý: tạo báo cáo, lấy danh sách báo cáo active
 */

import { API_BASE, getStoredAccessToken } from "@/services/auth.api";
import { fetchActiveReports, MAP_API_BASE } from "@/lib/mapActiveReports";

export { MAP_API_BASE, fetchActiveReports };

// ── Types ─────────────────────────────────────────────────────

export type CreateReportPayload = {
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  image: File;
};

export type CreateReportResponse = {
  id: number;
  status: string;
  trustScore?: number;
  title?: string;
  aiLabels?: string[] | null;
};

// ── Helper parse lỗi ──────────────────────────────────────────

function parseErrorMessage(res: Response, data: unknown): string {
  if (data && typeof data === "object" && "message" in data) {
    const m = (data as { message: unknown }).message;
    if (typeof m === "string") return m;
    if (Array.isArray(m) && m[0]) return String(m[0]);
  }
  return `Gửi báo cáo thất bại (${res.status})`;
}

// ── API calls ─────────────────────────────────────────────────

/**
 * POST /api/reports — multipart
 * Tạo báo cáo sự cố mới, cần JWT
 */
export async function createReportRequest(
  payload: CreateReportPayload,
  signal?: AbortSignal,
): Promise<CreateReportResponse> {
  const accessToken = getStoredAccessToken();

  if (!accessToken) throw new Error("Chưa đăng nhập");

  const fd = new FormData();
  fd.append("title", payload.title.trim());
  fd.append("description", payload.description.trim());
  fd.append("latitude", String(payload.latitude));
  fd.append("longitude", String(payload.longitude));
  fd.append("image", payload.image);

  const res = await fetch(`${API_BASE}/api/reports`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: fd,
    signal,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(parseErrorMessage(res, data));
  }

  if (!data || typeof data !== "object") {
    throw new Error("Phản hồi máy chủ không hợp lệ");
  }

  const rawId = (data as { id: unknown }).id;
  const id = typeof rawId === "number" ? rawId : Number(rawId);

  if (!Number.isFinite(id)) {
    throw new Error("Phản hồi máy chủ không hợp lệ");
  }

  return { ...(data as CreateReportResponse), id };
}

/**
 * 🔗 KẾT NỐI: Vote Feature API
 * POST /api/reports/:id/vote
 * Gửi bình chọn UPVOTE/DOWNVOTE, cần JWT.
 */
export async function voteReportRequest(
  reportId: number,
  type: "UPVOTE" | "DOWNVOTE",
  signal?: AbortSignal,
): Promise<{ newTrustScore: number }> {
  const accessToken = getStoredAccessToken();
  if (!accessToken) throw new Error("Chưa đăng nhập");

  const res = await fetch(`${API_BASE}/api/reports/${reportId}/vote`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ type }),
    signal,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(parseErrorMessage(res, data));
  }

  return data as { newTrustScore: number };
}
