/**
 * Gốc URL backend Nest (không có `/api` ở cuối).
 * Đặt trong `.env.local`: `NEXT_PUBLIC_API_URL=http://localhost:3000`
 * Mọi fetch REST/Socket phải dùng giá trị này — không hardcode host trong component.
 */

const DEV_FALLBACK_API_BASE = "http://localhost:3001";

export function getApiBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "").trim();
  if (raw) return raw;

  if (process.env.NODE_ENV === "development") {
    console.warn(
      "[UrbanGuard] NEXT_PUBLIC_API_URL chưa set — tạm dùng backend mặc định",
      DEV_FALLBACK_API_BASE,
      "(thêm frontend/.env.local để chỉ rõ)",
    );
    return DEV_FALLBACK_API_BASE;
  }

  return "";
}

/** Alias dùng trong fetch — cùng nghĩa với `getApiBaseUrl()`. */
export const API_URL = getApiBaseUrl();
