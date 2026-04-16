/**
 * UrbanGuard — Statistics API service
 * Kết nối các endpoint thống kê và dữ liệu heatmap từ Dev C
 */

import { API_BASE } from "./auth.api";

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

/** Lấy tổng quan thống kê báo cáo */
export async function getStatisticsOverview(): Promise<StatsOverview> {
  const res = await fetch(`${API_BASE}/api/statistics/overview`, {
    cache: 'no-store'
  });
  if (!res.ok) throw new Error("Không thể tải thống kê tổng quan");
  return res.json();
}

/** 
 * Lấy dữ liệu heatmap: mảng các [lat, lng, intensity]
 * Intensity thường từ 0 đến 1.0
 */
export async function getHeatmapData(): Promise<[number, number, number][]> {
  const res = await fetch(`${API_BASE}/api/statistics/heatmap-data`, {
    cache: 'no-store'
  });
  if (!res.ok) throw new Error("Không thể tải dữ liệu heatmap");
  return res.json();
}
