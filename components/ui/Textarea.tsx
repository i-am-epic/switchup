import clsx from "clsx";
import type { TextareaHTMLAttributes } from "react";

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={clsx(
        "w-full rounded-2xl border border-[var(--line)] bg-cream/80 px-4 py-3 text-ink outline-none transition placeholder:text-ink-soft/50 focus:border-matcha focus:ring-4 focus:ring-matcha/20",
        className,
      )}
      {...props}
    />
  );
}
