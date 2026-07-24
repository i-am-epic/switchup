"use client";

import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

export function Checkbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={checked}
      aria-label={label ?? (checked ? "Mark incomplete" : "Mark complete")}
      onClick={() => onChange(!checked)}
      className={clsx(
        "relative flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border-2 transition",
        checked
          ? "border-matcha-deep bg-matcha text-cream"
          : "border-ink/20 bg-cream hover:border-matcha",
      )}
    >
      <AnimatePresence>
        {checked ? (
          <motion.span
            key="check"
            initial={{ scale: 0.2, opacity: 0, rotate: -20 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0.2, opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 18 }}
            className="text-sm font-black"
          >
            ✓
          </motion.span>
        ) : null}
      </AnimatePresence>
      {checked ? (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-0"
          initial={{ opacity: 0.8, scale: 0.6 }}
          animate={{ opacity: 0, scale: 1.8 }}
          transition={{ duration: 0.45 }}
        >
          <span className="absolute left-1/2 top-0 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-butter" />
          <span className="absolute right-0 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-peach" />
          <span className="absolute bottom-0 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-lavender" />
        </motion.span>
      ) : null}
    </button>
  );
}
