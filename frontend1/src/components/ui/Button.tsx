"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { forwardRef } from "react";

export type ButtonVariant = "primary" | "danger" | "ghost";

const variantClass: Record<ButtonVariant, string> = {
  primary:
    "bg-zinc-900 text-white shadow-md shadow-zinc-900/15 hover:bg-zinc-800 focus-visible:ring-zinc-400/40",
  danger:
    "bg-red-600 text-white shadow-md shadow-red-900/25 hover:bg-red-500 focus-visible:ring-red-400/40",
  ghost:
    "bg-transparent text-zinc-800 hover:bg-zinc-100 focus-visible:ring-zinc-300/50 border border-zinc-200",
};

export type ButtonProps = HTMLMotionProps<"button"> & {
  variant?: ButtonVariant;
};

/**
 * Nút chuẩn UrbanGuard — whileTap scale 0.95 (production / Grab-style).
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { variant = "primary", className = "", disabled, children, ...rest },
    ref,
  ) {
    const base =
      "inline-flex items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold " +
      "outline-none focus-visible:ring-2 focus-visible:ring-offset-2 " +
      "disabled:pointer-events-none disabled:opacity-45 transition-colors";
    return (
      <motion.button
        ref={ref}
        type="button"
        disabled={disabled}
        whileTap={{ scale: disabled ? 1 : 0.95 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className={`${base} ${variantClass[variant]} ${className}`.trim()}
        {...rest}
      >
        {children}
      </motion.button>
    );
  },
);
