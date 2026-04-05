import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Báo cáo sự cố — UrbanGuard",
  description: "Gửi ảnh sự cố giao thông nhanh — UrbanGuard",
};

export default function ReportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
