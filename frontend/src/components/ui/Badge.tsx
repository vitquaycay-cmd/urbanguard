"use client";

import type { ReactNode } from "react";

export type BadgeVariant = "trust" | "ai" | "neutral";

const variantClass: Record<BadgeVariant, string> = {
  trust:
    "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200/80 border border-red-100",
  ai: "bg-amber-50 text-amber-900 ring-1 ring-inset ring-amber-200/80 border border-amber-100",
  neutral: "bg-zinc-100 text-zinc-700 ring-1 ring-inset ring-zinc-200/80",
};

export type BadgeProps = {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
};

/** Badge cho trust score, nhãn AI, hoặc nhãn phụ. */
export function Badge({
  variant = "neutral",
  children,
  className = "",
}: BadgeProps) {
  const base =
    "inline-flex items-center max-w-full rounded-lg px-2.5 py-1 text-xs font-semibold tabular-nums";
  return (
    <span className={`${base} ${variantClass[variant]} ${className}`.trim()}>
      {children}
    </span>
  );
}
