import { addDaysToDateOnly, nextMondayFrom, toDateOnly } from "./dates";

export type ReminderBucket =
  | "overdue"
  | "today"
  | "pending"
  | "later"
  | "unscheduled";

export type ReminderTask = {
  id?: string;
  status: string;
  dueDate?: string | Date | null;
  scheduledFor?: string | Date | null;
};

export function classifyTask(task: ReminderTask, today: string): ReminderBucket {
  if (task.status === "done") {
    return "unscheduled";
  }

  const due = toDateOnly(task.dueDate);
  const scheduled = toDateOnly(task.scheduledFor);

  if (due && due < today) return "overdue";
  if (scheduled === today || due === today) return "today";
  if (scheduled && scheduled < today) return "pending";
  if ((scheduled && scheduled > today) || (due && due > today)) return "later";
  return "unscheduled";
}

export function sortNeedsAttention<T extends ReminderTask>(
  tasks: T[],
  today: string,
): T[] {
  const needs = tasks.filter((t) => {
    const bucket = classifyTask(t, today);
    return bucket === "overdue" || bucket === "pending";
  });

  return needs.sort((a, b) => {
    const aBucket = classifyTask(a, today);
    const bBucket = classifyTask(b, today);
    if (aBucket !== bBucket) {
      return aBucket === "overdue" ? -1 : 1;
    }
    const aDue = toDateOnly(a.dueDate) ?? toDateOnly(a.scheduledFor) ?? "9999";
    const bDue = toDateOnly(b.dueDate) ?? toDateOnly(b.scheduledFor) ?? "9999";
    return aDue.localeCompare(bDue);
  });
}

export function snoozeDates(
  task: ReminderTask,
  days: number,
  today: string,
): { dueDate: string; scheduledFor: string } {
  const due = toDateOnly(task.dueDate);
  const scheduled = toDateOnly(task.scheduledFor);

  if (!due && !scheduled) {
    const next = addDaysToDateOnly(today, days);
    return { dueDate: next, scheduledFor: next };
  }

  return {
    dueDate: due ? addDaysToDateOnly(due, days) : addDaysToDateOnly(today, days),
    scheduledFor: scheduled
      ? addDaysToDateOnly(scheduled, days)
      : addDaysToDateOnly(today, days),
  };
}

export function snoozeUntilNextMonday(
  task: ReminderTask,
  today: string,
): { dueDate: string; scheduledFor: string } {
  const target = nextMondayFrom(today);
  return { dueDate: target, scheduledFor: target };
}

export type DueBadge = "Overdue" | "Today" | "Tomorrow" | "Upcoming" | "No date";

export function dueBadge(task: ReminderTask, today: string): DueBadge {
  const due = toDateOnly(task.dueDate);
  const scheduled = toDateOnly(task.scheduledFor);
  const anchor = due ?? scheduled;
  if (!anchor) return "No date";
  if (anchor < today) return "Overdue";
  if (anchor === today) return "Today";
  const tomorrow = addDaysToDateOnly(today, 1);
  if (anchor === tomorrow) return "Tomorrow";
  return "Upcoming";
}
