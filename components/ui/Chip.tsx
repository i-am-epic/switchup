import clsx from "clsx";
import type { HTMLAttributes } from "react";

export function Chip({
  className,
  tone = "lavender",
  ...props
}: HTMLAttributes<HTMLSpanElement> & {
  tone?: "lavender" | "butter" | "peach" | "matcha" | "paper";
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold tracking-wide",
        tone === "lavender" && "bg-lavender/50 text-ink",
        tone === "butter" && "bg-butter/70 text-ink",
        tone === "peach" && "bg-peach/60 text-ink",
        tone === "matcha" && "bg-matcha/25 text-matcha-deep",
        tone === "paper" && "bg-paper-deep text-ink-soft",
        className,
      )}
      {...props}
    />
  );
}
