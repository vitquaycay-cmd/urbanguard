"use client";

export type CardProps = {
  children: React.ReactNode;
  className?: string;
  /** Thêm shadow lớn (popup / sheet) */
  elevated?: boolean;
};

/** Card nền trắng — rounded-xl, shadow-md (design system). */
export function Card({
  children,
  className = "",
  elevated = false,
}: CardProps) {
  const shadow = elevated ? "shadow-xl shadow-zinc-900/8" : "shadow-md shadow-zinc-900/6";
  return (
    <div
      className={`rounded-xl border border-zinc-200/90 bg-white ${shadow} ${className}`.trim()}
    >
      {children}
    </div>
  );
}
