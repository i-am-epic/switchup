import clsx from "clsx";
import type { HTMLAttributes } from "react";

export function Card({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={clsx("paper-card p-5", className)} {...props} />;
}
