import { Chip } from "@/components/ui/Chip";
import { dueBadge } from "@/lib/reminders";
import type { ApiTask } from "@/lib/client";

export function DueBadge({
  task,
  today,
}: {
  task: Pick<ApiTask, "status" | "dueDate" | "scheduledFor">;
  today: string;
}) {
  const badge = dueBadge(task, today);
  const tone =
    badge === "Overdue"
      ? "peach"
      : badge === "Today"
        ? "matcha"
        : badge === "Tomorrow"
          ? "butter"
          : badge === "Upcoming"
            ? "lavender"
            : "paper";
  return <Chip tone={tone}>{badge}</Chip>;
}
