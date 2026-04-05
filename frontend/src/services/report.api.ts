/**
 * API báo cáo sự cố + auth tối thiểu cho luồng gửi nhanh.
 * Backend không đổi: POST /api/reports (multipart), GET /api/reports/active.
 */

import { getApiBaseUrl } from "@/lib/apiConfig";
import { MAP_API_BASE, fetchActiveReports } from "@/lib/mapActiveReports";

export { getApiBaseUrl, MAP_API_BASE, fetchActiveReports };
export { API_URL } from "@/lib/apiConfig";

/** localStorage — JWT sau đăng nhập. */
export const AUTH_TOKEN_KEY = "urbanguard_access_token";

export function getStoredAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setStoredAccessToken(token: string | null): void {
  if (typeof window === "undefined") return;
  if (token) localStorage.setItem(AUTH_TOKEN_KEY, token);
  else localStorage.removeItem(AUTH_TOKEN_KEY);
}

export type LoginResponse = {
  access_token: string;
  user?: { id: number; email: string; role?: string };
};

export async function loginRequest(
  email: string,
  password: string,
  signal?: AbortSignal,
): Promise<LoginResponse> {
  const base = MAP_API_BASE || getApiBaseUrl();
  if (!base) throw new Error("Chưa cấu hình NEXT_PUBLIC_API_URL");
  const res = await fetch(`${base}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email.trim(), password }),
    signal,
  });
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    const msg =
      typeof data.message === "string"
        ? data.message
        : Array.isArray(data.message)
          ? String(data.message[0])
          : `Đăng nhập thất bại (${res.status})`;
    throw new Error(msg);
  }
  const token = data.access_token;
  if (typeof token !== "string" || !token) {
    throw new Error("Phản hồi đăng nhập không hợp lệ");
  }
  return data as LoginResponse;
}

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

function parseErrorMessage(res: Response, data: unknown): string {
  if (data && typeof data === "object" && "message" in data) {
    const m = (data as { message: unknown }).message;
    if (typeof m === "string") return m;
    if (Array.isArray(m) && m[0]) return String(m[0]);
  }
  return `Gửi báo cáo thất bại (${res.status})`;
}

/**
 * POST /api/reports — multipart: title, description, latitude, longitude, image.
 */
export async function createReportRequest(
  accessToken: string,
  payload: CreateReportPayload,
  signal?: AbortSignal,
): Promise<CreateReportResponse> {
  const fd = new FormData();
  fd.append("title", payload.title.trim());
  fd.append("description", payload.description.trim());
  fd.append("latitude", String(payload.latitude));
  fd.append("longitude", String(payload.longitude));
  fd.append("image", payload.image);

  const base = MAP_API_BASE || getApiBaseUrl();
  if (!base) throw new Error("Chưa cấu hình NEXT_PUBLIC_API_URL");
  const res = await fetch(`${base}/api/reports`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
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
