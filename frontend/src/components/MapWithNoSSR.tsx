"use client";

import dynamic from "next/dynamic";

const ActiveReportsMap = dynamic(() => import("./ActiveReportsMap"), {
  ssr: false,
  loading: () => (
    <p className="p-4 text-zinc-500 text-center">Đang tải bản đồ…</p>
  ),
});

export default function MapWithNoSSR() {
  return <ActiveReportsMap />;
}
