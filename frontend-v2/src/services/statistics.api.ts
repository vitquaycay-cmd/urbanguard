/**
 * UrbanGuard — Statistics API service (frontend-v2)
 * 🔗 KẾT NỐI: Liên kết các endpoint thống kê từ Backend vào giao diện mới
 */

import { API_URL } from "@/lib/apiConfig";

export type StatsOverview = {
  total: number;
  autoValidatedRate: number;
  byStatus: {
    PENDING: number;
    VALIDATED: number;
    VERIFIED: number;
    RESOLVED: number;
    REJECTED: number;
  };
};

/** 
 * 🔗 KẾT NỐI: GET /api/statistics/overview
 * Lấy tổng quan thống kê báo cáo (số lượng theo status, tỷ lệ auto-validated)
 */
export async function getStatisticsOverview(): Promise<StatsOverview> {
  const res = await fetch(`${API_URL}/api/statistics/overview`, {
    cache: 'no-store'
  });
  if (!res.ok) throw new Error("Không thể tải thống kê tổng quan");
  return res.json();
}

/** 
 * 🔗 KẾT NỐI: GET /api/statistics/heatmap-data
 * Lấy dữ liệu bản đồ nhiệt: mảng các [lat, lng, intensity]
 */
export async function getHeatmapData(): Promise<[number, number, number][]> {
  const res = await fetch(`${API_URL}/api/statistics/heatmap-data`, {
    cache: 'no-store'
  });
  if (!res.ok) throw new Error("Không thể tải dữ liệu heatmap");
  return res.json();
}
