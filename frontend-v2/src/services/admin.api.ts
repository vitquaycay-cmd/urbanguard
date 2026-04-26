/**
 * UrbanGuard — Admin API service
 * Xử lý các tác quyền của Admin: Quản lý danh sách, duyệt/từ chối/khắc phục, xóa.
 */

import { API_BASE, getStoredAccessToken } from "./auth.api";

export type AdminReportFilters = {
  status?: string;
  page?: number;
  limit?: number;
  search?: string;
};

/**
 * Lấy danh sách toàn bộ báo cáo (Admin)
 * GET /api/reports
 */
export async function fetchAdminReports(filters: AdminReportFilters = {}) {
  const token = getStoredAccessToken();
  if (!token) throw new Error("Chưa đăng nhập Admin");

  const query = new URLSearchParams();
  if (filters.status && filters.status !== 'all') query.append('status', filters.status);
  if (filters.page) query.append('page', String(filters.page));
  if (filters.limit) query.append('limit', String(filters.limit));
  if (filters.search) query.append('search', filters.search);

  const res = await fetch(`${API_BASE}/api/reports?${query.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Không thể tải danh sách báo cáo");
  return res.json(); // Trả về { data, meta }
}

/**
 * Cập nhật trạng thái báo cáo
 * PATCH /api/reports/:id/status
 */
export async function updateReportStatus(id: number, status: 'VALIDATED' | 'REJECTED' | 'RESOLVED') {
  const token = getStoredAccessToken();
  if (!token) throw new Error("Chưa đăng nhập Admin");

  const res = await fetch(`${API_BASE}/api/reports/${id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(data?.message || "Cập nhật trạng thái thất bại");
  }
  return data;
}

/**
 * Xóa báo cáo
 * DELETE /api/reports/:id
 */
export async function deleteReport(id: number) {
  const token = getStoredAccessToken();
  if (!token) throw new Error("Chưa đăng nhập Admin");

  const res = await fetch(`${API_BASE}/api/reports/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.message || "Xóa báo cáo thất bại");
  }
  return true;
}
