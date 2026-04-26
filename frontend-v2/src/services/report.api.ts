/**
 * UrbanGuard — Report API service
 * POST /api/reports, GET active, admin list/detail/delete/status
 */

import { getStoredAccessToken } from "@/services/auth.api";
import { fetchActiveReports, MAP_API_BASE } from "@/lib/mapActiveReports";
import { getApiBaseUrl } from "@/lib/apiConfig";

export { MAP_API_BASE, fetchActiveReports };

const apiRoot = () => getApiBaseUrl();

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

export type ReportSortBy = "createdAt" | "trustScore" | "status";
export type ReportSortOrder = "asc" | "desc";

export type ReportUserSnippet = {
  id: number;
  email: string;
  fullname?: string | null;
  username?: string | null;
  reputationScore?: number;
  role?: string;
};

export type ReportDetail = {
  id: number;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  imageUrl: string | null;
  status: string;
  trustScore: number;
  aiSummary?: unknown;
  aiLabels?: unknown;
  createdAt: string;
  userId: number;
  user: ReportUserSnippet;
};

export type PaginatedReports = {
  data: ReportDetail[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export type AdminListReport = ReportDetail;

export type DeleteReportResponse = {
  message: string;
  deletedId: number;
};

export type UpdateReportStatusBody = "VALIDATED" | "REJECTED";

// ── Helper parse lỗi ──────────────────────────────────────────

function parseErrorMessage(res: Response, data: unknown): string {
  if (data && typeof data === "object" && "message" in data) {
    const m = (data as { message: unknown }).message;
    if (typeof m === "string") return m;
    if (Array.isArray(m) && m[0]) return String(m[0]);
  }
  return `Lỗi API (${res.status})`;
}

function authHeaders(): HeadersInit {
  const accessToken = getStoredAccessToken();
  if (!accessToken) throw new Error("Chưa đăng nhập");
  return { Authorization: `Bearer ${accessToken}` };
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
  const fd = new FormData();
  fd.append("title", payload.title.trim());
  fd.append("description", payload.description.trim());
  fd.append("latitude", String(payload.latitude));
  fd.append("longitude", String(payload.longitude));
  fd.append("image", payload.image);

  const res = await fetch(`${apiRoot()}/api/reports`, {
    method: "POST",
    headers: authHeaders(),
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

export type FetchAdminReportsParams = {
  page?: number;
  limit?: number;
  status?: "PENDING" | "VALIDATED" | "REJECTED" | "RESOLVED";
  userId?: number;
  search?: string;
  sortBy?: ReportSortBy;
  sortOrder?: ReportSortOrder;
  signal?: AbortSignal;
};

/** GET /api/reports — chỉ ADMIN; lọc + phân trang + sort */
export async function fetchAdminReports(
  params: FetchAdminReportsParams = {},
): Promise<PaginatedReports> {
  const q = new URLSearchParams();
  if (params.page != null) q.set("page", String(params.page));
  if (params.limit != null) q.set("limit", String(params.limit));
  if (params.status) q.set("status", params.status);
  if (params.userId != null) q.set("userId", String(params.userId));
  if (params.search?.trim()) q.set("search", params.search.trim());
  if (params.sortBy) q.set("sortBy", params.sortBy);
  if (params.sortOrder) q.set("sortOrder", params.sortOrder);

  const res = await fetch(`${apiRoot()}/api/reports?${q}`, {
    headers: { ...authHeaders() },
    signal: params.signal,
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(parseErrorMessage(res, data));
  if (!data || typeof data !== "object" || !Array.isArray((data as PaginatedReports).data)) {
    throw new Error("Phản hồi danh sách báo cáo không hợp lệ");
  }
  return data as PaginatedReports;
}

/** GET /api/admin/reports/pending — FIFO (createdAt ASC), chỉ ADMIN */
export async function fetchPendingReportsQueue(params: {
  page?: number;
  limit?: number;
  signal?: AbortSignal;
}): Promise<PaginatedReports> {
  const q = new URLSearchParams();
  if (params.page != null) q.set("page", String(params.page));
  if (params.limit != null) q.set("limit", String(params.limit));

  const res = await fetch(`${apiRoot()}/api/admin/reports/pending?${q}`, {
    headers: { ...authHeaders() },
    signal: params.signal,
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(parseErrorMessage(res, data));
  if (!data || typeof data !== "object" || !Array.isArray((data as PaginatedReports).data)) {
    throw new Error("Phản hồi hàng chờ PENDING không hợp lệ");
  }
  return data as PaginatedReports;
}

/** GET /api/reports/:id — JWT, đầy đủ báo cáo + user */
export async function fetchReportById(
  id: number,
  signal?: AbortSignal,
): Promise<ReportDetail> {
  const res = await fetch(`${apiRoot()}/api/reports/${id}`, {
    headers: { ...authHeaders() },
    signal,
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(parseErrorMessage(res, data));
  if (!data || typeof data !== "object") {
    throw new Error("Phản hồi chi tiết báo cáo không hợp lệ");
  }
  return data as ReportDetail;
}

/** DELETE /api/reports/:id — chỉ ADMIN; xóa DB + file */
export async function deleteReportRequest(
  id: number,
  signal?: AbortSignal,
): Promise<DeleteReportResponse> {
  const res = await fetch(`${apiRoot()}/api/reports/${id}`, {
    method: "DELETE",
    headers: { ...authHeaders() },
    signal,
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(parseErrorMessage(res, data));
  return data as DeleteReportResponse;
}

/** PATCH /api/reports/:id/status — chỉ ADMIN */
export async function updateReportStatusRequest(
  id: number,
  status: UpdateReportStatusBody,
  signal?: AbortSignal,
): Promise<ReportDetail & { adminAction?: string }> {
  const res = await fetch(`${apiRoot()}/api/reports/${id}/status`, {
    method: "PATCH",
    headers: {
      ...authHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
    signal,
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(parseErrorMessage(res, data));
  if (!data || typeof data !== "object") {
    throw new Error("Phản hồi cập nhật trạng thái không hợp lệ");
  }
  return data as ReportDetail & { adminAction?: string };
}

/** Ảnh `/uploads/...` → URL tuyệt đối phục vụ `<img src>` */
export function resolveReportImageUrl(imageUrl: string | null): string | undefined {
  if (!imageUrl?.trim()) return undefined;
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }
  if (imageUrl.startsWith("/")) {
    return `${apiRoot()}${imageUrl}`;
  }
  return `${apiRoot()}/${imageUrl}`;
}
