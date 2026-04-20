/**
 * UrbanGuard — Auth API service
 * Xử lý: login, register, refresh token, logout, đổi mật khẩu
 */

/** Base URL từ biến môi trường Vite */
export const API_BASE =
  import.meta.env.VITE_API_URL || "http://localhost:3000";

/** Key lưu access token trong localStorage */
export const AUTH_TOKEN_KEY = "urbanguard_access_token";
/** Key lưu refresh token trong localStorage */
export const REFRESH_TOKEN_KEY = "urbanguard_refresh_token";

// ── Token helpers ─────────────────────────────────────────────

export function getStoredAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setStoredAccessToken(token: string | null): void {
  if (typeof window === "undefined") return;
  if (token) localStorage.setItem(AUTH_TOKEN_KEY, token);
  else localStorage.removeItem(AUTH_TOKEN_KEY);
}

export function getStoredRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setStoredRefreshToken(token: string | null): void {
  if (typeof window === "undefined") return;
  if (token) localStorage.setItem(REFRESH_TOKEN_KEY, token);
  else localStorage.removeItem(REFRESH_TOKEN_KEY);
}

/** Xóa cả 2 token khỏi localStorage */
export function clearStoredTokens(): void {
  setStoredAccessToken(null);
  setStoredRefreshToken(null);
}

/** Alias — cùng clearStoredTokens (dùng key `urbanguard_*`, không phải literal access_token) */
export function removeStoredTokens(): void {
  clearStoredTokens();
}

// ── Types ─────────────────────────────────────────────────────

export type AuthUser = {
  id: number;
  email: string;
  role?: string;
  reputationScore?: number;
};

export type LoginResponse = {
  access_token: string;
  refresh_token: string;
  user: AuthUser;
};

export type RegisterResponse = {
  id: number;
  email: string;
  role: string;
  reputationScore: number;
};

export type RefreshResponse = {
  access_token: string;
  refresh_token: string;
};

/** GET /api/auth/me — user đầy đủ */
export type MeUser = {
  id: number;
  email: string;
  username: string | null;
  fullname: string | null;
  role: string;
  reputationScore: number;
  createdAt: string;
};

// ── Helper parse lỗi ──────────────────────────────────────────

function parseError(res: Response, data: unknown, fallback: string): string {
  if (data && typeof data === "object" && "message" in data) {
    const m = (data as { message: unknown }).message;
    if (typeof m === "string") return m;
    if (Array.isArray(m) && m[0]) return String(m[0]);
  }
  return `${fallback} (${res.status})`;
}

// ── API calls ─────────────────────────────────────────────────

/**
 * GET /api/auth/me
 * Thông tin user hiện tại — cần Bearer access token
 */
export async function getMeRequest(signal?: AbortSignal): Promise<MeUser> {
  const token = getStoredAccessToken();
  if (!token) throw new Error("Chưa đăng nhập");

  const res = await fetch(`${API_BASE}/api/auth/me`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
    signal,
  });

  if (res.status === 401) {
    // 🔗 KẾT NỐI: Nếu server trả về 401, nghĩa là token đã hết hạn hoặc không còn hợp lệ trong DB mới
    // Tự động xoá token để "reset" trạng thái app, tránh treo app vĩnh viễn ở 401
    clearStoredTokens();
    throw new Error("Phiên đăng nhập đã hết hạn");
  }

  if (!res.ok) {
    throw new Error("Không thể lấy thông tin user");
  }

  return (await res.json()) as MeUser;
}

/**
 * POST /api/auth/login
 * Trả về access_token + refresh_token + user
 */
export async function loginRequest(
  email: string,
  password: string,
  signal?: AbortSignal,
): Promise<LoginResponse> {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email.trim(), password }),
    signal,
  });

  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;

  if (!res.ok) {
    throw new Error(parseError(res, data, "Đăng nhập thất bại"));
  }

  if (typeof data.access_token !== "string" || !data.access_token) {
    throw new Error("Phản hồi đăng nhập không hợp lệ");
  }

  return data as unknown as LoginResponse;
}

/**
 * POST /api/auth/register
 * Tạo tài khoản mới
 */
export async function registerRequest(
  email: string,
  password: string,
  fullname: string,
  username: string,
  signal?: AbortSignal,
): Promise<RegisterResponse> {
  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: email.trim(),
      password,
      fullname,
      username,
    }),
    signal,
  });

  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;

  if (!res.ok) {
    throw new Error(parseError(res, data, "Đăng ký thất bại"));
  }

  return data as unknown as RegisterResponse;
}

/**
 * POST /api/auth/refresh
 * Đổi refresh token lấy cặp token mới
 */
export async function refreshTokenRequest(
  refreshToken: string,
  signal?: AbortSignal,
): Promise<RefreshResponse> {
  const res = await fetch(`${API_BASE}/api/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
    signal,
  });

  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;

  if (!res.ok) {
    throw new Error(parseError(res, data, "Làm mới token thất bại"));
  }

  return data as unknown as RefreshResponse;
}

/**
 * POST /api/auth/logout
 * Xóa refresh token khỏi DB
 */
export async function logoutRequest(
  refreshToken: string,
  signal?: AbortSignal,
): Promise<void> {
  const accessToken = getStoredAccessToken();

  await fetch(`${API_BASE}/api/auth/logout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: JSON.stringify({ refreshToken }),
    signal,
  });

  // Xóa token khỏi localStorage dù API thành công hay không
  clearStoredTokens();
}

/**
 * PATCH /api/auth/password
 * Đổi mật khẩu — cần JWT
 */
export async function changePasswordRequest(
  oldPassword: string,
  newPassword: string,
  signal?: AbortSignal,
): Promise<{ message: string }> {
  const accessToken = getStoredAccessToken();

  if (!accessToken) throw new Error("Chưa đăng nhập");

  const res = await fetch(`${API_BASE}/api/auth/password`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ oldPassword, newPassword }),
    signal,
  });

  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;

  if (!res.ok) {
    throw new Error(parseError(res, data, "Đổi mật khẩu thất bại"));
  }

  return data as { message: string };
}
