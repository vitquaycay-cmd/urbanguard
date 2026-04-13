"use client";

import { AnimatePresence, motion } from "framer-motion";

export type BannerVariant = "warning" | "danger";

const variantClass: Record<BannerVariant, string> = {
  warning:
    "border-amber-200/90 bg-amber-50 text-amber-950 shadow-lg shadow-amber-900/10",
  danger:
    "border-red-200/90 bg-red-50 text-red-950 shadow-lg shadow-red-900/10",
};

export type BannerProps = {
  variant?: BannerVariant;
  /** Hiển thị khi truthy */
  show: boolean;
  children: React.ReactNode;
  className?: string;
  /** Vị trí: map dùng fixed top */
  position?: "static" | "fixed-top";
};

/**
 * Banner cảnh báo — slide down khi xuất hiện (AnimatePresence).
 */
export function Banner({
  variant = "warning",
  show,
  children,
  className = "",
  position = "static",
}: BannerProps) {
  const pos =
    position === "fixed-top"
      ? "fixed left-3 right-3 z-[1100] top-[max(0.75rem,env(safe-area-inset-top,0px))] sm:left-4 sm:right-auto sm:max-w-lg sm:w-[min(100%,28rem)]"
      : "";

  return (
    <AnimatePresence>
      {show ? (
        <motion.div
          role="status"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ type: "spring", stiffness: 380, damping: 28 }}
          className={`rounded-xl border px-4 py-3 text-sm font-medium leading-snug ${variantClass[variant]} ${pos} ${className}`.trim()}
        >
          {children}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
