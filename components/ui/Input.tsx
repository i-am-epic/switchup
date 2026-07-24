import clsx from "clsx";
import type { InputHTMLAttributes } from "react";

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={clsx(
        "w-full rounded-2xl border border-[var(--line)] bg-cream/80 px-4 py-3 text-ink outline-none transition placeholder:text-ink-soft/50 focus:border-matcha focus:ring-4 focus:ring-matcha/20",
        className,
      )}
      {...props}
    />
  );
}
