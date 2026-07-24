import clsx from "clsx";

export function PriorityDot({
  priority,
}: {
  priority: "low" | "medium" | "high";
}) {
  return (
    <span
      title={priority}
      className={clsx(
        "inline-block h-2.5 w-2.5 rounded-full",
        priority === "high" && "bg-peach-deep",
        priority === "medium" && "bg-butter",
        priority === "low" && "bg-matcha",
      )}
    />
  );
}
