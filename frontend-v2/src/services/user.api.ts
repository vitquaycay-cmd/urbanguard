import { getApiBaseUrl } from "@/lib/apiConfig";
import { getStoredAccessToken } from "@/services/auth.api";

function authHeader(): Record<string, string> {
  const token = getStoredAccessToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export type AdminUserRow = {
  id: number;
  email: string;
  username: string | null;
  fullname: string | null;
  role: string;
  reputationScore: number;
  createdAt: string;
  isBanned: boolean;
};

export type UsersListResponse = {
  data: AdminUserRow[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  stats: {
    totalUsers: number;
    activeUsers: number;
    bannedUsers: number;
  };
};

/** GET /api/users (admin only) */
export async function getUsersRequest(params?: {
  page?: number;
  limit?: number;
  role?: string;
  search?: string;
  isBanned?: boolean;
}): Promise<UsersListResponse> {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));
  if (params?.role) query.set("role", params.role);
  if (params?.search) query.set("search", params.search);
  if (typeof params?.isBanned === "boolean") {
    query.set("isBanned", String(params.isBanned));
  }

  const qs = query.toString();
  const res = await fetch(`${getApiBaseUrl()}/api/users${qs ? `?${qs}` : ""}`, {
    headers: authHeader(),
  });
  if (!res.ok) throw new Error("Không thể lấy danh sách users");
  return res.json() as Promise<UsersListResponse>;
}

/** PATCH /api/users/:id/ban */
export async function banUserRequest(userId: number, isBanned: boolean) {
  const res = await fetch(`${getApiBaseUrl()}/api/users/${userId}/ban`, {
    method: "PATCH",
    headers: authHeader(),
    body: JSON.stringify({ isBanned }),
  });
  if (!res.ok) throw new Error("Không thể cập nhật trạng thái tài khoản");
  return res.json() as Promise<{ message: string }>;
}

/** PATCH /api/users/:id/role */
export async function updateRoleRequest(userId: number, role: string) {
  const res = await fetch(`${getApiBaseUrl()}/api/users/${userId}/role`, {
    method: "PATCH",
    headers: authHeader(),
    body: JSON.stringify({ role }),
  });
  if (!res.ok) throw new Error("Không thể cập nhật role");
  return res.json();
}
