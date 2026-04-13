"use client";

import { Badge } from "@/components/ui/Badge";
import {
  resolveReportImageUrl,
  type ActiveReport,
} from "@/lib/mapActiveReports";
import { motion } from "framer-motion";

type Props = {
  report: ActiveReport;
};

/**
 * Popup marker: card elevated, badge trust / AI, motion fade + slide.
 */
export function ReportDangerPopup({ report }: Props) {
  const imgUrl = resolveReportImageUrl(report.imageUrl);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 420, damping: 32 }}
      className="min-w-[260px] max-w-[300px] rounded-2xl bg-white p-4 shadow-xl ring-1 ring-zinc-200/80"
    >
      <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500 mb-2">
        Mã báo cáo #{report.id}
      </p>
      <h3 className="font-semibold text-base text-zinc-900 leading-snug mb-3">
        {report.title}
      </h3>

      <div className="flex flex-wrap gap-2 mb-3">
        <Badge variant="trust">Trust {report.trustScore}</Badge>
        {report.aiLabels && report.aiLabels.length > 0 ? (
          <Badge variant="ai" className="max-w-full whitespace-normal">
            {report.aiLabels.join(", ")}
          </Badge>
        ) : (
          <Badge variant="neutral">Chưa có nhãn AI</Badge>
        )}
      </div>

      {imgUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imgUrl}
          alt={report.title}
          className="w-full h-40 object-cover rounded-xl mb-3 border border-zinc-200 shadow-sm"
        />
      ) : (
        <p className="text-xs text-zinc-500 mb-3 py-6 text-center rounded-xl bg-zinc-50 border border-dashed border-zinc-200">
          Không có ảnh
        </p>
      )}

      <p className="text-xs text-zinc-700 leading-relaxed whitespace-pre-wrap border-t border-zinc-100 pt-3">
        {report.description}
      </p>
    </motion.div>
  );
}
