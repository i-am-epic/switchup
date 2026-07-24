"use client";

import { useCallback, useEffect, useState } from "react";
import { api, type ApiTask } from "@/lib/client";
import { addDaysToDateOnly, getToday, toZonedDateOnly } from "@/lib/dates";
import { AppHeader } from "@/components/shell/AppHeader";
import { PageBlock, PageEnter } from "@/components/ui/PageEnter";
import { Heatmap } from "@/components/calendar/Heatmap";
import { TaskList } from "@/components/tasks/TaskList";
import { EmptyState } from "@/components/ui/EmptyState";

type Log = {
  date: string;
  tasksCompleted: number;
  studyMinutes: number;
};

export default function CalendarPage() {
  const today = getToday();
  const from = addDaysToDateOnly(today, -140);
  const [logs, setLogs] = useState<Log[]>([]);
  const [selected, setSelected] = useState<string | null>(today);
  const [tasks, setTasks] = useState<ApiTask[]>([]);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const [cal, taskData] = await Promise.all([
        api<{ logs: Log[] }>(`/api/calendar?from=${from}&to=${today}`),
        api<{ tasks: ApiTask[] }>("/api/tasks?view=all"),
      ]);
      setLogs(cal.logs);
      setTasks(taskData.tasks);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    }
  }, [from, today]);

  useEffect(() => {
    void load();
  }, [load]);

  const dayTasks = tasks.filter(
    (t) =>
      t.scheduledFor === selected ||
      t.dueDate === selected ||
      (t.completedAt && toZonedDateOnly(t.completedAt) === selected),
  );

  if (error) {
    return (
      <EmptyState
        title="Studio is napping"
        body={error}
        actionLabel="Retry"
        onAction={() => void load()}
      />
    );
  }

  return (
    <PageEnter>
      <PageBlock>
        <AppHeader
          title="Calendar"
          subtitle="Cream-paper heatmap of gentle consistency — tap a day to peek at its tasks."
        />
      </PageBlock>
      <PageBlock className="paper-card p-5">
        <Heatmap
          logs={logs}
          weeks={20}
          selected={selected}
          onSelect={setSelected}
        />
      </PageBlock>
      <PageBlock className="space-y-3">
        <h2 className="font-display text-2xl">{selected ?? "Pick a day"}</h2>
        <TaskList
          tasks={dayTasks}
          today={today}
          onChanged={load}
          emptyTitle="Quiet day"
          emptyBody="No tasks tied to this date."
        />
      </PageBlock>
    </PageEnter>
  );
}
