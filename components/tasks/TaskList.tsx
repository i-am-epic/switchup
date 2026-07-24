"use client";

import type { ApiTask } from "@/lib/client";
import { TaskRow } from "./TaskRow";
import { EmptyState } from "@/components/ui/EmptyState";

export function TaskList({
  tasks,
  today,
  onChanged,
  emptyTitle = "Nothing here yet",
  emptyBody = "Add a task or seed the starter roadmap.",
  showBringToday,
}: {
  tasks: ApiTask[];
  today: string;
  onChanged: () => void;
  emptyTitle?: string;
  emptyBody?: string;
  showBringToday?: boolean;
}) {
  if (tasks.length === 0) {
    return <EmptyState title={emptyTitle} body={emptyBody} />;
  }

  return (
    <div className="flex flex-col gap-2">
      {tasks.map((task) => (
        <TaskRow
          key={task.id}
          task={task}
          today={today}
          onChanged={onChanged}
          showBringToday={showBringToday}
        />
      ))}
    </div>
  );
}
