import clsx from "clsx";
import type { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "peach" | "soft";
  size?: "sm" | "md" | "lg";
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: Props) {
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-2xl font-semibold transition duration-200 disabled:opacity-50",
        size === "sm" && "px-3 py-1.5 text-sm",
        size === "md" && "px-4 py-2.5 text-sm",
        size === "lg" && "px-5 py-3 text-base",
        variant === "primary" &&
          "bg-matcha text-cream shadow-[0_4px_0_var(--matcha-deep)] hover:-translate-y-0.5 active:translate-y-0 active:shadow-none",
        variant === "peach" &&
          "bg-peach text-ink shadow-[0_4px_0_var(--peach-deep)] hover:-translate-y-0.5",
        variant === "soft" &&
          "bg-butter/70 text-ink hover:bg-butter",
        variant === "ghost" &&
          "bg-transparent text-ink-soft hover:bg-paper-deep/70",
        className,
      )}
      {...props}
    />
  );
}
